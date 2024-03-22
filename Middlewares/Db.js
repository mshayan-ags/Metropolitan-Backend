const { default: mongoose } = require("mongoose");
const { User } = require("../models/User");
const { Admin } = require("../models/Admin");
const { Property } = require("../models/Property");
const { ServiceOffered } = require("../models/ServiceOffered");
const { Service } = require("../models/Service");
const { Bill } = require("../models/Bill");
const { Payment } = require("../models/Payment");
const { Review } = require("../models/Review");
const { Utility } = require("../models/Utility");

const connectToDB = async () => {
	mongoose
		.connect(
			"mongodb+srv://metropolis365fm:9ovLhi6P5K723tx9@metropolis.yillo40.mongodb.net/?retryWrites=true&w=majority&appName=Metropolis"
		)
		.catch((err) => console.log(err));

	return await mongoose;
};

function AddProperty(params) {
	const Arr = [
		{
			FlatNo: "",
			Floor: "",
			Tower: "",
			Tower_FlatNo: "",
			Category: "",
			description: ""
		}
	];
	// await Property.insertMany({})
}

const connect = async () => {
	mongoose
		.connect(
			"mongodb+srv://metropolis365fm:9ovLhi6P5K723tx9@metropolis.yillo40.mongodb.net/?retryWrites=true&w=majority&appName=Metropolis"
		)
		.then(async () => {
			console.log("Connected to mongodb");
			await User.find();
			await Admin.find();
			await Property.find();
			await ServiceOffered.find();
			await Service.find();
			await Bill.find();
			await Payment.find();
			await Review.find();
			await Utility.find();
		})
		.catch((err) => console.log(err));

	return await mongoose;
};

module.exports = { connectToDB, connect };
