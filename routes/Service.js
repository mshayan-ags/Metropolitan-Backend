const { Service } = require("../models/Service");
const { getUserId, getAdminId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { User } = require("../models/User");
const { default: mongoose } = require("mongoose");
const { ServiceOffered } = require("../models/ServiceOffered");
const { Property } = require("../models/Property");
const { Admin } = require("../models/Admin");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { connectToDB } = require("../Middlewares/Db");

const router = Router();

router.post("/Request-Service", async (req, res) => {
	try {
		connectToDB();
		const { id, message } = await getUserId(req);
		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(
				Credentials,
				["status", "FieldValues", "description", "Property", "ServiceOffered"],
				res
			);
			if (Check) {
				return;
			}

			const searchServiceOffered = await ServiceOffered.findOne({
				_id: Credentials?.ServiceOffered
			});

			const searchProperty = await Property.findOne({
				_id: Credentials?.Property
			});

			if (searchServiceOffered?._id && searchProperty?._id) {
				// Get all fields
				const Field = searchServiceOffered?.Fields;

				// Get all unique fields names
				const FieldNames = searchServiceOffered?.Fields.map((a) => a?.name);
				const uniqueFieldNames = [...new Set(FieldNames)];

				// Get all fields values from user
				const FieldValues = Credentials?.FieldValues;
				const Obj = {};

				// Create all empty fields
				uniqueFieldNames.map((val) => {
					Obj[val] = "";
				});

				// Set all fields values
				Field.map((val) => {
					if (FieldValues?.[val?.name] && val?.forUser) {
						Obj[val?.name] = FieldValues?.[val?.name];
					}
				});
				const LastEntry = await Service.findOne({}, {}, { sort: { Number: -1 } });

				// Create Service
				const newService = new Service({
					Number: LastEntry?.Number ? Number(LastEntry?.Number || 0) + 1 : 1,
					status: Credentials?.status,
					description: Credentials?.description,
					Property: new mongoose.Types.ObjectId(Credentials?.Property),
					ServiceOffered: new mongoose.Types.ObjectId(Credentials?.ServiceOffered),
					FieldValues: Obj
				});

				const saveService = await newService.save();

				// Add Service to ServiceOffered
				const Service_ServiceOffered = await Service.find({
					ServiceOffered: Credentials?.ServiceOffered
				}).select("_id");

				ServiceOffered.updateOne(
					{ _id: Credentials.ServiceOffered },
					{
						Service: Service_ServiceOffered
					}
				)
					.then(async (data) => {
						// Add Service to Property
						const Service_Property = await Service.find({
							Property: Credentials?.Property
						}).select("_id");

						Property.updateOne(
							{ _id: Credentials?.Property },
							{
								Service: Service_Property
							}
						)
							.then((data) => {
								res.status(200).json({
									status: 200,
									message: "Service Created in Succesfully"
								});
							})
							.catch((err) => {
								console.log(err);
								res.status(500).json({ status: 500, message: err });
							});
					})
					.catch((err) => {
						res.status(500).json({ status: 500, message: err });
					});
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

router.post("/Create-Service", async (req, res) => {
	try {
		connectToDB();
		const { id, message } = await getAdminId(req);
		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(
				Credentials,
				["status", "FieldValues", "description", "Property", "ServiceOffered"],
				res
			);
			if (Check) {
				return;
			}

			const searchServiceOffered = await ServiceOffered.findOne({
				_id: Credentials?.ServiceOffered
			});

			const searchProperty = await Property.findOne({
				_id: Credentials?.Property
			});

			const searchAdmin = await Admin.findOne({
				_id: id
			});

			if (searchServiceOffered?._id && searchProperty?._id && searchAdmin?._id) {
				// Get all fields
				const Field = searchServiceOffered?.Fields;

				// Get all unique fields names
				const FieldNames = searchServiceOffered?.Fields.map((a) => a?.name);
				const uniqueFieldNames = [...new Set(FieldNames)];

				// Get all fields values from user
				const FieldValues = Credentials?.FieldValues;
				const Obj = {};

				// Create all empty fields
				uniqueFieldNames.map((val) => {
					Obj[val] = "";
				});

				// Set all fields values
				Field.map((val) => {
					if (FieldValues?.[val?.name]) {
						Obj[val?.name] = FieldValues?.[val?.name];
					}
				});
				const LastEntry = await Service.findOne({}, {}, { sort: { Number: -1 } });

				// Create Service
				const newService = new Service({
					Number: LastEntry?.Number ? Number(LastEntry?.Number || 0) + 1 : 1,
					status: Credentials?.status,
					description: Credentials?.description,
					reason: Credentials?.reason,
					Property: new mongoose.Types.ObjectId(Credentials?.Property),
					ServiceOffered: new mongoose.Types.ObjectId(Credentials?.ServiceOffered),
					FieldValues: Obj,
					Admin: new mongoose.Types.ObjectId(id)
				});

				const saveService = await newService.save();

				const Service_Admin = await Service.find({
					Admin: id
				}).select("_id");

				Admin.updateOne(
					{ _id: id },
					{
						Service: Service_Admin
					}
				)
					.then(async (data) => {
						// Add Service to ServiceOffered
						const Service_ServiceOffered = await Service.find({
							ServiceOffered: req.body.ServiceOffered
						}).select("_id");
						ServiceOffered.updateOne(
							{ _id: req.body.ServiceOffered },
							{
								Service: Service_ServiceOffered
							}
						)
							.then(async (data) => {
								// Add Service to Property
								const Service_Property = await Service.find({
									Property: req.body.Property
								}).select("_id");

								Property.updateOne(
									{ _id: req.body.Property },
									{
										Service: Service_Property
									}
								)
									.then((data) => {
										res.status(200).json({
											status: 200,
											message: "Service Created in Succesfully"
										});
									})
									.catch((err) => {
										res.status(500).json({ status: 500, message: err });
									});
							})
							.catch((err) => {
								res.status(500).json({ status: 500, message: err });
							});
					})
					.catch((err) => {
						res.status(500).json({ status: 500, message: err });
					});
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

router.post("/Update-Service", async (req, res) => {
	try {
		connectToDB();
		const { id, message } = await getAdminId(req);
		if (id) {
			const Credentials = req.body;

			const Check = await CheckAllRequiredFieldsAvailaible(
				Credentials,
				["id", "ServiceOffered"],
				res
			);
			if (Check) {
				return;
			}

			const currAdmin = await Admin.findOne({ _id: id });
			const currServiceOffered = await ServiceOffered.findOne({
				_id: Credentials.ServiceOffered
			});
			const currService = await Service.findOne({ _id: Credentials.id });

			// Get all fields
			const Field = currServiceOffered?.Fields;

			// Get all unique fields names
			const FieldNames = currServiceOffered?.Fields.map((a) => a?.name);
			const uniqueFieldNames = [...new Set(FieldNames)];

			// Get all fields values from user
			const FieldValues = {
				...Credentials?.FieldValues
			};
			const Obj = {};

			// Create all empty fields
			uniqueFieldNames.map((val) => {
				Obj[val] = "";
			});

			// Set old fields values
			Field.map((val) => {
				if (currService?.get(`FieldValues.${val?.name}`)) {
					Obj[val?.name] = currService?.get(`FieldValues.${val?.name}`);
				}
			});

			// // Set all fields values
			Field.map((val) => {
				if (FieldValues?.[val?.name]) {
					Obj[val?.name] = FieldValues?.[val?.name];
				}
			});

			// Update Service
			const updateService = {
				status: Credentials?.status,
				reason: Credentials?.reason,
				FieldValues: Obj,
				Admin: new mongoose.Types.ObjectId(id)
			};

			Service.updateOne({ _id: Credentials?.id }, updateService)
				.then(async (data) => {
					// Add Service to Admin
					const Service_Admin = await Service.find({
						Admin: id
					}).select("_id");
					Admin.updateOne(
						{ _id: id },
						{
							Service: Service_Admin
						}
					)
						.then(async (data) => {
							res.status(200).json({
								status: 200,
								message: "Service Updated in Succesfully"
							});
						})
						.catch((err) => {
							res.status(500).json({ status: 500, message: err });
						});
				})
				.catch((err) => {
					res.status(500).json({ status: 500, message: err });
				});
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

router.get("/ServiceInfo/:id", async (req, res) => {
	try {
		connectToDB();
		const { id: userId, message: userMessage } = await getUserId(req);
		const { id, message } = await getAdminId(req);
		if (id || userId) {
			const Check = await CheckAllRequiredFieldsAvailaible(req?.params, ["id"], res);
			if (Check) {
				return;
			}

			Service.findOne({ _id: req.params.id })
				.populate(["ServiceOffered", "Review", "Bill", "Property", "Admin", "Payment"])
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

router.get("/GetAllService", async (req, res) => {
	try {
		connectToDB();
		const { id: userId, message: userMessage } = await getUserId(req);
		const { id, message } = await getAdminId(req);
		if (id || userId) {
			const FindAdmin = (await Admin.findOne({ _id: id }))?.Role;
			const Filter = {};
			if (FindAdmin == "user" || FindAdmin == "manager" || FindAdmin == "reception") {
				Filter.Admin = id;
			}
			Service.find(Filter)
				.populate([
					"ServiceOffered",
					"Review",
					"Bill",
					"Property",
					{
						path: "Admin",
						populate: {
							path: "profilePicture"
						}
					},
					{
						path: "Tasks",
						populate: {
							path: "assignedTo",
							populate: {
								path: "profilePicture"
							}
						}
					},
					"Payment"
				])
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

router.get("/GetAllServiceUser", async (req, res) => {
	try {
		connectToDB();
		const { id, message } = await getUserId(req);
		if (id) {
			const CurrUser = await User.findOne({ _id: id });
			Service.find({ Property: CurrUser?.Property })
				.populate([
					{
						path: "ServiceOffered",
						populate: {
							path: "Icon"
						}
					}
				])
				.then((data) => {
					res.status(200).json({ status: 200, data: data.filter((a) => a?.status != "completed") });
				})
				.catch((err) => {
					res.status(500).json({ status: 500, message: err });
				});
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

module.exports = router;
