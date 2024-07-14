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
		},
		Gender: {
			type: String,
			enum: ["Male", "Female", "Other"]
		},
		Address: {
			type: String,
		},
		phoneNumber: {
			type: String,
		},
		Relation: {
			type: String,
		},
		Description: {
			type: String,
		},
		PassportNo: {
			type: String,
			unique: true
		},
		MaritalStatus: {
			type: String,
			enum: ["Single", "Married", "Divorced", "Widowed"]
		},
		Domicile: {
			type: String,
		},
		Nationality: {
			type: String,
		},
		Religion: {
			type: String,
		},
		Sect: {
			type: String,
		},
		User: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		Front: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Image",
		},
		Back: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Image",
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
