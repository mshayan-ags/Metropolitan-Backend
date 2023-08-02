const mongoose = require("mongoose");
const { PropertySchema } = require("./Property");
const { ServiceSchema } = require("./Service");
const { ServiceOfferedSchema } = require("./ServiceOffered");

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
      type: PropertySchema,
    },
    Service: {
      type: ServiceSchema,
    },
    ServiceOffered: {
      type: ServiceOfferedSchema,
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

module.exports = { Bill, BillSchema };
