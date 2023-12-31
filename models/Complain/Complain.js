const mongoose = require("mongoose");

const ComplainSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    VoiceNote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },
    ComplainCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ComplainCategory",
    },
    Property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
    Admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    Chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    Review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
    Bill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
    },
    Payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    Tasks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Task",
    },
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

const Complain = mongoose.model("Complain", ComplainSchema);

module.exports = { Complain };
