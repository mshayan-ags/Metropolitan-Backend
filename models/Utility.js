const mongoose = require("mongoose");
const { PropertySchema } = require("./Property");

const UtilitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
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
    Property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
    Image: {
      type: [mongoose.Schema.Types.ObjectId],
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

const Utility = mongoose.model("Utility", UtilitySchema);

module.exports = { Utility };
