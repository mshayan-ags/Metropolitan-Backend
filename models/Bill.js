const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      trim: true,
    },
    Total: {
      type: Number,
      required: true,
      unique: true,
    },
  
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
