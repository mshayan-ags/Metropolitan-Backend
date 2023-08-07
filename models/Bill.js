const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema(
  {
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
    Service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    ServiceOffered: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceOffered",
    },
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

const Bill = mongoose.model("Bill", BillSchema);

module.exports = { Bill };
