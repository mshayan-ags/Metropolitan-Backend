const mongoose = require("mongoose");
const { ServiceSchema } = require("./Service");
const { UserSchema } = require("./User");
const { PropertySchema } = require("./Property");

const ReviewSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    Rating: {
      type: Number,
      required: true,
      default: 0,
    },
    Service: {
      type: ServiceSchema,
    },
    User: {
      type: UserSchema,
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

const Review = mongoose.model("Review", ReviewSchema);

module.exports = {Review,ReviewSchema};
