const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
      trim: true,
    },
    Utility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utility",
    },
    Property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
    Admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    ServiceOffered: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceOffered",
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

const Image = mongoose.model("Image", ImageSchema);

module.exports = { Image };
