const { Router } = require("express");
const { CNIC } = require("../models/CNIC");
const { User } = require("../models/User");
const { connectToDB } = require("../Middlewares/Db");
const { getAdminId, getUserId } = require("../utils/AuthCheck");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { default: mongoose } = require("mongoose");
const { SaveImageDB } = require("./Image");

const router = Router();

// Create a CNIC
router.post("/Create-CNIC", async (req, res) => {
	try {
		connectToDB();

		const { id, message } = await getUserId(req);
		if (!id || id == "") {
			return res.status(401).json({ status: 401, message: message });
		}

		const credentials = req.body;

		const check = await CheckAllRequiredFieldsAvailaible(
			credentials,
			[
				"CNICNumber",
				"FullName",
				// "DateOfBirth",
				// "Gender",
				// "Address",
				// "Nationality",
				// "Front",
				// "Back"
			],
			res
		);
		if (check) {
			return;
		}
		const user = await User.find({ _id: id });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const newCNIC = new CNIC({
			...credentials,
			User: new mongoose.Types.ObjectId(id)
		});

		if (credentials?.Front?.data) {
			const image = await SaveImageDB(
				credentials?.Front,
				{ CNIC: new mongoose.Types.ObjectId(newCNIC?._id) },
				res
			);

			if (image?.file?._id) {
				newCNIC.Front = new mongoose.Types.ObjectId(image?.file?._id);
			} else {
				res.status(500).json({ status: 500, message: image?.Error });
				return;
			}
		}

		if (credentials?.Back?.data) {
			const image = await SaveImageDB(
				credentials?.Back,
				{ CNIC: new mongoose.Types.ObjectId(newCNIC?._id) },
				res
			);

			if (image?.file?._id) {
				newCNIC.Back = new mongoose.Types.ObjectId(image?.file?._id);
			} else {
				res.status(500).json({ status: 500, message: image?.Error });
				return;
			}
		}
		await newCNIC.save();

		const getAllCNICUser = await CNIC.find({ User: id }).select("_id");
		await User.updateOne(
			{
				_id: id
			},
			{
				CNIC: getAllCNICUser
			},
			{
				new: false
			}
		)
			.then((docs) => {
				res.status(200).json({ status: 200, message: "CNIC Created Successfully" });
			})
			.catch((error) => {
				console.log(error);
				res.status(500).json({ status: 500, message: error });
			});
	} catch (error) {
		if (error?.code == 11000) {
			res.status(500).json({
				status: 500,
				message: `Duplicate field error: ${Object.keys(error.keyValue)[0]} must be unique.`
			});
		} else {
			res.status(500).json({ status: 500, message: error.toString() });
		}
	}
});

// Get CNIC Info
router.get("/CNICInfo/:id", async (req, res) => {
	try {
		connectToDB();

		const { id: adminId, message } = await getAdminId(req);
		if (!adminId) {
			return res.status(401).json({ status: 401, message: message });
		}

		const { id } = req.params;

		const CNIC = await CNIC.findById(id).populate("User");
		if (!CNIC) {
			return res.status(404).json({ status: 404, message: "CNIC not found" });
		}

		res.status(200).json({ status: 200, data: CNIC });
	} catch (error) {
		res.status(500).json({ status: 500, message: error.toString() });
	}
});

// Get All CNICs
router.get("/GetAllCNICs", async (req, res) => {
	try {
		connectToDB();
		const { id, message } = await getAdminId(req);
		if (!id) {
			return res.status(401).json({ status: 401, message: message });
		}

		const CNICs = await CNIC.find().populate("User");
		res.status(200).json({ status: 200, data: CNICs });
	} catch (error) {
		res.status(500).json({ status: 500, message: error.toString() });
	}
});

module.exports = router;
