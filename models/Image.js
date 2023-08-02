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
    encoding: {
      type: String,
      required: true,
      trim: true,
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

module.exports = Image;
