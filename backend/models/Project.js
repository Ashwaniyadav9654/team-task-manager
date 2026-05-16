const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  deadline: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'],
    default: 'Planning'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['Manager', 'Developer', 'Designer', 'Tester', 'Member'],
      default: 'Member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  color: {
    type: String,
    default: '#6366f1'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

// Virtual for task count
projectSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  count: true
});

projectSchema.index({ createdBy: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ status: 1 });

module.exports = mongoose.model('Project', projectSchema);
