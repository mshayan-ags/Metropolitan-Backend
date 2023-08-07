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
    User: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
    Service: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Service",
    },
    Utility: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Utility",
    },
    Bill: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Bill",
    },
    Image: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Image",
    },
    Review: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Review",
    },
    Notification: {
      type: [mongoose.Schema.Types.ObjectId],
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

const Property = mongoose.model("Property", PropertySchema);

module.exports = { Property };
