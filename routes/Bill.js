const { Bill } = require("../models/Bill");
const { getAdminId, getUserId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { default: mongoose } = require("mongoose");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { connectToDB } = require("../Middlewares/Db");
const { Property } = require("../models/Property");
const { Service } = require("../models/Service");
const { ServiceOffered } = require("../models/ServiceOffered");

const router = Router();

router.post("/Create-Bill", async (req, res) => {
  try {
    connectToDB();

    const { id, message } = await getAdminId(req);
    if (id) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["status", "Property", "Service", "AdditionalCharges"],
        res
      );
      if (Check) {
        return;
      }

      let Total = 0;

      const searchProperty = await Property.findOne({
        _id: Credentials?.Property,
      });
      const searchService = await Service.findOne({
        _id: Credentials?.Service,
      });
      const searchServiceOffered = await ServiceOffered.findOne({
        _id: searchService?.ServiceOffered,
      });
      if (
        searchProperty?._id &&
        searchServiceOffered?._id &&
        searchService?._id &&
        (!searchService?.Bill || searchService?.Bill == "")
      ) {
        // Calculate Charges

        // Get all fields
        const Field = searchServiceOffered?.Fields;

        // Get all unique fields names
        const FieldNames = searchServiceOffered?.Fields.map((a) => a?.name);
        const uniqueFieldNames = [...new Set(FieldNames)];

        const Obj = {};

        // Create all empty fields
        uniqueFieldNames.map((val) => {
          Obj[val] = 0;
        });

        // Set fields Price
        Field.map((val) => {
          if (parseInt(searchService?.get(`FieldValues.${val?.name}`)) > 0) {
            let PricePerUnit = val?.pricePerUnit || 0;
            let TotalPrice =
              parseInt(searchService?.get(`FieldValues.${val?.name}`)) *
              parseInt(PricePerUnit);
            Obj[val?.name] = parseInt(TotalPrice);
            Total += parseInt(TotalPrice);
          }
        });

        const AdditionalCharges = Credentials?.AdditionalCharges;

        const AdditionalChargesKeys = Object.keys(AdditionalCharges);
        // Add Additional Prices
        AdditionalChargesKeys.map((val) => {
          if (parseInt(AdditionalCharges[val]) > 0) {
            let TotalPrice = AdditionalCharges[val];
            Total += parseInt(TotalPrice);
          }
        });

        const newBill = new Bill({
          status: Credentials?.status,
          Total: parseInt(Total),
          Discount: parseInt(Credentials?.Discount),
          TotalAfterDiscount: parseInt(
            parseInt(Total) - parseInt(Credentials?.Discount)
          ),
          reasonForDiscount: Credentials?.reasonForDiscount,
          Details: Obj,
          AdditionalCharges: AdditionalCharges,
          FieldsOfServiceOffered: searchServiceOffered?.Fields,
          Property: new mongoose.Types.ObjectId(Credentials?.Property),
          Service: new mongoose.Types.ObjectId(Credentials?.Service),
        });

        const saveBill = await newBill.save();
        if (saveBill?._id) {
          Service.updateOne(
            { _id: Credentials?.Service },
            {
              Bill: saveBill?._id,
            }
          )
            .then(async (data) => {
              // Add Bill to Property
              const Bill_Property = await Bill.find({
                Property: Credentials.Property,
              }).select("_id");

              Property.updateOne(
                { _id: Credentials?.Property },
                {
                  Service: Bill_Property,
                }
              )
                .then((data) => {
                  res.status(200).json({
                    status: 200,
                    message: "Bill Created in Succesfully",
                  });
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).json({ status: 500, message: err });
                });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({ status: 500, message: err });
            });
        } else {
          res
            .status(401)
            .json({ status: 401, message: "There was Some Issue Saving Bill" });
        }
      } else {
        res
          .status(401)
          .json({ status: 401, message: "Please Check Your Data" });
      }
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

router.post("/Update-Bill", async (req, res) => {
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

      const searchBill = await Bill.findOne({
        _id: Credentials?.id,
      });

      if (searchBill?._id) {
        let Total = 0;

        const searchService = await Service.findOne({
          _id: Credentials?.Service,
        });

        if (searchService?._id) {
          // Calculate Charges

          // Get all fields
          const Field = searchBill?.FieldsOfServiceOffered;

          // Get all unique fields names
          const FieldNames = searchBill?.FieldsOfServiceOffered.map(
            (a) => a?.name
          );
          const uniqueFieldNames = [...new Set(FieldNames)];

          const Obj = {};

          // Create all empty fields
          uniqueFieldNames.map((val) => {
            Obj[val] = 0;
          });

          // Set fields Price
          Field.map((val) => {
            if (parseInt(searchService?.get(`FieldValues.${val?.name}`)) > 0) {
              let PricePerUnit = val?.pricePerUnit || 0;
              let TotalPrice =
                parseInt(searchService?.get(`FieldValues.${val?.name}`)) *
                parseInt(PricePerUnit);
              Obj[val?.name] = parseInt(TotalPrice);
              Total += parseInt(TotalPrice);
            }
          });

          const AdditionalCharges = {
            ...searchBill?.AdditionalCharges.toJSON(),
            ...Credentials?.AdditionalCharges,
          };

          const AdditionalChargesKeys = Object.keys(AdditionalCharges);
          // Add Additional Prices
          AdditionalChargesKeys.map((val) => {
            if (parseInt(AdditionalCharges[val]) > 0) {
              let TotalPrice = AdditionalCharges[val];
              Total += parseInt(TotalPrice);
            }
          });

          const updateBill = {
            status: Credentials?.status,
            Total: parseInt(Total),
            Discount: parseInt(Credentials?.Discount),
            TotalAfterDiscount: parseInt(
              parseInt(Total) - parseInt(Credentials?.Discount)
            ),
            reasonForDiscount: Credentials?.reasonForDiscount,
            Details: Obj,
            AdditionalCharges: AdditionalCharges,
          };

          Bill.updateOne({ _id: Credentials?.id }, updateBill, { new: false })
            .then((data) => {
              res.status(200).json({
                status: 200,
                message: "Bill Updated in Succesfully",
              });
            })
            .catch((error) => {
              res.status(500).json({
                status: 500,
                message: error,
              });
            });
        } else {
          res
            .status(401)
            .json({ status: 401, message: "Please Check Your Data" });
        }
      } else {
        res
          .status(401)
          .json({ status: 401, message: "Please Check Your Data" });
      }
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

router.get("/BillInfo/:id", async (req, res) => {
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

      Bill.findOne({ _id: req.params.id })
        .populate("Property", "Service")
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

router.get("/GetAllBill", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getAdminId(req);
    const { id: userId, message: userMessage } = await getUserId(req);

    if (id || userId) {
      Bill.find()
        .populate("Property", "Service")
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
