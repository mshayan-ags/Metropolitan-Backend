const { ServiceOffered } = require("../models/ServiceOffered");
const { getAdminId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { filterArrayAndRemoveRepetitions } = require("../utils/functions");

const router = Router();

router.post("/Create-ServiceOffered", async (req, res) => {
  try {
    const { id, message } = getAdminId(req);
    if (id) {
      const Credentials = req.body;

      console.log(Credentials?.Fields);
      const FieldsArr = JSON.parse(Credentials?.Fields);
      const newFieldsArr = filterArrayAndRemoveRepetitions(FieldsArr, "name");

      const newServiceOffered = new ServiceOffered({
        title: Credentials?.title,
        Fields: newFieldsArr,
      });

      await newServiceOffered.save();

      res.status(200).json({
        status: 200,
        message: "ServiceOffered Created in Succesfully",
      });
    } else {
      res.status(401).json({ status: 401, message: message });
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

router.post("/Update-ServiceOffered", async (req, res) => {
  try {
    const { id, message } = getAdminId(req);
    if (id) {
      const Credentials = req.body;

      ServiceOffered.findOne({ _id: req.body.id })
        .then(async (data) => {
          const FieldsArr = [
            ...JSON.parse(Credentials?.Fields),
            ...data?.Fields,
          ];
          const newFieldsArr = filterArrayAndRemoveRepetitions(
            FieldsArr,
            "name"
          );

          await ServiceOffered.updateOne(
            { _id: data?._id },
            {
              title: Credentials?.title ? Credentials?.title : data?.title,
              Fields: newFieldsArr,
            },
            {
              new: false,
            }
          )
            .then((docs) => {
              res.status(401).json({
                status: 200,
                message: "Your ServiceOffered has been Updated",
              });
            })
            .catch((error) => {
              console.log(error);
              res.status(500).json({ status: 500, message: error });
            });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({ status: 500, message: error });
        });
    } else {
      res.status(401).json({ status: 401, message: message });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: error });
  }
});

router.get("/ServiceOfferedInfo/:id", async (req, res) => {
  try {
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
