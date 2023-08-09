const mongoose = require("mongoose");

const ServiceOfferedSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    Fields: {
      type: [
        new mongoose.Schema({
          name: String,
          type: String,
          pricePerUnit: { type: Number, default: 0 },
          forUser: { type: Boolean, default: false },
        }),
      ],
      required: true,
      trim: true,
    },
    Service: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Service",
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

const ServiceOffered = mongoose.model("ServiceOffered", ServiceOfferedSchema);

module.exports = { ServiceOffered };
