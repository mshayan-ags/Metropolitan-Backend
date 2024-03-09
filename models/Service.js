const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
	{
		Number: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			unique: true
		},
		status: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			enum: ["active", "inactive", "canceled", "completed", "delayed", "canceledByUser"]
		},
		reason: {
			type: String,
			trim: true,
			lowercase: true
		},
		description: {
			type: String,
			required: true
		},
		FieldValues: {
			type: Map,
			of: String
		},
		ServiceOffered: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "ServiceOffered"
		},
		Review: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Review"
		},
		Bill: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Bill"
		},
		Property: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Property"
		},
		Admin: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Admin"
		},
		Payment: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Payment"
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

const Service = mongoose.model("Service", ServiceSchema);

module.exports = { Service };
