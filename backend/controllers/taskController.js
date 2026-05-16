const Task = require('../models/Task');
const Project = require('../models/Project');

const canAccessProject = async (userId, userRole, projectId) => {
  if (userRole === 'Admin') return true;
  const project = await Project.findById(projectId);
  if (!project) return false;
  return (
    project.createdBy.toString() === userId.toString() ||
    project.members.some(m => m.user.toString() === userId.toString())
  );
};

exports.getTasks = async (req, res) => {
  try {
    const { project, status, priority, assignedTo, search, sort = '-createdAt', overdue } = req.query;
    let query = {};

    if (req.user.role !== 'Admin') {
      const userProjects = await Project.find({
        $or: [{ createdBy: req.user._id }, { 'members.user': req.user._id }]
      }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      query.project = { $in: projectIds };
    }

    if (project) query.project = project;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: 'Completed' };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'title color')
      .populate('comments.user', 'name email avatar')
      .sort(sort);

    res.json({ tasks, count: tasks.length });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role')
      .populate('project', 'title color members createdBy')
      .populate('comments.user', 'name email avatar')
      .populate('activity.user', 'name email avatar');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const hasAccess = await canAccessProject(req.user._id, req.user.role, task.project._id);
    if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch task' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate, tags, status } = req.body;

    if (!project) return res.status(400).json({ message: 'Project is required' });

    const hasAccess = await canAccessProject(req.user._id, req.user.role, project);
    if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: assignedTo || null,
      priority: priority || 'Medium',
      dueDate,
      tags: tags || [],
      status: status || 'Todo',
      createdBy: req.user._id,
      activity: [{
        user: req.user._id,
        action: 'created this task'
      }]
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'title color');

    res.status(201).json({ message: 'Task created successfully', task: populated });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const hasAccess = await canAccessProject(req.user._id, req.user.role, task.project);
    if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

    // Members can only update status
    if (req.user.role === 'Member') {
      const project = await Project.findById(task.project);
      const isCreator = project?.createdBy.toString() === req.user._id.toString();
      if (!isCreator) {
        const allowedFields = ['status'];
        const requestedFields = Object.keys(req.body);
        const hasDisallowed = requestedFields.some(f => !allowedFields.includes(f));
        if (hasDisallowed) {
          return res.status(403).json({ message: 'Members can only update task status' });
        }
      }
    }

    // Track activity
    const activityLog = [];
    const trackFields = ['status', 'priority', 'assignedTo', 'dueDate', 'title'];
    trackFields.forEach(field => {
      if (req.body[field] !== undefined && String(task[field]) !== String(req.body[field])) {
        activityLog.push({
          user: req.user._id,
          action: `updated ${field}`,
          field,
          oldValue: String(task[field] || ''),
          newValue: String(req.body[field])
        });
      }
    });

    const updates = { ...req.body };
    if (activityLog.length > 0) {
      updates.$push = { activity: { $each: activityLog } };
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'title color')
      .populate('comments.user', 'name email avatar')
      .populate('activity.user', 'name email avatar');

    res.json({ message: 'Task updated', task: updated });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'Admin') {
      const project = await Project.findById(task.project);
      const isCreator = project?.createdBy.toString() === req.user._id.toString();
      const isTaskCreator = task.createdBy.toString() === req.user._id.toString();
      if (!isCreator && !isTaskCreator) {
        return res.status(403).json({ message: 'Not authorized to delete this task' });
      }
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const hasAccess = await canAccessProject(req.user._id, req.user.role, task.project);
    if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

    task.comments.push({ user: req.user._id, text: text.trim() });
    task.activity.push({ user: req.user._id, action: 'added a comment' });
    await task.save();

    const updated = await Task.findById(task._id)
      .populate('comments.user', 'name email avatar')
      .populate('activity.user', 'name email avatar');

    res.status(201).json({
      message: 'Comment added',
      comments: updated.comments,
      activity: updated.activity
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment' });
  }
};
