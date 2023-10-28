const mongoose = require("mongoose");

const UserPropertySchema = new mongoose.Schema(
  {
    Type: {
      type: String,
      required: true,
      default: "owner",
    },
    From: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    To: {
      type: String,
      required: false,
      default: Date.now(),
    },
    Property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
    User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

const UserProperty = mongoose.model("UserProperty", UserPropertySchema);

module.exports = { UserProperty };
