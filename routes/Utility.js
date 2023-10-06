const { Utility } = require("../models/Utility");
const { getAdminId, getUserId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { User } = require("../models/User");
const { default: mongoose } = require("mongoose");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { connectToDB } = require("../Middlewares/Db");
const { SaveImageDB } = require("./Image");
const { Property } = require("../models/Property");
const { Image } = require("../models/Image");
const router = Router();

async function saveImageArr({ ImgArr, id, res }) {
  const ImgIDArr = [];
  await ImgArr.map(async (a, i) => {
    const image = await SaveImageDB(
      a,
      { Utility: new mongoose.Types.ObjectId(id) },
      res
    );
    if (image?.file?._id) {
      ImgIDArr.push(new mongoose.Types.ObjectId(image?.file?._id));
    } else {
      res.status(500).json({ status: 500, message: image?.Error });
    }
  });
}

router.post("/Create-Utility", async (req, res) => {
  try {
    connectToDB();

    const { id, message } = await getAdminId(req);
    if (id) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["title", "description", "status", "Total", "Property", "Image"],
        res
      );
      if (Check) {
        return;
      }

      const searchProperty = await Property.findOne({
        _id: Credentials?.Property,
      });
      const newUtility = new Utility({
        title: Credentials?.title,
        description: Credentials?.description,
        status: Credentials?.status,
        Total: Credentials?.Total,
        Property: new mongoose.Types.ObjectId(Credentials?.Property),
      });

      const ImgArr = [...Credentials?.Image];

      if (searchProperty?._id) {
        // Add Utility to Property
        const Utility_Property = await Utility.find({
          Property: Credentials.Property,
        }).select("_id");
        await Property.updateOne(
          { _id: Credentials.Property },
          {
            Utility: Utility_Property,
          }
        )
          .then(async (data) => {
            await saveImageArr({
              ImgArr,
              id: newUtility?._id,
              res,
            });

            if (ImgArr?.length > 0) {
              const uniqueImage = await Image.find({
                Utility: newUtility?._id,
              }).select("_id");
              newUtility.Image = uniqueImage;
              if (newUtility.Image.length) {
                await newUtility.save();
                res.status(200).json({
                  status: 200,
                  message: "Utility Created in Succesfully",
                });
              }
            } else {
              await newUtility.save();
              res.status(200).json({
                status: 200,
                message: "Utility Created in Succesfully",
              });
            }
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ status: 500, message: err });
          });
      } else if (!searchProperty?._id) {
        res.status(500).json({
          status: 500,
          message: "Sorry Property Not Found",
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

router.get("/UtilityInfo/:id", async (req, res) => {
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

      Utility.findOne({ _id: req.params.id })
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

router.get("/GetAllUtility", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getAdminId(req);
    const { id: userId, message: userMessage } = await getUserId(req);

    if (id || userId) {
      Utility.find()
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

module.exports = router;
