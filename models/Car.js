const mongoose = require("mongoose");

const CarSchema = new mongoose.Schema(
	{
		Number: {
			type: String,
			required: true,
			unique: true
		},
		Color: {
			type: String,
			required: true
		},
		SlotNo: {
			type: String,
			required: true,
			unique: true
		},
		LicenseNo: {
			type: String,
			required: true
		},
		Name: {
			type: String,
			required: false
		},
		Description: {
			type: String,
			required: false
		},
		Property: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Property"
		},
		User: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	},
	{
		timestamps: {
			createdAt: "created_at", // Use `created_at` to store the created date
			updatedAt: "updated_at" // and `updated_at` to store the last updated date
		}
	}
);

const Car = mongoose.model("Car", CarSchema);

module.exports = { Car };
