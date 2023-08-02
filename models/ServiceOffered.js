const mongoose = require("mongoose");
const { ProfilePictureSchema } = require("./ProfilePicture");

const ServiceOfferedSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    Fields: {
      type: [
        new mongoose.Schema({
          name: String,
        }),
      ],
      required: true,
      trim: true,
    },
    Service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    ProfilePicture: {
      type: ProfilePictureSchema,
    },
  },
  {
    timestamps: {
      createdAt: "created_at", // Use `created_at` to store the created date
      updatedAt: "updated_at", // and `updated_at` to store the last updated date
    },
  }
);

const ServiceOffered = mongoose.model("ServiceOffered", ServiceOfferedSchema);

module.exports = {ServiceOffered,ServiceOfferedSchema};
