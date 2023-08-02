const mongoose = require("mongoose");
const { PropertySchema } = require("./Property");
const { UtilitySchema } = require("./Utility");

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
    Utility: {
      type: UtilitySchema,
    },
    Property: {
      type: PropertySchema,
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
