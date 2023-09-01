const mongoose = require("mongoose");

const ImporterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    shortName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    ntnNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    str_gd: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    ist: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    DataEntry: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "DataEntry",
    },
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

const Importer = mongoose.model("Importer", ImporterSchema);

module.exports = Importer;
