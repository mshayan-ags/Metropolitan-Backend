const { ServiceOffered } = require("../models/ServiceOffered");
const { getAdminId } = require("../utils/AuthCheck");
const { Router } = require("express");
const {
  filterArrayOfObjectAndRemoveRepetitions,
  CheckAllRequiredFieldsAvailaible,
} = require("../utils/functions");
const { connectToDB } = require("../Middlewares/Db");
const { default: mongoose } = require("mongoose");
const { SaveImageDB } = require("./Image");

const router = Router();

router.post("/Create-ServiceOffered", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getAdminId(req);
    if (id) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["Fields", "title", "Icon"],
        res
      );
      if (Check == "Error") {
        return;
      }

      const FieldsArr = JSON.parse(Credentials?.Fields);
      const newFieldsArr = filterArrayOfObjectAndRemoveRepetitions(
        FieldsArr,
        "name"
      );

      const newServiceOffered = new ServiceOffered({
        title: Credentials?.title,
        Fields: newFieldsArr,
      });

      const image = await SaveImageDB(
        Credentials?.Icon,
        { ServiceOffered: new mongoose.Types.ObjectId(newServiceOffered?._id) },
        res
      );

      if (image?.file?._id) {
        newServiceOffered.Icon = new mongoose.Types.ObjectId(image?.file?._id);
      } else {
        res.status(500).json({ status: 500, message: image?.Error });
      }

      await newServiceOffered.save();

      res.status(200).json({
        status: 200,
        message: "ServiceOffered Created in Succesfully",
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

router.post("/Update-ServiceOffered", async (req, res) => {
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

      const searchServiceOffered = await ServiceOffered.findOne({
        _id: Credentials.id,
      });

      if (searchServiceOffered?._id) {
        const FieldsArr = [
          ...JSON.parse(Credentials?.Fields),
          ...searchServiceOffered?.Fields,
        ];
        const newFieldsArr = filterArrayOfObjectAndRemoveRepetitions(
          FieldsArr,
          "name"
        );

        if (JSON.parse(Credentials?.Icon)?.name) {
          const image = await SaveImageDB(
            Credentials?.Icon,
            {
              ServiceOffered: new mongoose.Types.ObjectId(
                searchServiceOffered?._id
              ),
            },
            res
          );
          if (image?.file?._id) {
            Credentials.Icon = new mongoose.Types.ObjectId(image?.file?._id);
          } else {
            res.status(500).json({ status: 500, message: image?.Error });
          }
        }

        await ServiceOffered.updateOne(
          { _id: searchServiceOffered?._id },
          {
            title: Credentials?.title
              ? Credentials?.title
              : searchServiceOffered?.title,
            Fields: newFieldsArr,
            Icon: Credentials?.Icon
              ? Credentials?.Icon
              : searchServiceOffered?.Icon,
          },
          {
            new: false,
          }
        )
          .then((docs) => {
            res.status(200).json({
              status: 200,
              message: "Your ServiceOffered has been Updated",
            });
          })
          .catch((error) => {
            console.log(error);
            res.status(500).json({ status: 500, message: error });
          });
      } else {
        res.status(500).json({ status: 500, message: error });
      }
    } else {
      res.status(401).json({ status: 401, message: message });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error });
  }
});

router.get("/ServiceOfferedInfo/:id", async (req, res) => {
  try {
    connectToDB();
    const Check = await CheckAllRequiredFieldsAvailaible(
      req?.params,
      ["id"],
      res
    );
    if (Check == "Error") {
      return;
    }
    ServiceOffered.findOne({ _id: req.params.id })
      .populate("Icon")
      .then((data) => {
        res.status(200).json({ status: 200, data: data });
      })
      .catch((err) => {
        res.status(500).json({ status: 500, message: err });
      });
  } catch (error) {
    res.status(500).json({ status: 500, message: error });
  }
});

router.get("/GetAllServiceOffered", async (req, res) => {
  try {
    connectToDB();
    ServiceOffered.find()
      .populate("Icon")
      .then((data) => {
        res.status(200).json({ status: 200, data: data });
      })
      .catch((err) => {
        res.status(500).json({ status: 500, message: err });
      });
  } catch (error) {
    res.status(500).json({ status: 500, message: error });
  }
});

module.exports = router;
