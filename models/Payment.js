const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
	{
		Amount: {
			type: Number,
			default: 0,
			required: true
		},
		Type: {
			type: String,
			required: true,
			lowercase: true,
			trim: true
		},
		description: {
			type: String,
			trim: true
		},
		Property: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Property"
		},
		Service: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Service"
		},
		Bill: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Bill"
		},
		Complain: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Complain"
		},
		Admin: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Admin"
		}
	},
	{
		timestamps: {
			createdAt: "created_at", // Use `created_at` to store the created date
			updatedAt: "updated_at" // and `updated_at` to store the last updated date
		}
	}
);

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = { Payment };
