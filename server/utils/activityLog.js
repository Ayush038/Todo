const ActivityLog = require("../models/activityLog");


const logActivity = async({
  req,
  action,
  todo = null,
  todoOwner = null,
  changes = null
}) => {
  try {
    if (!req || !req.user || !action) return;

    await ActivityLog.create({
      actor: req.user.userId,
      actorRole: req.user.role,
      action,
      todo: todo ? todo._id : null,
      todoOwner,
      changes
    });
  } catch (error) {
    console.error("❌ Activity log failed:", error.message);
  }
};

module.exports = logActivity;
