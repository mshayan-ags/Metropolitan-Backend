const { Property } = require("../models/Property");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET, getAdminId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { User } = require("../models/User");
const { default: mongoose } = require("mongoose");
const { SetArrManyRelationhip } = require("../utils/SetArrManyRelationhip");

const router = Router();

router.post("/Create-Property", async (req, res) => {
  try {
    const { id, message } = getAdminId(req);
    if (id) {
      const Credentials = req.body;
      const newProperty = new Property({
        noRooms: Credentials?.noRooms,
        noBathrooms: Credentials?.noBathrooms,
      });

      await newProperty.save();

      res.status(200).json({
        status: 200,
        message: "Property Created in Succesfully",
      });
    } else {
      res.status(401).json({ status: 401, message: message });
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

router.post("/Update-Property", async (req, res) => {
  try {
    const { id, message } = getAdminId(req);
    if (id) {
      const Credentials = req.body;

      Property.findOne({ _id: req.body.id })
        .then(async (data) => {
          await Property.updateOne({ _id: data?._id }, Credentials, {
            new: false,
          })
            .then((docs) => {
              res.status(401).json({
                status: 200,
                message: "Your Property has been Updated",
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

router.get("/PropertyInfo/:id", async (req, res) => {
  try {
    const { id, message } = getAdminId(req);
    if (id) {
      Property.findOne({ _id: req.params.id })
        .populate("User")
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

router.get("/GetAllProperty", async (req, res) => {
  try {
    const { id, message } = getAdminId(req);
    if (id) {
      Property.find()
        .populate("User")
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

router.post("/Property-User", async (req, res) => {
  try {
    const { id, message } = getAdminId(req);
    if (id) {
      const searchProperty = await Property.findOne({ _id: req.body.property })
        .then((data) => {
          return data;
        })
        .catch((err) => {
          res.status(500).json({ status: 500, message: err });
        });

      const searchUser = await User.findOne({ _id: req.body.user })
        .then((data) => {
          return data;
        })
        .catch((err) => {
          res.status(500).json({ status: 500, message: err });
        });

      if (searchProperty?._id && searchUser?._id) {
        User.updateOne(
          { _id: req.body.user },
          {
            Property: new mongoose.Types.ObjectId(req.body.property),
            verifiedByAdmin: true,
          }
        )
          .then(async (data) => {
            const setArr = await SetArrManyRelationhip(
              searchProperty?.User,
              req.body?.user,
              res,
              "User already has this property"
            );
            if (setArr.Msg == "Error") {
              return;
            }
            const Users = setArr.Arr;
            Property.updateOne(
              { _id: req.body.property },
              {
                User: Users,
              }
            )
              .then((data) => {
                res
                  .status(200)
                  .json({ status: 200, data: "Property was added to user" });
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
        res
          .status(500)
          .json({ status: 500, message: "Propery or User not Found" });
      }
    } else {
      res.status(401).json({ status: 401, message: message });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ status: 500, message: error });
  }
});

module.exports = router;
