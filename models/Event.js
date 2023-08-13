const mongoose = require("mongoose");

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
    TotalSeats: {
      type: Number,
      required: true,
      default: 0,
      unique: true,
    },
    noSeatsReserved: {
      type: Number,
      required: true,
      default: 0,
      unique: true,
    },
    User: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
    Notification: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Notification",
    },
    Admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    CoverPhoto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
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

module.exports = { Event };
