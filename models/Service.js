const mongoose = require("mongoose");
const { ServiceOfferedSchema } = require("./ServiceOffered");
const { ReviewSchema } = require("./Review");
const { PropertySchema } = require("./Property");
const { AdminSchema } = require("./Admin");
const { BillSchema } = require("./Bill");

const ServiceSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    ServiceOffered: {
      type: ServiceOfferedSchema,
    },
    Review: {
      type: ReviewSchema,
    },
    Bill: {
      type: BillSchema,
    },
    Property: {
      type: PropertySchema,
    },
    Admin: {
      type: AdminSchema,
    },
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

const Service = mongoose.model("Service", ServiceSchema);

module.exports = {Service,ServiceSchema};
