const crypto = require("crypto");
const express = require("express");

const router = express.Router();
const goals = [];
const categories = ["Career", "Health", "Finance", "Personal", "Learning"];
const quarters = ["Q1", "Q2", "Q3", "Q4", "All Year"];
const statuses = ["Not Started", "In Progress", "Achieved", "Deferred"];
const editableFields = [
  "title",
  "description",
  "category",
  "year",
  "quarter",
  "progress",
  "status",
  "milestones"
];

function validateGoalFields(fields, requiredFields = []) {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    return "Request body must be a JSON object";
  }

  for (const field of requiredFields) {
    if (fields[field] === undefined) {
      return `${field} is required`;
    }
  }

  if ("title" in fields && (typeof fields.title !== "string" || !fields.title.trim())) {
    return "title must be a non-empty string";
  }
  if ("category" in fields && !categories.includes(fields.category)) {
    return `category must be one of: ${categories.join(", ")}`;
  }
  if ("year" in fields && (typeof fields.year !== "number" || !Number.isFinite(fields.year))) {
    return "year must be a number";
  }
  if ("quarter" in fields && !quarters.includes(fields.quarter)) {
    return `quarter must be one of: ${quarters.join(", ")}`;
  }
  if ("status" in fields && !statuses.includes(fields.status)) {
    return `status must be one of: ${statuses.join(", ")}`;
  }
  if ("progress" in fields && (
    typeof fields.progress !== "number" ||
    !Number.isFinite(fields.progress) ||
    fields.progress < 0 ||
    fields.progress > 100
  )) {
    return "progress must be a number between 0 and 100";
  }
  if ("description" in fields && typeof fields.description !== "string") {
    return "description must be a string";
  }
  if ("milestones" in fields && (
    !Array.isArray(fields.milestones) ||
    fields.milestones.some((milestone) => typeof milestone !== "string")
  )) {
    return "milestones must be an array of strings";
  }

  return null;
}

router.param("id", (req, res, next, id) => {
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return res.status(400).json({ error: "Invalid goal ID" });
  }
  req.goalId = id.toLowerCase();
  next();
});

router.post("/", (req, res) => {
  const validationError = validateGoalFields(req.body, ["title", "category", "year"]);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const now = new Date();
  const goal = {
    _id: crypto.randomBytes(12).toString("hex"),
    title: req.body.title.trim(),
    description: req.body.description === undefined ? "" : req.body.description,
    category: req.body.category,
    year: req.body.year,
    quarter: req.body.quarter === undefined ? "All Year" : req.body.quarter,
    progress: req.body.progress === undefined ? 0 : req.body.progress,
    status: req.body.status === undefined ? "Not Started" : req.body.status,
    milestones: req.body.milestones === undefined ? [] : req.body.milestones,
    createdAt: now,
    updatedAt: now
  };

  goals.push(goal);
  return res.status(201).json({ goal });
});

router.get("/", (req, res) => {
  const filters = {};
  const { year, quarter, category, status } = req.query;

  if (year !== undefined) {
    const numericYear = Number(year);
    if (!year || !Number.isFinite(numericYear)) {
      return res.status(400).json({ error: "year filter must be a number" });
    }
    filters.year = numericYear;
  }
  if (quarter !== undefined) {
    if (!quarters.includes(quarter)) {
      return res.status(400).json({ error: `quarter must be one of: ${quarters.join(", ")}` });
    }
    filters.quarter = quarter;
  }
  if (category !== undefined) {
    if (!categories.includes(category)) {
      return res.status(400).json({ error: `category must be one of: ${categories.join(", ")}` });
    }
    filters.category = category;
  }
  if (status !== undefined) {
    if (!statuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${statuses.join(", ")}` });
    }
    filters.status = status;
  }

  const filteredGoals = goals.filter((goal) =>
    Object.entries(filters).every(([field, value]) => goal[field] === value)
  );
  return res.json({ goals: filteredGoals });
});

router.get("/:id", (req, res) => {
  const goal = goals.find((item) => item._id === req.goalId);
  if (!goal) {
    return res.status(404).json({ error: "Goal not found" });
  }
  return res.json({ goal });
});

router.patch("/:id/progress", (req, res) => {
  const validationError = validateGoalFields(req.body, ["progress"]);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const goal = goals.find((item) => item._id === req.goalId);
  if (!goal) {
    return res.status(404).json({ error: "Goal not found" });
  }

  goal.progress = req.body.progress;
  goal.status = req.body.progress === 0
    ? "Not Started"
    : req.body.progress === 100
      ? "Achieved"
      : "In Progress";
  goal.updatedAt = new Date();
  return res.json({ goal });
});

router.patch("/:id", (req, res) => {
  const validationError = validateGoalFields(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "At least one field is required" });
  }

  const goal = goals.find((item) => item._id === req.goalId);
  if (!goal) {
    return res.status(404).json({ error: "Goal not found" });
  }

  for (const field of editableFields) {
    if (req.body[field] !== undefined) {
      goal[field] = field === "title" ? req.body[field].trim() : req.body[field];
    }
  }
  goal.updatedAt = new Date();
  return res.json({ goal });
});

router.delete("/:id", (req, res) => {
  const goalIndex = goals.findIndex((item) => item._id === req.goalId);
  if (goalIndex === -1) {
    return res.status(404).json({ error: "Goal not found" });
  }

  const [goal] = goals.splice(goalIndex, 1);
  return res.json({ message: "Goal deleted successfully", goal });
});

module.exports = router;