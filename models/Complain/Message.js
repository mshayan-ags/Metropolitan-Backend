const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
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
