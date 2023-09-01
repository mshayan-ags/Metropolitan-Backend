const { DailyReport } = require("../models/DailyReport");
const { getUserId, getUserId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { connectToDB } = require("../Middlewares/Db");
const router = Router();

router.post("/Create-DailyReport", async (req, res) => {
  try {
    connectToDB();

    const { id, message } = await getUserId(req);
    if (id) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        [
          "FileNo",
          "PO",
          "ItemDescription",
          "NetWeight",
          "GWeight",
          "Containers",
          "Currency",
          "ShippmentAmount",
          "Vessel",
          "ETA",
          "PortOfLoading",
          "IGM_NO",
          "IGM_Date",
          "OFFLoadingPort",
          "PCL",
          "OrignalDocumentReceiveDate",
          "Remarks",
          "Status",
          "LastDemurageDate",
          "EstimatedDemurage",
          "LastDetentionDate",
          "ExchangeRate",
          "CustomDuty",
          "ACDuty",
          "RD",
          "SaleTax",
          "IncomeTax",
          "TotalDuty",
        ],
        res
      );
      if (Check == "Error") {
        return;
      }

      const newDailyReport = new DailyReport(Credentials);

      await newDailyReport.save();

      res.status(200).json({
        status: 200,
        message: "DailyReport Created in Succesfully",
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

router.post("/Update-DailyReport", async (req, res) => {
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

      const searchDailyReport = await DailyReport.findOne({ _id: Credentials.id });
      if (searchDailyReport?._id) {
        await DailyReport.updateOne({ _id: data?._id }, Credentials, {
          new: false,
        })
          .then((docs) => {
            res.status(200).json({
              status: 200,
              message: "Your DailyReport has been Updated",
            });
          })
          .catch((error) => {
            res.status(500).json({ status: 500, message: error });
          });
      } else {
        res.status(500).json({ status: 500, message: "DailyReport not Found" });
      }
    } else {
      res.status(401).json({ status: 401, message: message });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error });
  }
});

router.get("/DailyReportInfo/:id", async (req, res) => {
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

      DailyReport.findOne({ _id: req.params.id })
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

router.get("/GetAllDailyReport", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getUserId(req);
    const { id: userId, message: userMessage } = await getUserId(req);

    if (id || userId) {
      DailyReport.find()
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
