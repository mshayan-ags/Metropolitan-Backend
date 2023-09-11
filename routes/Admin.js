const { Admin } = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET, getAdminId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { connectToDB } = require("../Middlewares/Db");
const { SaveImageDB } = require("./Image");
const { default: mongoose } = require("mongoose");

const router = Router();

router.post("/Create-Admin", async (req, res) => {
  try {
    connectToDB();

    const Credentials = req.body;

    const Check = await CheckAllRequiredFieldsAvailaible(
      Credentials,
      ["name", "email", "phoneNumber", "Role", "password", "profilePicture"],
      res
    );
    if (Check) {
      return;
    }

    const password = await bcrypt.hash(Credentials?.password, 15);

    const newAdmin = new Admin({
      name: Credentials?.name,
      email: Credentials?.email,
      phoneNumber: Credentials?.phoneNumber,
      password: password,
      Role: Credentials?.Role,
    });

    const image = await SaveImageDB(
      Credentials?.profilePicture,
      { Admin: new mongoose.Types.ObjectId(newAdmin?._id) },
      res
    );

    if (image?.file?._id) {
      newAdmin.profilePicture = new mongoose.Types.ObjectId(image?.file?._id);
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
    } else {
      res.status(500).json({ status: 500, message: image?.Error });
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

router.post("/Update-Admin", async (req, res) => {
  try {
    connectToDB();

    const { id, message } = await getAdminId(req);
    if (id) {
      const Credentials = req.body;

      const searchAdmin = await Admin.findOne({ _id: id });

      if (searchAdmin?._id) {
        if (JSON.parse(Credentials?.profilePicture)?.name) {
          const image = await SaveImageDB(
            Credentials?.profilePicture,
            { Admin: new mongoose.Types.ObjectId(searchAdmin?._id) },
            res
          );
          if (image?.file?._id) {
            Credentials.profilePicture = new mongoose.Types.ObjectId(
              image?.file?._id
            );
          } else {
            res.status(500).json({ status: 500, message: image?.Error });
          }
        }
        await Admin.updateOne({ _id: id }, Credentials, {
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
      } else {
        res.status(500).json({ status: 500, message: "Admin Not Found" });
      }
    } else {
      res.status(401).json({ status: 401, message: message });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error });
  }
});

router.post("/Login-Admin", async (req, res) => {
  try {
    connectToDB();

    const Credentials = req.body;

    const Check = await CheckAllRequiredFieldsAvailaible(
      Credentials,
      ["email", "password"],
      res
    );
    if (Check) {
      return;
    }

    const searchAdmin = await Admin.findOne({ email: Credentials?.email });

    if (searchAdmin?.password && searchAdmin?._id) {
      const valid = await bcrypt.compare(
        Credentials?.password,
        searchAdmin?.password,
      );

      if (valid) {
        const token = jwt.sign(
          { id: searchAdmin?._id, Role: searchAdmin?.Role },
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
        res.status(500).json({ status: 500, message: "Admin Not Verified" });
      }
    } else {
      res.status(500).json({ status: 500, message: "Admin Not Found" });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error });
  }
});

router.get("/AdminInfo", async (req, res) => {
  try {
    connectToDB();

    const { id, message } = await getAdminId(req);
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
