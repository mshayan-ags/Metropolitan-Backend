const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    Admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ["Admin"],
    },
    User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    Message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ["Message"],
    },
    Media: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ["Image"],
    },
    Property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
    Complain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complain",
    },
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

const Chat = mongoose.model("Chat", ChatSchema);

module.exports = { Chat };
