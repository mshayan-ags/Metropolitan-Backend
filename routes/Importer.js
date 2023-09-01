const { getUserId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { connectToDB } = require("../Middlewares/Db");
const Importer = require("../models/importer");
const router = Router();

router.post("/Create-Importer", async (req, res) => {
  try {
    connectToDB();

    const { id, message } = await getUserId(req);
    if (id) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["name", "shortName", "ntnNumber", "str_gd", "ist", "address"],
        res
      );
      if (Check == "Error") {
        return;
      }

      const newImporter = new Importer(Credentials);

      await newImporter.save();

      res.status(200).json({
        status: 200,
        message: "Importer Created in Succesfully",
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

router.post("/Update-Importer", async (req, res) => {
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

      const searchImporter = await Importer.findOne({ _id: Credentials.id });
      if (searchImporter?._id) {
        await Importer.updateOne({ _id: data?._id }, Credentials, {
          new: false,
        })
          .then((docs) => {
            res.status(200).json({
              status: 200,
              message: "Your Importer has been Updated",
            });
          })
          .catch((error) => {
            res.status(500).json({ status: 500, message: error });
          });
      } else {
        res.status(500).json({ status: 500, message: "Importer not Found" });
      }
    } else {
      res.status(401).json({ status: 401, message: message });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error });
  }
});

router.get("/ImporterInfo/:id", async (req, res) => {
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

      Importer.findOne({ _id: req.params.id })
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

router.get("/GetAllImporter", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getUserId(req);
    const { id: userId, message: userMessage } = await getUserId(req);

    if (id || userId) {
      Importer.find()
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
