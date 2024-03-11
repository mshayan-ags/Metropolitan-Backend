const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
	{
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
		flatNo: {
			type: String,
			required: true,
			trim: true
		},
		otp: {
			type: Number,
			required: true,
			default: 1234
		},
		notifications: {
			type: Boolean,
			required: true,
			default: true
		},
		TermsAndConditions: {
			type: Boolean,
			required: true,
			default: false
		},
		verifiedByAdmin: {
			type: Boolean,
			required: true,
			default: false
		},
		isVerified: {
			type: Boolean,
			required: true,
			default: false
		},
		Type: {
			type: String,
			required: true,
			default: ""
		},
		Qualification: {
			type: String,
			required: false,
			default: ""
		},
		Designation: {
			type: String,
			required: false,
			default: ""
		},
		Proffesion: {
			type: String,
			required: false,
			default: ""
		},
		NameOfOrganization: {
			type: String,
			required: false,
			default: ""
		},
		AddressOfOrganization: {
			type: String,
			required: false,
			default: ""
		},
		PresentAddress: {
			type: String,
			required: false,
			default: ""
		},
		PermanentAddress: {
			type: String,
			required: false,
			default: ""
		},
		TelePhoneOffice: {
			type: String,
			required: false,
			default: ""
		},
		Residence: {
			type: String,
			required: false,
			default: ""
		},
		Fax: {
			type: String,
			required: false,
			default: ""
		},
		Other: {
			type: String,
			required: false,
			default: ""
		},
		NoOfFamilyMembers: {
			type: Number,
			required: false,
			default: ""
		},
		Adults: {
			type: Number,
			required: false,
			default: ""
		},
		Children: {
			type: Number,
			required: false,
			default: ""
		},
		CNIC: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "CNIC"
		},
		UserProperty: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "UserProperty"
		},
		Property: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Property"
		},
		profilePicture: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Image"
		},
		Event: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Event"
		},
		Review: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Review"
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
		}
	},
	{
		timestamps: {
			createdAt: "created_at", // Use `created_at` to store the created date
			updatedAt: "updated_at" // and `updated_at` to store the last updated date
		}
	}
);

const User = mongoose.model("User", UserSchema);

module.exports = { User };
