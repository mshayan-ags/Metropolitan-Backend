const mongoose = require("mongoose");
const { AdminSchema } = require("./Admin");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    Time: {
      type: String,
      required: true,
      trim: true,
    },
    noSeatsAvailaible: {
      type: Number,
      required: true,
      default: 0,
      unique: true,
    },
    noSeatsLeft: {
      type: Number,
      required: true,
      default: 0,
      unique: true,
    },
    User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    Notification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
    },
    Admin: {
      type: AdminSchema,
    },
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

const Event = mongoose.model("Event", EventSchema);

module.exports = {Event,EventSchema};
