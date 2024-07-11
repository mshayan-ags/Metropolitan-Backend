const { User } = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET, getUserId, getAdminId } = require("../utils/AuthCheck");
const { Router } = require("express");
const Verifier = require("email-verifier");
const { generateOTP, SendOtp, SendWelcomeEmail } = require("../utils/SendOtp");
const { saveImage } = require("../utils/saveImage");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { connectToDB } = require("../Middlewares/Db");
const { SaveImageDB } = require("./Image");
const { default: mongoose } = require("mongoose");

const router = Router();

router.post("/SignUp", async (req, res) => {
	try {
		connectToDB();
		const Credentials = req.body;

		const Check = await CheckAllRequiredFieldsAvailaible(
			Credentials,
			["name", "email", "phoneNumber", "password", "flatNo"],
			res
		);
		if (await Check) {
			return;
		} else {
			const password = await bcrypt.hash(Credentials?.password, 15);

			const newUser = new User({
				name: Credentials?.name,
				email: Credentials?.email,
				phoneNumber: Credentials?.phoneNumber,
				password: password,
				notifications: true,
				TermsAndConditions: Credentials?.TermsAndConditions || false,
				verifiedByAdmin: false,
				Type: Credentials?.Type,
				flatNo: Credentials?.flatNo
			});

			if (newUser) {
				// const verifierkey = new Verifier("at_YVIT9hDNQyVuukKm6g0S4EE1HYXxi");
				// return await verifierkey.verify(newUser?.email, async (err, data) => {
				// 	if (data && data?.freeCheck && data?.dnsCheck && data?.smtpCheck && data?.formatCheck) {
						const otp = generateOTP(6);
						newUser.otp = otp;

						await SendWelcomeEmail(newUser?.email, Credentials?.password);
						if (Credentials?.profilePicture?.data) {
							const image = await SaveImageDB(
								Credentials?.profilePicture,
								{ User: new mongoose.Types.ObjectId(newUser?._id) },
								res
							);

							if (image?.file?._id) {
								newUser.profilePicture = new mongoose.Types.ObjectId(image?.file?._id);
							} else {
								res.status(500).json({ status: 500, message: image?.Error });
							}
						}
						await newUser
							.save()
							.then((data) => {
								if (data?._id) {
									const token = jwt.sign({ id: newUser?._id }, APP_SECRET);

									res.status(200).json({
										token,
										id: newUser?._id,
										status: 200,
										message: "User Created in Succesfully"
									});
								}
							})
							.catch((error) => {
								if (error?.code == 11000) {
									res.status(500).json({
										status: 500,
										message: `Please Change your ${
											Object.keys(error?.keyValue)[0]
										} as it's not unique`
									});
									return;
								} else {
									res.status(500).json({ status: 500, message: error });
									return;
								}
							});
					} else {
						res.status(500).json({
							status: 500,
							message: `Please Change your email as it's not valid`
						});
					}
			// 	});
			// } else {
			// 	res.status(500).json({
			// 		status: 500,
			// 		message: `There was Some Issue`
			// 	});
			// }
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

router.post("/Verify-OTP", async (req, res) => {
	try {
		connectToDB();
		const Check = await CheckAllRequiredFieldsAvailaible(req.body, ["email", "otp"], res);
		if (Check) {
			return;
		}

		const searchUser = await User.findOne({ email: req.body?.email });

		if (searchUser?._id && searchUser?.otp == req.body?.otp) {
			await User.updateOne(
				{ _id: searchUser?._id },
				{ isVerified: true },
				{
					new: false
				}
			)
				.then((docs) => {
					res.status(200).json({
						id: docs?._id,
						status: 200,
						message: "Your Account is Verified Wait for Admin Verification"
					});
				})
				.catch((error) => {
					res.status(500).json({ status: 500, message: error });
				});
		} else {
			res.status(401).json({ status: 401, message: "You Have Entered Wrong Otp or email" });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/Forget-Password", async (req, res) => {
	try {
		connectToDB();
		const Check = await CheckAllRequiredFieldsAvailaible(req?.body, ["email"], res);
		if (Check) {
			return;
		}

		const otp = generateOTP(6);

		SendOtp(req?.body?.email, otp);

		const searchUser = await User.findOne({ email: req.body?.email });
		if (searchUser?._id) {
			await User.updateOne(
				{ _id: searchUser?._id },
				{ isVerified: false, otp: otp, password: `${otp}` },
				{
					new: false
				}
			)
				.then((docs) => {
					res.status(200).json({
						status: 200,
						message: "An Email is sent to your id"
					});
				})
				.catch((error) => {
					console.log(error);
					res.status(500).json({ status: 500, message: error });
				});
		} else {
			res.status(401).json({ status: 401, message: "You Have Entered Wrong email" });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/Resend-OTP", async (req, res) => {
	try {
		connectToDB();
		const Check = await CheckAllRequiredFieldsAvailaible(req?.body, ["email"], res);
		if (Check) {
			return;
		}

		const otp = generateOTP(6);

		SendOtp(req?.body?.email, otp);

		const searchUser = await User.findOne({ email: req.body?.email });
		if (searchUser?._id) {
			await User.updateOne(
				{ _id: searchUser?._id },
				{ isVerified: false, otp: otp },
				{
					new: false
				}
			)
				.then((docs) => {
					res.status(200).json({
						status: 200,
						message: "An Email is sent to your id"
					});
				})
				.catch((error) => {
					console.log(error);
					res.status(500).json({ status: 500, message: error });
				});
		} else {
			res.status(401).json({ status: 401, message: "You Have Entered Wrong email" });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/Change-Password", async (req, res) => {
	try {
		connectToDB();
		const Credentials = req.body;

		const Check = await CheckAllRequiredFieldsAvailaible(
			Credentials,
			["password", "email", "newPassword"],
			res
		);
		if (Check) {
			return;
		}

		const searchUser = await User.findOne({ email: Credentials?.email });
		if (searchUser?.password && searchUser?._id) {
			const valid = bcrypt.compare(Credentials?.password, searchUser?.password);
			if (valid) {
				const password = await bcrypt.hash(Credentials?.newPassword, 15);
				await User.updateOne(
					{ _id: searchUser?._id },
					{ password: password },
					{
						new: false
					}
				)
					.then((docs) => {
						res.status(200).json({
							status: 200,
							message: "Your Password has been Changed"
						});
					})
					.catch((error) => {
						res.status(500).json({ status: 500, message: error });
					});
			} else {
				res.status(500).json({ status: 500, message: "Password Not Valid" });
			}
		} else {
			res.status(500).json({ status: 500, message: "User Not Found or wrong email" });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/Update-User", async (req, res) => {
	try {
		connectToDB();
		const { id, message } = await getUserId(req);
		if (id) {
			const Credentials = req.body;

			const searchUser = await User.findOne({ _id: id });

			if (searchUser?._id) {
				if (Credentials?.profilePicture?.name) {
					const image = await SaveImageDB(
						Credentials?.profilePicture,
						{ User: new mongoose.Types.ObjectId(searchUser?._id) },
						res
					);
					if (image?.file?._id) {
						Credentials.profilePicture = new mongoose.Types.ObjectId(image?.file?._id);
					} else {
						res.status(500).json({ status: 500, message: image?.Error });
					}
				}
				await User.updateOne({ _id: searchUser?._id }, Credentials, {
					new: false
				})
					.then((docs) => {
						res.status(200).json({
							status: 200,
							message: "Your User has been Updated"
						});
					})
					.catch((error) => {
						res.status(500).json({ status: 500, message: error });
					});
			} else {
				res.status(401).json({ status: 401, message: "User Not Found" });
			}
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.post("/Login", async (req, res) => {
	try {
		connectToDB();
		const Credentials = req.body;

		const Check = await CheckAllRequiredFieldsAvailaible(Credentials, ["email", "password"], res);
		if (Check) {
			return;
		}

		const searchUser = await User.findOne({ email: Credentials?.email });
		if (searchUser?.password && searchUser?._id) {
			const valid = bcrypt.compare(Credentials?.password, searchUser?.password);
			if (
				valid
				// &&
				// searchUser?.TermsAndConditions &&
				// searchUser?.isVerified &&
				// searchUser?.verifiedByAdmin
			) {
				const token = jwt.sign({ id: searchUser?._id }, APP_SECRET);
				res.status(200).json({
					token,
					status: 200,
					message: "User Logged in Succesfully"
				});
			} else if (!valid) {
				res.status(500).json({ status: 500, message: "Your Password is incorrect" });
			} else {
				res.status(500).json({ status: 500, message: "User Not Verified" });
			}
		} else {
			res.status(500).json({ status: 500, message: "User Not Found" });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/userInfo/:id", async (req, res) => {
	try {
		connectToDB();
		const { id: adminId, message: adminMessage } = await getAdminId(req);
		if (adminId) {
			User.findOne({ _id: req?.params?.id })
				.populate(["Property", "profilePicture"])
				.then((data) => {
					res.status(200).json({ status: 200, data: data });
				})
				.catch((err) => {
					res.status(500).json({ status: 500, message: err });
				});
		} else {
			res.status(401).json({ status: 401, message: adminMessage });
		}
	} catch (error) {
		res.status(500).json({ status: 500, message: error });
	}
});

router.get("/userInfo", async (req, res) => {
	try {
		connectToDB();
		const { id, message } = await getUserId(req);
		if (id) {
			User.findOne({ _id: id })
				.populate([
					{ path: "Property" },
					{ path: "profilePicture" },
					{
						path: "CNIC",
						populate: [
							{
								path: "Front"
							},
							{
								path: "Back"
							}
						]
					}
				])
				.then((data) => {
					res.status(200).json({ status: 200, data: data });
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

router.get("/GetAllUsers/:type", async (req, res) => {
	try {
		const { id, message } = await getAdminId(req);
		if (id) {
			const Filter =
				req?.params?.type && req?.params?.type != "All" ? { Type: req?.params?.type } : {};

			User.find(Filter)
				.populate([
					{ path: "Property", select: "description" },
					{ path: "profilePicture" },
					{ path: "UserProperty" }
				])
				.exec()
				.then((data) => {
					res.status(200).json({ status: 200, data: data });
				})
				.catch((err) => {
					console.log(err);

					res.status(500).json({ status: 500, message: err });
				});
		} else {
			res.status(401).json({ status: 401, message: message });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: 500, message: error });
	}
});

module.exports = router;
