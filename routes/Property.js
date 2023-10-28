const { Property } = require("../models/Property");
const { getAdminId, getUserId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { User } = require("../models/User");
const { default: mongoose } = require("mongoose");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { connectToDB } = require("../Middlewares/Db");
const { SaveImageDB } = require("./Image");
const { Image } = require("../models/Image");
const { UserProperty } = require("../models/UserProperty");

const router = Router();

async function saveImageArr({ ImgArr, id, res }) {
  const ImgIDArr = [];
  await ImgArr.map(async (a, i) => {
    const image = await SaveImageDB(
      a,
      { Property: new mongoose.Types.ObjectId(id) },
      res
    );
    if (image?.file?._id) {
      ImgIDArr.push(new mongoose.Types.ObjectId(image?.file?._id));
    } else {
      res.status(500).json({ status: 500, message: image?.Error });
    }
  });
}

router.post("/Create-Property", async (req, res) => {
  try {
    connectToDB();

    const { id, message } = await getAdminId(req);
    if (id) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["FlatNo", "Floor", "Tower", "Category", "description"],
        res
      );
      if (Check) {
        return;
      }

      const newProperty = new Property({
        FlatNo: Credentials?.FlatNo,
        Floor: Credentials?.Floor,
        Tower: Credentials?.Tower,
        Tower_FlatNo: `${Credentials?.Tower}_${Credentials?.FlatNo}`,
        Category: Credentials?.Category,
        description: Credentials?.description,
      });

      const ImgArr = [...Credentials?.Image];

      if (ImgArr?.length > 0) {
        await saveImageArr({
          ImgArr,
          id: newProperty?._id,
          res,
        });
        const uniqueImage = await Image.find({
          Property: newProperty?._id,
        }).select("_id");

        newProperty.Image = await uniqueImage;
        await newProperty.save();
        res.status(200).json({
          status: 200,
          message: "Property Created in Succesfully",
        });
      } else {
        await newProperty.save();
        res.status(200).json({
          status: 200,
          message: "Property Created in Succesfully",
        });
      }
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
    connectToDB();

    const { id, message } = await getAdminId(req);
    if (id) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["id"],
        res
      );
      if (Check) {
        return;
      }

      const searchProperty = await Property.findOne({ _id: Credentials.id });
      if (searchProperty?._id) {
        if (Credentials?.Image) {
          const ImgArr = [...Credentials?.Image];

          if (ImgArr?.length > 0) {
            await saveImageArr({
              ImgArr,
              id: searchProperty?._id,
              res,
            });
            const uniqueImage = await Image.find({
              Property: searchProperty?._id,
            }).select("_id");

            Credentials.Image = uniqueImage;
          }
        }
        await Property.updateOne(
          { _id: searchProperty?._id },
          {
            ...Credentials,
            Tower_FlatNo: `${
              Credentials?.Tower ? Credentials?.Tower : searchProperty?.Tower
            }_${
              Credentials?.FlatNo ? Credentials?.FlatNo : searchProperty?.FlatNo
            }`,
          },
          {
            new: false,
          }
        )
          .then((docs) => {
            res.status(200).json({
              status: 200,
              message: "Your Property has been Updated",
            });
          })
          .catch((error) => {
            console.log(error);
            res.status(500).json({ status: 500, message: error });
          });
      } else {
        console.log("Property not Found");
        res.status(500).json({ status: 500, message: "Property not Found" });
      }
    } else {
      res.status(401).json({ status: 401, message: message });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: error });
  }
});

router.get("/PropertyInfo/:id", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getAdminId(req);
    const { id: userId, message: userMessage } = await getUserId(req);
    if (id || userId) {
      const Check = await CheckAllRequiredFieldsAvailaible(
        req.params,
        ["id"],
        res
      );
      if (Check) {
        return;
      }

      Property.findOne({ _id: req.params.id })
        .populate([
          "User",
          "Service",
          "Utility",
          "Image",
          "Bill",
          // "Notification",
          "Payment",
        ])
        .then((data) => {
          res.status(200).json({ status: 200, data: data });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ status: 500, message: err });
        });
    } else {
      res.status(401).json({ status: 401, message: message || userMessage });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ status: 500, message: error });
  }
});

router.get("/GetAllProperty", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getAdminId(req);
    const { id: userId, message: userMessage } = await getUserId(req);

    if (id || userId) {
      Property.find()
        .populate(["User", "Service", "Image"])
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

router.post("/Property-User", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getAdminId(req);
    if (id) {
      const Check = await CheckAllRequiredFieldsAvailaible(
        req.body,
        ["property", "user"],
        res
      );
      if (Check) {
        return;
      }
      const searchProperty = await Property.findOne({ _id: req.body.property });
      const searchUser = await User.findOne({ _id: req.body.user });

      if (searchProperty?._id && searchUser?._id) {
        const newUserProperty = new UserProperty({
          Type: req?.body?.Type,
          From: new Date(),
          Property: new mongoose.Types.ObjectId(req.body.property),
          User: new mongoose.Types.ObjectId(req.body.user),
        });

        await newUserProperty.save();

        const User_Property_Details = await UserProperty.find({
          User: req.body.user,
        }).select("_id");

        const Property_User_Details = await UserProperty.find({
          User: req.body.user,
        }).select("_id");

        User.updateOne(
          { _id: req.body.user },
          {
            Property: new mongoose.Types.ObjectId(req.body.property),
            verifiedByAdmin: true,
            Type: req?.body?.Type,
            UserProperty: User_Property_Details,
          }
        )
          .then(async (data) => {
            const User_Property = await User.find({
              Property: req.body.property,
            }).select("_id");

            Property.updateOne(
              { _id: req.body.property },
              {
                User: User_Property,
                UserProperty: Property_User_Details,
              }
            )
              .then((data) => {
                res
                  .status(200)
                  .json({ status: 200, data: "Property was added to user" });
              })
              .catch((err) => {
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
    res.status(500).json({ status: 500, message: error });
  }
});

router.post("/Remove-Property-User", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getAdminId(req);
    if (id) {
      const Check = await CheckAllRequiredFieldsAvailaible(
        req.body,
        ["property", "user"],
        res
      );
      if (Check) {
        return;
      }
      const searchProperty = await Property.findOne({ _id: req.body.property });
      const searchUser = await User.findOne({ _id: req.body.user });
      const searchUserProperty = await UserProperty.find({
        Property: req.body.property,
        User: req.body.user,
      });

      if (
        searchProperty?._id &&
        searchUser?._id &&
        searchUserProperty[searchUserProperty?.length - 1]?._id
      ) {
        UserProperty.updateOne(
          { _id: searchUserProperty[searchUserProperty?.length - 1]?._id },
          {
            To: new Date(),
          }
        )
          .then(async (data) => {
            User.updateOne(
              { _id: req.body.user },
              {
                Property: null,
                Type: "",
                verifiedByAdmin: false,
              }
            )
              .then(async (data) => {
                const Users = await User.find({
                  Property: req.body.property,
                }).select("_id");
                Property.updateOne(
                  { _id: req.body.property },
                  {
                    User: Users,
                  }
                )
                  .then((data) => {
                    res.status(200).json({
                      status: 200,
                      data: "Property was removed to user",
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
        res
          .status(500)
          .json({ status: 500, message: "Propery or User not Found" });
      }
    } else {
      res.status(401).json({ status: 401, message: message });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error });
  }
});

module.exports = router;
