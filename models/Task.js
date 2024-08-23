const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    comments: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    complain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complain",
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    status: {
      type: String,
      enum: ["Pending", "InProgress", "Completed", "Forwarded"],
      default: "Pending",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Task = mongoose.model("Task", TaskSchema);

module.exports = { Task };
