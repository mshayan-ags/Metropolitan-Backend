const { Property } = require("../models/Property");
const { getAdminId, getUserId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { User } = require("../models/User");
const { default: mongoose } = require("mongoose");
const { SetArrManyRelationhip } = require("../utils/SetArrManyRelationhip");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { connectToDB } = require("../Middlewares/Db");
const { SaveImageDB } = require("./Image");

const router = Router();

router.post("/Create-Property", async (req, res) => {
  try {
    connectToDB();

    const { id, message } = await getAdminId(req);
    if (id) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["noRooms", "noBathrooms", "description", "images"],
        res
      );
      if (Check == "Error") {
        return;
      }

      const newProperty = new Property({
        noRooms: Credentials?.noRooms,
        noBathrooms: Credentials?.noBathrooms,
        description: Credentials?.description,
      });

      const ImgArr = JSON.parse(Credentials?.images);

      if (ImgArr?.length > 0) {
        const ImgIDArr = [];
        await ImgArr.map(async (a) => {
          const image = await SaveImageDB(
            a,
            { Property: new mongoose.Types.ObjectId(newProperty?._id) },
            res
          );
          if (image?.file?._id) {
            ImgIDArr.push(new mongoose.Types.ObjectId(image?.file?._id));
          } else {
            res.status(500).json({ status: 500, message: image?.Error });
          }
        });

        const uniqueImage = [...new Set(ImgIDArr)];

        newProperty.Image = uniqueImage;

        await newProperty.save();

        res.status(200).json({
          status: 200,
          message: "Property Created in Succesfully",
        });
      } else {
        res.status(500).json({
          status: 500,
          message: "Images are Corrupted or not in proper format",
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
      if (Check == "Error") {
        return;
      }

      const searchProperty = await Property.findOne({ _id: Credentials.id });
      if (searchProperty?._id) {
        const ImgArr = JSON.parse(Credentials?.images);

        if (ImgArr?.length > 0) {
          const ImgIDArr = [];
          await ImgArr.map(async (a) => {
            const image = await SaveImageDB(
              a,
              { Property: new mongoose.Types.ObjectId(searchProperty?._id) },
              res
            );
            if (image?.file?._id) {
              ImgIDArr.push(new mongoose.Types.ObjectId(image?.file?._id));
            } else {
              res.status(500).json({ status: 500, message: image?.Error });
            }
          });

          const uniqueImage = [...new Set(ImgIDArr)];

          Credentials.Image = uniqueImage;
        }
        await Property.updateOne({ _id: data?._id }, Credentials, {
          new: false,
        })
          .then((docs) => {
            res.status(200).json({
              status: 200,
              message: "Your Property has been Updated",
            });
          })
          .catch((error) => {
            res.status(500).json({ status: 500, message: error });
          });
      } else {
        res.status(500).json({ status: 500, message: "Property not Found" });
      }
    } else {
      res.status(401).json({ status: 401, message: message });
    }
  } catch (error) {
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
      if (Check == "Error") {
        return;
      }

      Property.findOne({ _id: req.params.id })
        .populate("User")
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

router.get("/GetAllProperty", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getAdminId(req);
    const { id: userId, message: userMessage } = await getUserId(req);

    if (id || userId) {
      Property.find()
        .populate("User")
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
      if (Check == "Error") {
        return;
      }
      const searchProperty = await Property.findOne({ _id: req.body.property });
      const searchUser = await User.findOne({ _id: req.body.user });

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
              res
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
