const express = require("express");
const Todo = require("../models/todo");
const { authMiddleware, authorize } = require("../middlewares/auth");
const logActivity = require("../utils/activityLog");
const router = express.Router();

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const STATUS = ["Not Started", "In Progress", "Done"];
const CATEGORIES = ["Bug Fixing", "Developing", "Testing", "Deployment"];

/* ---------------- CREATE TODO ---------------- */
router.post("/", authMiddleware, authorize(["user", "admin"]), async (req, res) => {
  try {
    const { title, description, priority, status, category, dueDate, assignedTo } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: "Title and category are required" });
    }

    if (priority && !PRIORITIES.includes(priority)) {
      return res.status(400).json({ message: "Invalid priority" });
    }

    if (status && !STATUS.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    let assignee = req.user.userId;
    if (req.user.role === "admin" && assignedTo) {
      assignee = assignedTo;
    }

    const todo = await Todo.create({
      title,
      description,
      priority: priority || "Medium",
      status: status || "Not Started",
      category,
      dueDate,
      createdBy: req.user.userId,
      assignedTo: assignee,
      lastEditedBy: req.user.userId
    });

    logActivity({
      req,
      action: "TODO_CREATED",
      todo,
      todoOwner: assignee
    });

    const populatedTodo = await Todo.findById(todo._id)
      .populate("createdBy", "name")
      .populate("assignedTo", "name")
      .populate("lastEditedBy", "name");

    res.status(201).json(populatedTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------- GET TODOS ---------------- */
router.get("/", authMiddleware, authorize(["user", "admin"]), async (req, res) => {
  try {
    const { assignedTo, status, priority } = req.query;
    const filter = {};

    if (req.user.role === "user") {
      filter.assignedTo = req.user.userId;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const todos = await Todo.find(filter)
      .populate("createdBy", "name")
      .populate("assignedTo", "name")
      .populate("lastEditedBy", "name")
      .sort({ createdAt: -1 });

    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------- MARK ALL COMPLETED ---------------- */
router.put("/mark-all-completed", authMiddleware, authorize(["user", "admin"]), async (req, res) => {
  try {
    const filter = { status: { $ne: "Done" } };

    if (req.user.role === "user") {
      filter.assignedTo = req.user.userId;
    }

    await Todo.updateMany(filter, {
      status: "Done",
      lastEditedBy: req.user.userId
    });

    logActivity({
      req,
      action: "MARK_ALL_COMPLETED",
      todo: null,
      todoOwner: req.user.role === "user" ? req.user.userId : null,
      changes: {
        after: { status: "Done" }
      }
    });

    res.json({ message: "All tasks marked as completed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update tasks" });
  }
});

/* ---------------- GET SINGLE TODO ---------------- */
router.get("/:id", authMiddleware, authorize(["user", "admin"]), async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id)
      .populate("createdBy", "name")
      .populate("assignedTo", "name")
      .populate("lastEditedBy", "name");

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", authMiddleware, authorize(["user", "admin"]), async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    const beforeState = {
      status: todo.status,
      assignedTo: todo.assignedTo?.toString(),
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      category: todo.category,
      dueDate: todo.dueDate
    };

    const isAdmin = req.user.role === "admin";
    const userId = req.user.userId;

    if (!isAdmin) {
        const allowedForCreator = ["status", "priority", "dueDate"];
        const isCreator = todo.createdBy.toString() === req.user.userId;

        const bodyKeys = Object.keys(req.body);
        const invalid = bodyKeys.some(
            key => !(isCreator && allowedForCreator.includes(key)) && key !== "status"
        );

        if (invalid) {
            return res.status(403).json({ message: "You are not allowed to edit this todo" });
        }
    }

    const { title, description, priority, status, category, dueDate, assignedTo } = req.body;

    if (status && !["Not Started", "In Progress", "Done"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (isAdmin) {
      if (title !== undefined) todo.title = title;
      if (description !== undefined) todo.description = description;
      if (priority !== undefined) todo.priority = priority;
      if (status !== undefined) todo.status = status;
      if (category !== undefined) todo.category = category;
      if (dueDate !== undefined) todo.dueDate = dueDate;
      if (assignedTo !== undefined) todo.assignedTo = assignedTo;
    } else {
      if (status !== undefined) todo.status = status;
    }

    todo.lastEditedBy = userId;
    await todo.save();

    const changes = { before: {}, after: {} };
    let action = null;

    if (beforeState.status !== todo.status) {
      action = "STATUS_CHANGED";
      changes.before.status = beforeState.status;
      changes.after.status = todo.status;
    }

    else if (
      beforeState.assignedTo &&
      todo.assignedTo &&
      beforeState.assignedTo !== todo.assignedTo.toString()
    ) {
      action = "TODO_ASSIGNED";
      changes.before.assignedTo = beforeState.assignedTo;
      changes.after.assignedTo = todo.assignedTo.toString();
    }

    else {
      const fields = ["title", "description", "priority", "category", "dueDate"];

      fields.forEach(field => {
        if (
          beforeState[field]?.toString() !==
          todo[field]?.toString()
        ) {
          changes.before[field] = beforeState[field];
          changes.after[field] = todo[field];
        }
      });

      if (Object.keys(changes.before).length > 0) {
        action = "TODO_UPDATED";
      }
    }

    if (action) {
      logActivity({
        req,
        action,
        todo,
        todoOwner: todo.assignedTo,
        changes
      });
    }

    const populatedTodo = await Todo.findById(todo._id)
      .populate("createdBy", "name")
      .populate("assignedTo", "name")
      .populate("lastEditedBy", "name");

    res.json(populatedTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------- DELETE TODO ---------------- */
router.delete("/:id", authMiddleware, authorize(["user", "admin"]), async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    if (req.user.role === "user" && todo.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }
    const todoOwner = todo.assignedTo;

    await todo.deleteOne();
      logActivity({
      req,
      action: "TODO_DELETED",
      todo,
      todoOwner
    });
    res.json({ message: "Todo deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
