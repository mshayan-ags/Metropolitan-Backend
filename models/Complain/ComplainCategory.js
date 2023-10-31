const mongoose = require("mongoose");

const ComplainCateorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    Complain: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Complain",
    },
    Icon: {
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

const ComplainCateory = mongoose.model(
  "ComplainCateory",
  ComplainCateorySchema
);

module.exports = { ComplainCateory };
