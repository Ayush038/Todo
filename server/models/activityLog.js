const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    actorRole: {
      type: String,
      enum: ["user", "admin"],
      required: true
    },

    action: {
      type: String,
      required: true,
      index: true
    },

    todo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Todo",
      default: null
    },

    todoOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },

    changes: {
      before: {
        type: Object,
        default: null
      },
      after: {
        type: Object,
        default: null
      }
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
