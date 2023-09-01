const { getUserId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { connectToDB } = require("../Middlewares/Db");
const Importer = require("../models/importer");
const { SetArrManyRelationhip } = require("../utils/SetArrManyRelationhip");
const DataEntry = require("../models/DataEntry");
const router = Router();

router.post("/Create-DataEntry", async (req, res) => {
  try {
    connectToDB();

    const { id, message } = await getUserId(req);
    if (id) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        [
          "IC",
          "SAP",
          "INB",
          "BL",
          "Weight",
          "Package",
          "Supplier",
          "Description",
          "Inv",
          "ShippingPort",
          "ShippingLine",
          "BLDate",
          "Terminal",
          "DocreeDate",
          "ShipBy",
          "TypeOfDocument",
          "Importer",
        ],
        res
      );
      if (Check == "Error") {
        return;
      }

      const searchImporter = await Importer.findOne({
        _id: Credentials?.Importer,
      });
      if (searchImporter?._id) {
        const newDataEntry = new DataEntry({
          ...Credentials,
          Importer: new mongoose.Types.ObjectId(Credentials?.Importer),
        });

        if (newDataEntry?._id) {
          // Add Bill to Importer
          const setArrImporter = await SetArrManyRelationhip(
            searchImporter?.DataEntry,
            newDataEntry?._id,
            res
          );
          if (setArrImporter.Msg == "Error") {
            return;
          }
          const DataEntry_Importer = setArrImporter.Arr;

          Importer.updateOne(
            { _id: Credentials?.Importer },
            {
              DataEntry: DataEntry_Importer,
            }
          )
            .then(async (data) => {
              await newDataEntry.save();

              res.status(200).json({
                status: 200,
                message: "DataEntry Created in Succesfully",
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({ status: 500, message: err });
            });
        }
      } else {
        res.status(401).json({ status: 401, message: "Importer Not Found" });
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

router.post("/Update-DataEntry", async (req, res) => {
  try {
    connectToDB();

    const { id, message } = await getUserId(req);
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

      const searchDataEntry = await DataEntry.findOne({ _id: Credentials.id });
      if (searchDataEntry?._id) {
        await DataEntry.updateOne({ _id: data?._id }, Credentials, {
          new: false,
        })
          .then((docs) => {
            res.status(200).json({
              status: 200,
              message: "Your DataEntry has been Updated",
            });
          })
          .catch((error) => {
            res.status(500).json({ status: 500, message: error });
          });
      } else {
        res.status(500).json({ status: 500, message: "DataEntry not Found" });
      }
    } else {
      res.status(401).json({ status: 401, message: message });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error });
  }
});

router.get("/DataEntryInfo/:id", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getUserId(req);
    if (id) {
      const Check = await CheckAllRequiredFieldsAvailaible(
        req.params,
        ["id"],
        res
      );
      if (Check == "Error") {
        return;
      }

      DataEntry.findOne({ _id: req.params.id })
        .populate("Importer")
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

router.get("/GetAllDataEntry", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getUserId(req);
    const { id: userId, message: userMessage } = await getUserId(req);

    if (id || userId) {
      DataEntry.find()
        .populate("Importer")
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
    console.log(error)
    res.status(500).json({ status: 500, message: error });
  }
});

module.exports = router;
