const { User } = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET, getUserId } = require("../utils/AuthCheck");
const { Router } = require("express");
const Verifier = require("email-verifier");
const { generateOTP, SendOtp } = require("../utils/SendOtp");

const router = Router();

router.post("/SignUp", async (req, res) => {
  try {
    const Credentials = req.body;

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
      await verifierkey.verify(newUser?.email, async (err, data) => {
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

          await newUser.save();

          const token = jwt.sign({ id: newUser?._id }, APP_SECRET);

          res.status(200).json({
            token,
            status: 200,
            message: "User Created in Succesfully",
          });
        } else {
          console.log(err);
          res.status(500).json({
            status: 500,
            message: `Please Change your email as it's not valid`,
          });
        }
      });
    }
  } catch (error) {
    console.log(error);
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
    if (!req.body?.otp && !req.body?.email) {
      res
        .status(400)
        .json({ status: 400, message: "Please Fill All The Fields" });
    }
    User.findOne({ email: req.body?.email })
      .then(async (data) => {
        if (data.otp == req.body?.otp) {
          await User.updateOne(
            { _id: data?._id },
            { isVerified: true },
            {
              new: false,
            }
          )
            .then((docs) => {
              res.status(401).json({
                id: docs?._id,
                status: 200,
                message: "Your Account is Verified Wait for Admin Verification",
              });
            })
            .catch((error) => {
              console.log(error);
              res.status(500).json({ status: 500, message: error });
            });
        } else {
          res
            .status(401)
            .json({ status: 401, message: "You Have Entered Wrong Otp" });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ status: 500, message: err });
      });
  } catch (error) {
    res.status(500).json({ status: 500, message: error });
  }
});

router.post("/Forget-Password", async (req, res) => {
  try {
    if (!req.body?.email) {
      res
        .status(400)
        .json({ status: 400, message: "Please Fill All The Fields" });
    }
    const otp = generateOTP(6);

    SendOtp(newUser?.email, otp);

    User.findOne({ email: req.body?.email })
      .then(async (data) => {
        await User.updateOne(
          { _id: data?._id },
          { isVerified: false, otp: otp, password: `${otp}` },
          {
            new: false,
          }
        )
          .then((docs) => {
            res.status(401).json({
              id: docs?._id,
              status: 200,
              message: "An Email is sent to your id",
            });
          })
          .catch((error) => {
            console.log(error);
            res.status(500).json({ status: 500, message: error });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ status: 500, message: err });
      });
  } catch (error) {
    res.status(500).json({ status: 500, message: error });
  }
});

router.post("/Change-Password", async (req, res) => {
  try {
    const Credentials = req.body;
    if (
      !Credentials?.password &&
      !Credentials?.email &&
      !Credentials?.newPassword
    ) {
      res
        .status(400)
        .json({ status: 400, message: "Please Fill All The Fields" });
    }
    User.findOne({ email: req.body?.email })
      .then(async (data) => {
        if (data?.password && data?._id) {
          const valid = bcrypt.compare(req.body?.password, data?.password);
          if (valid) {
            const password = await bcrypt.hash(Credentials?.newPassword, 15);
            await User.updateOne(
              { _id: data?._id },
              { password: password },
              {
                new: false,
              }
            )
              .then((docs) => {
                res.status(401).json({
                  id: docs?._id,
                  status: 200,
                  message: "Your Password has been Changed",
                });
              })
              .catch((error) => {
                res.status(500).json({ status: 500, message: error });
              });
          } else {
            res
              .status(500)
              .json({ status: 500, message: "Password Not Valid" });
          }
        } else {
          res.status(500).json({ status: 500, message: "User Not Found" });
        }
      })
      .catch((error) => {
        res.status(500).json({ status: 500, message: error });
      });
  } catch (error) {
    res.status(500).json({ status: 500, message: error });
  }
});

router.post("/Login", async (req, res) => {
  try {
    const Credentials = req.body;
    if (!Credentials?.password && !Credentials?.email) {
      res
        .status(400)
        .json({ status: 400, message: "Please Fill All The Fields" });
    }
    User.findOne({ email: req.body?.email })
      .then((docs) => {
        console.log(docs);
        if (docs?.password && docs?._id) {
          const valid = bcrypt.compare(req.body?.password, docs?.password);
          if (
            valid &&
            docs?.TermsAndConditions &&
            docs?.isVerified &&
            docs?.verifiedByAdmin
          ) {
            const token = jwt.sign({ id: docs?._id }, APP_SECRET);
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
      })
      .catch((error) => {
        res.status(500).json({ status: 500, message: error });
      });
  } catch (error) {
    res.status(500).json({ status: 500, message: error });
  }
});

router.get("/userInfo", async (req, res) => {
  try {
    const { id, message } = getUserId(req);
    if (id) {
      User.findOne({ _id: id })
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
