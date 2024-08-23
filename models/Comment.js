const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    text: {
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
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = { Comment };
