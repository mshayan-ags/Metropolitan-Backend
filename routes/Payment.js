const { Payment } = require("../models/Payment");
const { getAdminId, getUserId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { User } = require("../models/User");
const { default: mongoose } = require("mongoose");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { connectToDB } = require("../Middlewares/Db");
const { SaveImageDB } = require("./Image");
const { Property } = require("../models/Property");
const { Service } = require("../models/Service");
const { Bill } = require("../models/Bill");

const router = Router();

router.post("/Create-Payment", async (req, res) => {
  try {
    connectToDB();

    const { id, message } = await getAdminId(req);
    const { id: userId, message: userMessage } = await getUserId(req);
    if (id || userId) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["Amount", "Type", "description", "Property", "Service", "Bill"],
        res
      );
      if (Check) {
        return;
      }

      const searchProperty = await Property.findOne({
        _id: Credentials?.Property,
      });
      const searchService = await Service.findOne({
        _id: Credentials?.Service,
      });
      const searchBill = await Bill.findOne({ _id: Credentials?.Bill });

      if (
        searchProperty?._id &&
        searchService?._id &&
        searchBill?._id &&
        parseInt(searchBill?.TotalAfterDiscount) ==
          parseInt(Credentials?.Amount)
      ) {
        const newPayment = new Payment({
          Amount: Credentials?.Amount,
          Type: Credentials?.Type,
          description: Credentials?.description,
          Property: new mongoose.Types.ObjectId(Credentials?.Property),
          Service: new mongoose.Types.ObjectId(Credentials?.Service),
          Bill: new mongoose.Types.ObjectId(Credentials?.Bill),
        });

        await newPayment.save();

        res.status(200).json({
          status: 200,
          message: "Payment Created in Succesfully",
        });
      } else if (
        parseInt(searchBill?.TotalAfterDiscount) !=
        parseInt(Credentials?.Amount)
      ) {
        res.status(500).json({
          status: 500,
          message: "Sorry Amount you're Paying is less than total",
        });
      } else {
        res.status(500).json({
          status: 500,
          message: "Sorry There was a Error in Saving Payment",
        });
      }
    } else {
      res.status(500).json({
        status: 500,
        message: message || userMessage,
      });
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

router.get("/PaymentInfo/:id", async (req, res) => {
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

      Payment.findOne({ _id: req.params.id })
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

router.get("/GetAllPayment", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getAdminId(req);
    const { id: userId, message: userMessage } = await getUserId(req);

    if (id || userId) {
      Payment.find()
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
