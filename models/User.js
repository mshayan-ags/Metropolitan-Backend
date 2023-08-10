const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
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
    flatNo: {
      type: String,
      required: true,
      trim: true,
    },
    otp: {
      type: Number,
      required: true,
      default: 1234,
    },
    notifications: {
      type: Boolean,
      required: true,
      default: true,
    },
    TermsAndConditions: {
      type: Boolean,
      required: true,
      default: false,
    },
    verifiedByAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    Property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
    profilePicture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },
    Event: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Event",
    },
    Review: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Review",
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

module.exports = { User };
