const { Car } = require("../models/Car");
const { getAdminId, getUserId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { User } = require("../models/User");
const { default: mongoose } = require("mongoose");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { connectToDB } = require("../Middlewares/Db");
const { Property } = require("../models/Property");

const router = Router();

router.post("/Create-Car", async (req, res) => {
	try {
		connectToDB();

		const { id, message } = await getAdminId(req);

		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(
				Credentials,
				["Number", "Color", "Name", "Description", "SlotNo", "LicenseNo", "User", "Property"],
				res
			);
			if (Check) {
				return;
			}
			const searchUser = await User.findOne({ _id: Credentials?.User });
			const searchProperty = await Property.findOne({
				_id: Credentials?.Property
			});
			if (searchUser?._id && searchProperty?._id) {
				const newCar = new Car({
					Number: Credentials?.Number,
					Color: Credentials?.Color,
					Name: Credentials?.Name,
					Description: Credentials?.Description,
					SlotNo: Credentials?.SlotNo,
					LicenseNo: Credentials?.LicenseNo,
					User: new mongoose.Types.ObjectId(Credentials?.User),
					Property: new mongoose.Types.ObjectId(Credentials?.Property)
				});

				const saveCar = await newCar.save();
				if (saveCar?._id) {
					res.status(200).json({
						status: 200,
						message: "Car Created in Succesfully"
					});
				} else {
					res.status(500).json({ status: 500, message: "Something Went Wrong" });
				}
			} else {
				res.status(401).json({ status: 401, message: "Please Check Your Data" });
			}
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		if (error?.code == 11000) {
			res.status(500).json({
				status: 500,
				message: `Please Change your ${Object.keys(error?.keyValue)[0]} as it's not unique`
			});
		} else {
			res.status(500).json({ status: 500, message: error });
		}
	}
});

router.get("/CarInfo/:id", async (req, res) => {
	try {
		connectToDB();
		const { id, message } = await getAdminId(req);
		const { id: userId, message: userMessage } = await getUserId(req);
		if (id || userId) {
			const Check = await CheckAllRequiredFieldsAvailaible(req.params, ["id"], res);
			if (Check) {
				return;
			}

			Car.findOne({ _id: req.params.id })
				.populate(["User", "Property"])
				.then((data) => {
					res.status(200).json({ status: 200, data: data });
				})
				.catch((err) => {
					res.status(500).json({ status: 500, message: err });
				});
		} else {
			res.status(401).json({ status: 401, message: message || userMessage });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/GetAllCars", async (req, res) => {
	try {
		connectToDB();
		const { id, message } = await getAdminId(req);
		const { id: userId, message: userMessage } = await getUserId(req);

		if (id || userId) {
			Car.find()
				.populate(["User", "Property"])
				.then((data) => {
					res.status(200).json({ status: 200, data: data });
				})
				.catch((err) => {
					res.status(500).json({ status: 500, message: err });
				});
		} else {
			res.status(401).json({ status: 401, message: message || userMessage });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

module.exports = router;
