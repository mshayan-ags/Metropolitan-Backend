const mongoose = require("mongoose");
const { PropertySchema } = require("./Property");
const { AdminSchema } = require("./Admin");
const { EventSchema } = require("./Event");

const NotificationSchema = new mongoose.Schema(
  {
    Text: {
      type: String,
      required: true,
      trim: true,
    },
    Property: {
      type: PropertySchema,
    },
    Admin: {
      type: AdminSchema,
    },
    Event: {
      type: EventSchema,
    },
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = { Notification, NotificationSchema };
