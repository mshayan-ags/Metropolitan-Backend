const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
      default: 0,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    Role: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },
    Service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    Event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    Notification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
    },
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = { Admin, AdminSchema };
