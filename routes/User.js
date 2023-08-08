const { User } = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET, getUserId, getAdminId } = require("../utils/AuthCheck");
const { Router } = require("express");
const Verifier = require("email-verifier");
const { generateOTP, SendOtp } = require("../utils/SendOtp");
const formidable = require("formidable");
const saveImage = require("../utils/saveImage");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { connectToDB } = require("../Middlewares/Db");

const router = Router();

router.post("/saveFile", async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    saveImage(files.image[0]);
  });
});

router.post("/SignUp", async (req, res) => {
  try {
    connectToDB();
    const Credentials = req.body;

    const Check = await CheckAllRequiredFieldsAvailaible(
      Credentials,
      ["name", "email", "phoneNumber", "TermsAndConditions", "password"],
      res
    );
    if (Check == "Error") {
      return;
    }

    const password = await bcrypt.hash(Credentials?.password, 15);

    const newUser = new User({
      name: Credentials?.name,
      email: Credentials?.email,
      phoneNumber: Credentials?.phoneNumber,
      password: password,
      notifications: true,
      TermsAndConditions: Credentials?.TermsAndConditions,
      verifiedByAdmin: false,
    });

    if (newUser) {
      const verifierkey = new Verifier("at_Qc0l6wLRvlfI875zbloS9GD7YLltj");
      return await verifierkey.verify(newUser?.email, async (err, data) => {
        if (
          data &&
          data?.freeCheck &&
          data?.dnsCheck &&
          data?.smtpCheck &&
          data?.formatCheck
        ) {
          const otp = generateOTP(6);
          newUser.otp = otp;

          SendOtp(newUser?.email, otp);

          const saveUser = await newUser.save().catch((error) => {
            if (error?.code == 11000) {
              res.status(500).json({
                status: 500,
                message: `Please Change your ${
                  Object.keys(error?.keyValue)[0]
                } as it's not unique`,
              });
              return;
            } else {
              res.status(500).json({ status: 500, message: error });
              return;
            }
          });
          if (saveUser?._id) {
            const token = jwt.sign({ id: newUser?._id }, APP_SECRET);

            res.status(200).json({
              token,
              status: 200,
              message: "User Created in Succesfully",
            });
          } else {
            return;
          }
        } else {
          res.status(500).json({
            status: 500,
            message: `Please Change your email as it's not valid`,
          });
        }
      });
    }
  } catch (error) {
    if (error?.code == 11000) {
      res.status(500).json({
        status: 500,
        message: `Please Change your ${
          Object.keys(error?.keyValue)[0]
        } as it's not unique`,
      });
    } else {
      res.status(500).json({ status: 500, message: error });
    }
  }
});

router.post("/Verify-OTP", async (req, res) => {
  try {
    connectToDB();
    const Check = await CheckAllRequiredFieldsAvailaible(
      req.body,
      ["email", "otp"],
      res
    );
    if (Check == "Error") {
      return;
    }

    const searchUser = await User.findOne({ email: req.body?.email });

    if (searchUser?._id && searchUser?.otp == req.body?.otp) {
      await User.updateOne(
        { _id: searchUser?._id },
        { isVerified: true },
        {
          new: false,
        }
      )
        .then((docs) => {
          res.status(200).json({
            id: docs?._id,
            status: 200,
            message: "Your Account is Verified Wait for Admin Verification",
          });
        })
        .catch((error) => {
          res.status(500).json({ status: 500, message: error });
        });
    } else {
      res
        .status(401)
        .json({ status: 401, message: "You Have Entered Wrong Otp or email" });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error });
  }
});

router.post("/Forget-Password", async (req, res) => {
  try {
    connectToDB();
    const Check = await CheckAllRequiredFieldsAvailaible(req?.body, ["email"], res);
    if (Check == "Error") {
      return;
    }

    const otp = generateOTP(6);

    SendOtp(newUser?.email, otp);

    const searchUser = await User.findOne({ email: req.body?.email });
    if (searchUser?._id) {
      await User.updateOne(
        { _id: searchUser?._id },
        { isVerified: false, otp: otp, password: `${otp}` },
        {
          new: false,
        }
      )
        .then((docs) => {
          res.status(200).json({
            status: 200,
            message: "An Email is sent to your id",
          });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({ status: 500, message: error });
        });
    } else {
      res
        .status(401)
        .json({ status: 401, message: "You Have Entered Wrong email" });
    }
  } catch (error) {
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
    if (Check == "Error") {
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
            new: false,
          }
        )
          .then((docs) => {
            res.status(200).json({
              status: 200,
              message: "Your Password has been Changed",
            });
          })
          .catch((error) => {
            res.status(500).json({ status: 500, message: error });
          });
      } else {
        res.status(500).json({ status: 500, message: "Password Not Valid" });
      }
    } else {
      res
        .status(500)
        .json({ status: 500, message: "User Not Found or wrong email" });
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
        await User.updateOne({ _id: searchUser?._id }, Credentials, {
          new: false,
        })
          .then((docs) => {
            res.status(200).json({
              status: 200,
              message: "Your User has been Updated",
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

    const Check = await CheckAllRequiredFieldsAvailaible(
      Credentials,
      ["email", "password"],
      res
    );
    if (Check == "Error") {
      return;
    }

    const searchUser = await User.findOne({ email: Credentials?.email });
    if (searchUser?.password && searchUser?._id) {
      const valid = bcrypt.compare(Credentials?.password, searchUser?.password);
      if (
        valid &&
        searchUser?.TermsAndConditions &&
        searchUser?.isVerified &&
        searchUser?.verifiedByAdmin
      ) {
        const token = jwt.sign({ id: searchUser?._id }, APP_SECRET);
        res.status(200).json({
          token,
          status: 200,
          message: "User Logged in Succesfully",
        });
      } else if (!valid) {
        res
          .status(500)
          .json({ status: 500, message: "Your Password is incorrect" });
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

router.get("/userInfo", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getUserId(req);
    if (id) {
      User.findOne({ _id: id })
        .populate("Property", "profilePicture")
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

router.get("/GetAllUsers", async (req, res) => {
  try {
    const { id, message } = getAdminId(req);
    if (id) {
      User.find()
        .populate("Property", "profilePicture")
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

module.exports = router;
