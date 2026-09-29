const express = require("express");
const mongoose = require("mongoose");
const Goal = require("../models/Goals");

const router = express.Router();

const categories = ["Career", "Health", "Finance", "Personal", "Learning"];
const quarters = ["Q1", "Q2", "Q3", "Q4", "All Year"];
const statuses = ["Not Started", "In Progress", "Achieved", "Deferred"];

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

function sendError(res, error) {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ error: error.message });
  }
  return res.status(500).json({ error: "Internal server error" });
}

router.param("id", (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid goal ID" });
  }
  next();
});

router.post("/", async (req, res) => {
  const validationError = validateGoalFields(req.body, ["title", "category", "year"]);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const goal = await Goal.create(req.body);
    return res.status(201).json({ goal });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get("/", async (req, res) => {
  const filter = {};
  const { year, quarter, category, status } = req.query;

  if (year !== undefined) {
    const numericYear = Number(year);
    if (!year || !Number.isFinite(numericYear)) {
      return res.status(400).json({ error: "year filter must be a number" });
    }
    filter.year = numericYear;
  }
  if (quarter !== undefined) {
    if (!quarters.includes(quarter)) {
      return res.status(400).json({ error: `quarter must be one of: ${quarters.join(", ")}` });
    }
    filter.quarter = quarter;
  }
  if (category !== undefined) {
    if (!categories.includes(category)) {
      return res.status(400).json({ error: `category must be one of: ${categories.join(", ")}` });
    }
    filter.category = category;
  }
  if (status !== undefined) {
    if (!statuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${statuses.join(", ")}` });
    }
    filter.status = status;
  }

  try {
    const goals = await Goal.find(filter);
    return res.json({ goals });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    return res.json({ goal });
  } catch (error) {
    return sendError(res, error);
  }
});

router.patch("/:id/progress", async (req, res) => {
  const validationError = validateGoalFields(req.body, ["progress"]);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const status = req.body.progress === 0
    ? "Not Started"
    : req.body.progress === 100
      ? "Achieved"
      : "In Progress";

  try {
    const goal = await Goal.findByIdAndUpdate(
      req.params.id,
      { progress: req.body.progress, status },
      { new: true, runValidators: true }
    );
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    return res.json({ goal });
  } catch (error) {
    return sendError(res, error);
  }
});

router.patch("/:id", async (req, res) => {
  const validationError = validateGoalFields(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "At least one field is required" });
  }

  try {
    const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    return res.json({ goal });
  } catch (error) {
    return sendError(res, error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const goal = await Goal.findByIdAndDelete(req.params.id);
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    return res.json({ message: "Goal deleted successfully", goal });
  } catch (error) {
    return sendError(res, error);
  }
});

module.exports = router;