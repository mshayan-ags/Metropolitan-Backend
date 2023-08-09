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
      default: 0,
    },
    FieldsOfServiceOffered: {
      type: [
        new mongoose.Schema({
          name: String,
          type: String,
          pricePerUnit: { type: Number, default: 0 },
          forUser: { type: Boolean, default: false },
        }),
      ],
    },
    reasonForDiscount: {
      type: String,
      trim: true,
    },
    Discount: {
      type: Number,
      default: 0,
    },
    TotalAfterDiscount: {
      type: Number,
      default: 0,
    },
    Details: {
      type: Map,
      of: Number,
    },
    AdditionalCharges: {
      type: Map,
      of: Number,
    },
    Property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
    Service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
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
