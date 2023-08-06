const { Admin } = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET, getAdminId } = require("../utils/AuthCheck");
const { Router } = require("express");

const router = Router();

router.post("/Create-Admin", async (req, res) => {
  try {
    const Credentials = req.body;

    const password = await bcrypt.hash(Credentials?.password, 15);

    const newAdmin = new Admin({
      name: Credentials?.name,
      email: Credentials?.email,
      phoneNumber: Credentials?.phoneNumber,
      password: password,
      Role: Credentials?.Role,
    });

    await newAdmin.save();

    const token = jwt.sign(
      { id: newAdmin?._id, Role: newAdmin?.Role },
      APP_SECRET
    );

    res.status(200).json({
      token,
      status: 200,
      message: "Admin Created in Succesfully",
    });
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

router.post("/Update-Admin", async (req, res) => {
  try {
    const { id, message } = getAdminId(req);
    if (id) {
      const Credentials = req.body;

      Admin.findOne({ _id: id })
        .then(async (data) => {
          await Admin.updateOne({ _id: data?._id }, Credentials, {
            new: false,
          })
            .then((docs) => {
              res.status(401).json({
                status: 200,
                message: "Your Admin has been Updated",
              });
            })
            .catch((error) => {
              res.status(500).json({ status: 500, message: error });
            });
        })
        .catch((error) => {
          res.status(500).json({ status: 500, message: error });
        });
    } else {
      res.status(401).json({ status: 401, message: message });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error });
  }
});

router.post("/Login-Admin", async (req, res) => {
  try {
    const Credentials = req.body;
    if (!Credentials?.password && !Credentials?.email) {
      res
        .status(400)
        .json({ status: 400, message: "Please Fill All The Fields" });
    }
    Admin.findOne({ email: req.body?.email })
      .then((docs) => {
        if (docs?.password && docs?._id) {
          const valid = bcrypt.compare(req.body?.password, docs?.password);
          if (valid) {
            const token = jwt.sign(
              { id: docs?._id, Role: docs?.Role },
              APP_SECRET
            );
            res.status(200).json({
              token,
              status: 200,
              message: "Admin Logged in Succesfully",
            });
          } else if (!valid) {
            res
              .status(500)
              .json({ status: 500, message: "Your Password is incorrect" });
          } else {
            res
              .status(500)
              .json({ status: 500, message: "Admin Not Verified" });
          }
        } else {
          res.status(500).json({ status: 500, message: "Admin Not Found" });
        }
      })
      .catch((error) => {
        res.status(500).json({ status: 500, message: error });
      });
  } catch (error) {
    res.status(500).json({ status: 500, message: error });
  }
});

router.get("/AdminInfo", async (req, res) => {
  try {
    const { id, message } = getAdminId(req);
    if (id) {
      Admin.findOne({ _id: id })
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
