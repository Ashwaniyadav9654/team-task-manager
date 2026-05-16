const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'Admin';

    let projectQuery = {};
    let taskQuery = {};

    if (!isAdmin) {
      const userProjects = await Project.find({
        $or: [{ createdBy: userId }, { 'members.user': userId }]
      }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      projectQuery._id = { $in: projectIds };
      taskQuery.project = { $in: projectIds };
    }

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      totalUsers,
      recentTasks,
      recentProjects,
      tasksByStatus,
      tasksByPriority
    ] = await Promise.all([
      Project.countDocuments(projectQuery),
      Project.countDocuments({ ...projectQuery, status: 'Active' }),
      Project.countDocuments({ ...projectQuery, status: 'Completed' }),
      Task.countDocuments(taskQuery),
      Task.countDocuments({ ...taskQuery, status: 'Completed' }),
      Task.countDocuments({ ...taskQuery, status: 'In Progress' }),
      Task.countDocuments({ ...taskQuery, status: 'Todo' }),
      Task.countDocuments({ ...taskQuery, dueDate: { $lt: new Date() }, status: { $ne: 'Completed' } }),
      isAdmin ? User.countDocuments({ isActive: true }) : Promise.resolve(null),
      Task.find({ ...taskQuery, ...(isAdmin ? {} : { $or: [{ assignedTo: userId }, { createdBy: userId }] }) })
        .populate('project', 'title color')
        .populate('assignedTo', 'name avatar')
        .sort('-createdAt')
        .limit(8)
        .lean(),
      Project.find(projectQuery)
        .populate('createdBy', 'name avatar')
        .sort('-createdAt')
        .limit(5)
        .lean(),
      Task.aggregate([
        { $match: taskQuery },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $match: taskQuery },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    // Monthly task completion data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Task.aggregate([
      { $match: { ...taskQuery, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = monthlyData.map(d => ({
      month: months[d._id.month - 1],
      total: d.total,
      completed: d.completed
    }));

    res.json({
      stats: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        overdueTasks,
        totalUsers,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      recentTasks,
      recentProjects,
      tasksByStatus,
      tasksByPriority,
      chartData
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
};
