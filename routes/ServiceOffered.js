const { ServiceOffered } = require("../models/ServiceOffered");
const { getAdminId } = require("../utils/AuthCheck");
const { Router } = require("express");
const {
  filterArrayOfObjectAndRemoveRepetitions,
  CheckAllRequiredFieldsAvailaible,
} = require("../utils/functions");

const router = Router();

router.post("/Create-ServiceOffered", async (req, res) => {
  try {
    const { id, message } = await getAdminId(req);
    if (id) {
      const Credentials = req.body;

      const Check = CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["Fields", "title"],
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
    const { id, message } = await getAdminId(req);
    if (id) {
      const Credentials = req.body;

      const Check = CheckAllRequiredFieldsAvailaible(Credentials, ["id"], res);
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

        await ServiceOffered.updateOne(
          { _id: searchServiceOffered?._id },
          {
            title: Credentials?.title
              ? Credentials?.title
              : searchServiceOffered?.title,
            Fields: newFieldsArr,
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
    const Check = CheckAllRequiredFieldsAvailaible(req?.params, ["id"], res);
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
