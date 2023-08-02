const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema(
  {
    noRooms: {
      type: Number,
      required: true,
      default: 0,
    },
    noBathrooms: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

const Property = mongoose.model("Property", PropertySchema);

module.exports = Property;
