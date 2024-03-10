const mongoose = require("mongoose");

const CNICSchema = new mongoose.Schema(
	{
		CNICNumber: {
			type: String,
			required: true,
			unique: true
		},
		FullName: {
			type: String,
			required: true
		},
		DateOfBirth: {
			type: Date,
			required: true
		},
		Gender: {
			type: String,
			required: true,
			enum: ["Male", "Female", "Other"]
		},
		Address: {
			type: String,
			required: true
		},
		phoneNumber: {
			type: String,
			required: false
		},
		Relation: {
			type: String,
			required: true
		},
		Description: {
			type: String,
			required: false
		},
		PassportNo: {
			type: String,
			required: false,
			unique: true
		},
		MaritalStatus: {
			type: String,
			required: false,
			enum: ["Single", "Married", "Divorced", "Widowed"]
		},
		Domicile: {
			type: String,
			required: false
		},
		Nationality: {
			type: String,
			required: true
		},
		Religion: {
			type: String,
			required: false
		},
		Sect: {
			type: String,
			required: false
		},
		User: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		Front: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Image"
		},
		Back: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Image"
		}
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	}
);

const CNIC = mongoose.model("CNIC", CNICSchema);

module.exports = { CNIC };
