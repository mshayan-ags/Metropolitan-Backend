const { Service } = require("../models/Service");
const { getUserId, getAdminId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { User } = require("../models/User");
const { default: mongoose } = require("mongoose");
const { SetArrManyRelationhip } = require("../utils/SetArrManyRelationhip");
const { ServiceOffered } = require("../models/ServiceOffered");
const { Property } = require("../models/Property");
const { Admin } = require("../models/Admin");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { connectToDB } = require("../Middlewares/Db");

const router = Router();

router.post("/Request-Service", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getUserId(req);
    if (id) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["status", "Value", "description", "Property", "ServiceOffered"],
        res
      );
      if (Check == "Error") {
        return;
      }

      const searchServiceOffered = await ServiceOffered.findOne({
        _id: Credentials?.ServiceOffered,
      });

      const searchProperty = await Property.findOne({
        _id: Credentials?.Property,
      });

      if (searchServiceOffered?._id && searchProperty?._id) {
        // Get all fields
        const Field = searchServiceOffered?.Fields;

        // Get all unique fields names
        const FieldNames = searchServiceOffered?.Fields.map((a) => a?.name);
        const uniqueFieldNames = [...new Set(FieldNames)];

        // Get all fields values from user
        const FieldValues = JSON.parse(Credentials?.Value);
        const Obj = {};

        // Create all empty fields
        uniqueFieldNames.map((val) => {
          Obj[val] = "";
        });

        // Set all fields values
        Field.map((val) => {
          if (FieldValues?.[val?.name] && val?.forUser) {
            Obj[val?.name] = FieldValues?.[val?.name];
          }
        });

        // Create Service
        const newService = new Service({
          status: Credentials?.status,
          description: Credentials?.description,
          Property: new mongoose.Types.ObjectId(Credentials?.Property),
          ServiceOffered: new mongoose.Types.ObjectId(
            Credentials?.ServiceOffered
          ),
          FieldValues: Obj,
        });

        const saveService = await newService.save();

        // Add Service to ServiceOffered
        const setArr = await SetArrManyRelationhip(
          searchServiceOffered?.Service,
          saveService?._id,
          res
        );
        if (setArr.Msg == "Error") {
          return;
        }
        const Service_ServiceOffered = setArr.Arr;
        ServiceOffered.updateOne(
          { _id: Credentials.ServiceOffered },
          {
            Service: Service_ServiceOffered,
          }
        )
          .then(async (data) => {
            // Add Service to Property
            const setArrProperty = await SetArrManyRelationhip(
              searchProperty?.Service,
              saveService?._id,
              res
            );
            if (setArrProperty.Msg == "Error") {
              return;
            }
            const Service_Property = setArrProperty.Arr;
            Property.updateOne(
              { _id: Credentials?.Property },
              {
                Service: Service_Property,
              }
            )
              .then((data) => {
                res.status(200).json({
                  status: 200,
                  message: "Service Created in Succesfully",
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({ status: 500, message: err });
              });
          })
          .catch((err) => {
            res.status(500).json({ status: 500, message: err });
          });
      } else {
        res
          .status(401)
          .json({ status: 401, message: "Please Check Your Data" });
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

router.post("/Create-Service", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getAdminId(req);
    if (id) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["status", "Value", "description", "Property", "ServiceOffered"],
        res
      );
      if (Check == "Error") {
        return;
      }

      const searchServiceOffered = await ServiceOffered.findOne({
        _id: Credentials?.ServiceOffered,
      });

      const searchProperty = await Property.findOne({
        _id: Credentials?.Property,
      });

      const searchAdmin = await Admin.findOne({
        _id: id,
      });

      if (
        searchServiceOffered?._id &&
        searchProperty?._id &&
        searchAdmin?._id
      ) {
        // Get all fields
        const Field = searchServiceOffered?.Fields;

        // Get all unique fields names
        const FieldNames = searchServiceOffered?.Fields.map((a) => a?.name);
        const uniqueFieldNames = [...new Set(FieldNames)];

        // Get all fields values from user
        const FieldValues = JSON.parse(Credentials?.Value);
        const Obj = {};

        // Create all empty fields
        uniqueFieldNames.map((val) => {
          Obj[val] = "";
        });

        // Set all fields values
        Field.map((val) => {
          if (FieldValues?.[val?.name]) {
            Obj[val?.name] = FieldValues?.[val?.name];
          }
        });

        // Create Service
        const newService = new Service({
          status: Credentials?.status,
          description: Credentials?.description,
          reason: Credentials?.reason,
          Property: new mongoose.Types.ObjectId(Credentials?.Property),
          ServiceOffered: new mongoose.Types.ObjectId(
            Credentials?.ServiceOffered
          ),
          FieldValues: Obj,
          Admin: new mongoose.Types.ObjectId(id),
        });

        const saveService = await newService.save();

        // Add Service to Admin
        const setArrProperty = await SetArrManyRelationhip(
          searchAdmin?.Service,
          saveService?._id,
          res
        );
        if (setArrProperty.Msg == "Error") {
          return;
        }
        const Service_Admin = setArrProperty.Arr;
        Admin.updateOne(
          { _id: id },
          {
            Service: Service_Admin,
          }
        )
          .then(async (data) => {
            // Add Service to ServiceOffered
            const setArr = await SetArrManyRelationhip(
              data?.Service,
              saveService?._id,
              res
            );
            if (setArr.Msg == "Error") {
              return;
            }
            const Service_ServiceOffered = setArr.Arr;
            ServiceOffered.updateOne(
              { _id: req.body.ServiceOffered },
              {
                Service: Service_ServiceOffered,
              }
            )
              .then(async (data) => {
                // Add Service to Property
                const setArrProperty = await SetArrManyRelationhip(
                  searchProperty?.Service,
                  saveService?._id,
                  res
                );
                if (setArrProperty.Msg == "Error") {
                  return;
                }
                const Service_Property = setArrProperty.Arr;
                Property.updateOne(
                  { _id: req.body.Property },
                  {
                    Service: Service_Property,
                  }
                )
                  .then((data) => {
                    res.status(200).json({
                      status: 200,
                      message: "Service Created in Succesfully",
                    });
                  })
                  .catch((err) => {
                    console.log(err);
                    res.status(500).json({ status: 500, message: err });
                  });
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

router.post("/Update-Service", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getAdminId(req);
    if (id) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["id", "ServiceOffered"],
        res
      );
      if (Check == "Error") {
        return;
      }

      const currAdmin = await Admin.findOne({ _id: id });
      const currServiceOffered = await ServiceOffered.findOne({
        _id: Credentials.ServiceOffered,
      });
      const currService = await Service.findOne({ _id: Credentials.id });

      // Get all fields
      const Field = currServiceOffered?.Fields;

      // Get all unique fields names
      const FieldNames = currServiceOffered?.Fields.map((a) => a?.name);
      const uniqueFieldNames = [...new Set(FieldNames)];

      // Get all fields values from user
      const FieldValues = {
        ...JSON.parse(Credentials?.Value),
      };
      const Obj = {};

      // Create all empty fields
      uniqueFieldNames.map((val) => {
        Obj[val] = "";
      });

      // Set old fields values
      Field.map((val) => {
        if (currService?.get(`FieldValues.${val?.name}`)) {
          Obj[val?.name] = currService?.get(`FieldValues.${val?.name}`);
        }
      });

      // Set all fields values
      Field.map((val) => {
        if (FieldValues?.[val?.name]) {
          Obj[val?.name] = FieldValues?.[val?.name];
        }
      });

      // Update Service
      const updateService = {
        status: Credentials?.status,
        reason: Credentials?.reason,
        FieldValues: Obj,
        Admin: new mongoose.Types.ObjectId(id),
      };

      Service.updateOne({ _id: Credentials?.id }, updateService)
        .then(async (data) => {
          // Add Service to Admin
          const setArrProperty = await SetArrManyRelationhip(
            currAdmin?.Service,
            Credentials?.id,
            res
          );
          if (setArrProperty.Msg == "Error") {
            return;
          }
          const Service_Admin = setArrProperty.Arr;
          Admin.updateOne(
            { _id: id },
            {
              Service: Service_Admin,
            }
          )
            .then(async (data) => {
              res.status(200).json({
                status: 200,
                message: "Service Updated in Succesfully",
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({ status: 500, message: err });
            });
        })
        .catch((err) => {
          res.status(500).json({ status: 500, message: err });
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

router.get("/ServiceInfo/:id", async (req, res) => {
  try {
    connectToDB();
    const { id: userId, message: userMessage } = await getUserId(req);
    const { id, message } = await getAdminId(req);
    if (id || userId) {
      const Check = await CheckAllRequiredFieldsAvailaible(
        req?.params,
        ["id"],
        res
      );
      if (Check == "Error") {
        return;
      }

      Service.findOne({ _id: req.params.id })
        .populate([
          "ServiceOffered",
          "Review",
          "Bill",
          "Property",
          "Admin",
          "Payment",
        ])
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

router.get("/GetAllService", async (req, res) => {
  try {
    connectToDB();
    const { id: userId, message: userMessage } = await getUserId(req);
    const { id, message } = await getAdminId(req);
    if (id || userId) {
      Service.find()
        .populate([
          "ServiceOffered",
          "Review",
          "Bill",
          "Property",
          "Admin",
          "Payment",
        ])
        .then((data) => {
          res.status(200).json({ status: 200, data: data });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ status: 500, message: err });
        });
    } else {
      res.status(401).json({ status: 401, message: message || userMessage });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: error });
  }
});

module.exports = router;
