const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
	{
		isArchived: {
			type: Boolean,
			required: true,
			default: false
		},
		name: {
			type: String,
			required: true,
			trim: true
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			unique: true
		},
		phoneNumber: {
			type: Number,
			required: true,
			default: 0,
			unique: true
		},
		password: {
			type: String,
			required: true,
			trim: true
		},
		Role: {
			type: String,
			required: true,
			enum: ["superadmin", "admin", "manager", "user", "reception"]
		},
		TowerNo: {
			type: Number,
			required: true,
			trim: true
		},
		Responsiblities: {
			type: Map,
			of: Boolean
		},
		profilePicture: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Image"
		},
		Service: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Service"
		},
		Event: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Event"
		},
		Notification: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Notification"
		},
		Complain: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Complain"
		},
		Chat: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Chat"
		},
		Message: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Message"
		},
		Tasks: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Task"
		}
	},
	{
		timestamps: {
			createdAt: "created_at", // Use `created_at` to store the created date
			updatedAt: "updated_at" // and `updated_at` to store the last updated date
		}
	}
);

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = { Admin };
