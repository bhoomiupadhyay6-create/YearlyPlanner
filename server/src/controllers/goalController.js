const Goal = require('../models/Goal');

function normalizeQuarter(value) {
  if (value === undefined || value === null || value === '') return 'All Year';
  const text = String(value).trim();
  if (['Q1', 'Q2', 'Q3', 'Q4', 'All Year'].includes(text)) return text;
  if (['1', '2', '3', '4'].includes(text)) return `Q${text}`;
  return 'All Year';
}

function normalizeStatus(value) {
  if (value === undefined || value === null || value === '') return 'Not Started';
  const text = String(value).trim();
  if (['Not Started', 'In Progress', 'Achieved', 'Deferred'].includes(text)) return text;
  return 'Not Started';
}

function normalizeGoalInput(payload = {}) {
  const next = { ...payload };

  if (next.category === 'Personal' || next.category === 'Learning') {
    next.category = next.category;
  }

  if (next.status === undefined && next.progressStatus !== undefined) {
    next.status = next.progressStatus;
  }

  if (next.quarter === undefined && next.targetQuarter !== undefined) {
    next.quarter = normalizeQuarter(next.targetQuarter);
  }

  next.quarter = normalizeQuarter(next.quarter);
  next.status = normalizeStatus(next.status);
  next.progress = Number.isFinite(Number(next.progress)) ? Number(next.progress) : 0;
  next.progress = Math.min(100, Math.max(0, next.progress));

  if (!Array.isArray(next.milestones)) {
    const milestoneText = typeof next.milestones === 'string' ? next.milestones : '';
    next.milestones = milestoneText
      .split(/\r?\n|[,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (!next.description) next.description = '';

  return next;
}

function sanitizeGoal(goal) {
  const plainGoal = goal.toObject ? goal.toObject() : { ...goal };
  return {
    ...plainGoal,
    quarter: normalizeQuarter(plainGoal.quarter || plainGoal.targetQuarter),
    status: normalizeStatus(plainGoal.status || plainGoal.progressStatus),
    progress: Number(plainGoal.progress || 0),
    milestones: Array.isArray(plainGoal.milestones) ? plainGoal.milestones : []
  };
}

exports.createGoal = async (req, res) => {
  try {
    const data = normalizeGoalInput(req.body);
    const goal = new Goal(data);
    await goal.save();
    res.status(201).json({ goal: sanitizeGoal(goal) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.find().sort({ createdAt: -1 });
    res.status(200).json({ goals: goals.map(sanitizeGoal) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGoalById = async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.status(200).json({ goal: sanitizeGoal(goal) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const data = normalizeGoalInput(req.body);
    const goal = await Goal.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.status(200).json({ goal: sanitizeGoal(goal) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findByIdAndDelete(id);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.status(200).json({ success: true, goal: sanitizeGoal(goal) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateGoalProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const progress = Number(req.body.progress);
    if (!Number.isFinite(progress)) {
      return res.status(400).json({ error: 'Progress must be a number between 0 and 100' });
    }

    const normalizedProgress = Math.min(100, Math.max(0, progress));
    const goal = await Goal.findByIdAndUpdate(
      id,
      { progress: normalizedProgress },
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.status(200).json({ goal: sanitizeGoal(goal) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getGoalsByYearAndQuarter = async (req, res) => {
  try {
    const { year, quarter } = req.params;
    const goals = await Goal.find({ year, quarter: normalizeQuarter(quarter) });
    res.status(200).json({ goals: goals.map(sanitizeGoal) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};