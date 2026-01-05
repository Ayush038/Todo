const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: { 
      type: String,
      required: true
    },

    description: {
      type: String
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Done"],
      default: "Not Started",
      required: true,
      index: true
    },

    category: {
      type: String,
      enum: ["Bug Fixing", "Developing", "Testing", "Deployment"],
      required: true
    },

    dueDate: {
      type: Date
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Todo", todoSchema);