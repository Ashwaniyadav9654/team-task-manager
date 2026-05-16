const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

exports.getProjects = async (req, res) => {
  try {
    const { status, search, sort = '-createdAt' } = req.query;
    let query = {};

    if (req.user.role !== 'Admin') {
      query.$or = [
        { createdBy: req.user._id },
        { 'members.user': req.user._id }
      ];
    }

    if (status) query.status = status;
    if (search) {
      query.$or = [
        ...(query.$or || []),
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort(sort)
      .lean();

    // Add task counts
    const projectIds = projects.map(p => p._id);
    const taskCounts = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$project', total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } } } }
    ]);

    const countMap = {};
    taskCounts.forEach(t => { countMap[t._id.toString()] = t; });

    const enriched = projects.map(p => ({
      ...p,
      taskStats: countMap[p._id.toString()] || { total: 0, completed: 0 }
    }));

    res.json({ projects: enriched, count: enriched.length });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email avatar role')
      .populate('members.user', 'name email avatar role');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = req.user.role === 'Admin' ||
      project.createdBy._id.toString() === req.user._id.toString() ||
      project.members.some(m => m.user._id.toString() === req.user._id.toString());

    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort('-createdAt');

    res.json({ project, tasks });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { title, description, deadline, status, priority, members, color, tags } = req.body;

    const project = await Project.create({
      title,
      description,
      deadline,
      status: status || 'Planning',
      priority: priority || 'Medium',
      color: color || '#6366f1',
      tags: tags || [],
      createdBy: req.user._id,
      members: members ? members.map(id => ({ user: id })) : []
    });

    // Add creator as member if not already
    const creatorInMembers = project.members.some(
      m => m.user.toString() === req.user._id.toString()
    );
    if (!creatorInMembers) {
      project.members.push({ user: req.user._id, role: 'Manager' });
      await project.save();
    }

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(201).json({ message: 'Project created successfully', project: populated });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role !== 'Admin' && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const updates = req.body;
    if (updates.members) {
      updates.members = updates.members.map(id => typeof id === 'object' ? id : { user: id });
    }

    const updated = await Project.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({ message: 'Project updated', project: updated });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role !== 'Admin' && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project and associated tasks deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role !== 'Admin' && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const alreadyMember = project.members.some(m => m.user.toString() === userId);
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });

    project.members.push({ user: userId, role: role || 'Member' });
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({ message: 'Member added successfully', project: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add member' });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role !== 'Admin' && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({ message: 'Member removed', project: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove member' });
  }
};
