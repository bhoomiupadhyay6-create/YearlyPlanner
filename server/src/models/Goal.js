const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['Career', 'Health', 'Finance', 'Personal', 'Learning'], required: true },
  year: { type: Number, required: true },
  quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4', 'All Year'], default: 'All Year' },
  status: { type: String, enum: ['Not Started', 'In Progress', 'Achieved', 'Deferred'], default: 'Not Started' },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  milestones: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);