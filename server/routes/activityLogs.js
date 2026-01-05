const express = require("express");
const ActivityLog = require("../models/activityLog");
const { authMiddleware, authorize } = require("../middlewares/auth");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorize(["user", "admin"]),
  async (req, res) => {
    try {
      const filter = {};
      if (req.user.role === "user") {
        filter.todoOwner = req.user.userId;
      }

      const logs = await ActivityLog.find(filter)
        .sort({ createdAt: -1 });

      res.json(logs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  }
);

module.exports = router;