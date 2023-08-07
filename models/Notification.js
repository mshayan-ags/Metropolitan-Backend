const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    Text: {
      type: String,
      required: true,
      trim: true,
    },
    Property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
    Admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    Event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = { Notification };
