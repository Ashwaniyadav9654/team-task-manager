const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Alex Johnson',
      email: 'admin@test.com',
      password: 'Password@123',
      role: 'Admin',
      bio: 'Project lead and team coordinator'
    });

    const member1 = await User.create({
      name: 'Sarah Chen',
      email: 'member@test.com',
      password: 'Password@123',
      role: 'Member',
      bio: 'Frontend developer'
    });

    const member2 = await User.create({
      name: 'Marcus Williams',
      email: 'marcus@test.com',
      password: 'Password@123',
      role: 'Member',
      bio: 'Backend developer'
    });

    console.log('Created users');

    // Create projects
    const project1 = await Project.create({
      title: 'E-Commerce Platform Redesign',
      description: 'Complete overhaul of the e-commerce platform with modern UI/UX, improved performance, and new features.',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Active',
      priority: 'High',
      color: '#6366f1',
      tags: ['React', 'Node.js', 'Design'],
      createdBy: admin._id,
      members: [
        { user: admin._id, role: 'Manager' },
        { user: member1._id, role: 'Developer' },
        { user: member2._id, role: 'Developer' }
      ]
    });

    const project2 = await Project.create({
      title: 'Mobile App Development',
      description: 'Building a cross-platform mobile app for customer engagement.',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: 'Planning',
      priority: 'Medium',
      color: '#8b5cf6',
      tags: ['React Native', 'Mobile'],
      createdBy: admin._id,
      members: [
        { user: admin._id, role: 'Manager' },
        { user: member1._id, role: 'Designer' }
      ]
    });

    const project3 = await Project.create({
      title: 'API Integration Suite',
      description: 'Integrating third-party APIs for payment, shipping, and analytics.',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'Active',
      priority: 'High',
      color: '#10b981',
      tags: ['API', 'Backend', 'Integration'],
      createdBy: admin._id,
      members: [
        { user: admin._id, role: 'Manager' },
        { user: member2._id, role: 'Developer' }
      ]
    });

    console.log('Created projects');

    // Create tasks
    const tasks = [
      { title: 'Design new homepage wireframes', description: 'Create wireframes for the new homepage layout with improved UX.', project: project1._id, assignedTo: member1._id, priority: 'High', status: 'Completed', dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), createdBy: admin._id },
      { title: 'Implement authentication system', description: 'Build JWT-based auth with refresh tokens.', project: project1._id, assignedTo: member2._id, priority: 'High', status: 'Completed', dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), createdBy: admin._id },
      { title: 'Product catalog UI components', description: 'Build reusable React components for product listings.', project: project1._id, assignedTo: member1._id, priority: 'Medium', status: 'In Progress', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdBy: admin._id },
      { title: 'Shopping cart functionality', description: 'Implement cart with local storage persistence.', project: project1._id, assignedTo: member2._id, priority: 'High', status: 'In Progress', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), createdBy: admin._id },
      { title: 'Payment gateway integration', description: 'Integrate Stripe for payment processing.', project: project1._id, assignedTo: member2._id, priority: 'High', status: 'Todo', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), createdBy: admin._id },
      { title: 'Responsive design implementation', description: 'Ensure full mobile responsiveness across all pages.', project: project1._id, assignedTo: member1._id, priority: 'Medium', status: 'Todo', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), createdBy: admin._id },
      { title: 'App architecture planning', description: 'Define component hierarchy and state management strategy.', project: project2._id, assignedTo: admin._id, priority: 'High', status: 'Completed', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), createdBy: admin._id },
      { title: 'UI mockups for mobile app', description: 'Create high-fidelity mockups for all screens.', project: project2._id, assignedTo: member1._id, priority: 'Medium', status: 'In Progress', dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), createdBy: admin._id },
      { title: 'Setup CI/CD pipeline', description: 'Configure automated testing and deployment.', project: project3._id, assignedTo: member2._id, priority: 'High', status: 'Todo', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), createdBy: admin._id },
      { title: 'Overdue: Performance audit', description: 'Audit current performance metrics.', project: project3._id, assignedTo: member2._id, priority: 'High', status: 'Todo', dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), createdBy: admin._id }
    ];

    for (const task of tasks) {
      const t = await Task.create({
        ...task,
        activity: [{ user: admin._id, action: 'created this task' }]
      });
      if (t.status === 'Completed') {
        t.completedAt = new Date();
        await t.save();
      }
    }

    console.log('Created tasks');
    console.log('\n✅ Seed completed successfully!');
    console.log('\nDemo credentials:');
    console.log('Admin: admin@test.com / Password@123');
    console.log('Member: member@test.com / Password@123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
