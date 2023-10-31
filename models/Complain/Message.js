const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    text: {
      type: String,
      trim: true,
      lowercase: true,
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
    Media: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },
    VoiceNote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },
    Chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

const Message = mongoose.model("Message", MessageSchema);

module.exports = { Message };
