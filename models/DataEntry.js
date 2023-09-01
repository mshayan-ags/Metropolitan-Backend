const mongoose = require("mongoose");

const DataEntrySchema = new mongoose.Schema(
  {
    IC: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    SAP: {
      type: String,
      required: true,
      trim: true,
    },
    INB: {
      type: String,
      required: true,
    },
    BL: {
      type: String,
      required: true,
      trim: true,
    },
    Weight: {
      type: String,
      required: true,
      trim: true,
    },
    Package: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    Supplier: {
      type: String,
      required: true,
      trim: true,
    },
    Description: {
      type: String,
      required: true,
    },
    Inv: {
      type: String,
      required: true,
      trim: true,
    },
    ShippingPort: {
      type: String,
      required: true,
      trim: true,
    },
    ShippingLine: {
      type: String,
      required: true,
    },
    BLDate: {
      type: String,
      required: true,
      trim: true,
    },
    Terminal: {
      type: String,
      required: true,
      trim: true,
    },
    DocreeDate: {
      type: String,
      required: true,
    },
    ShipBy: {
      type: String,
      required: true,
      trim: true,
    },
    TypeOfDocument: {
      type: String,
      required: true,
      trim: true,
    },
    Importer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Importer",
    },
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

const DataEntry = mongoose.model("DataEntry", DataEntrySchema);

module.exports = DataEntry;
