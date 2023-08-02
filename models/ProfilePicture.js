const mongoose = require("mongoose");
const { AdminSchema } = require("./Admin");
const { UserSchema } = require("./User");
const { ServiceOfferedSchema } = require("./ServiceOffered");

const ProfilePictureSchema = new mongoose.Schema(
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
    Admin: {
      type: AdminSchema,
    },
    User: {
      type: UserSchema,
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

const ProfilePicture = mongoose.model("ProfilePicture", ProfilePictureSchema);

module.exports = {ProfilePicture,ProfilePictureSchema};
