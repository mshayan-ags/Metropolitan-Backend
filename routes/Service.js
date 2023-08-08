const { Service } = require("../models/Service");
const { getUserId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { User } = require("../models/User");
const { default: mongoose } = require("mongoose");
const { SetArrManyRelationhip } = require("../utils/SetArrManyRelationhip");
const { ServiceOffered } = require("../models/ServiceOffered");
const { Property } = require("../models/Property");

const router = Router();

router.post("/Request-Service", async (req, res) => {
  try {
    const { id, message } = getUserId(req);
    if (id) {
      const Credentials = req.body;

      ServiceOffered.findOne({ _id: req.body.ServiceOffered })
        .then(async (data) => {
          // Get all fields
          const Field = data?.Fields;

          // Get all unique fields names
          const FieldNames = data?.Fields.map((a) => a?.name);
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
            data?.Service,
            saveService?._id,
            res,
            "ServiceOffered already has this Service"
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
            .then((data) => {
              // Add Service to Property
              Property.findOne({ _id: Credentials?.Property })
                .then(async (dataProperty) => {
                  const setArrProperty = await SetArrManyRelationhip(
                    dataProperty?.Service,
                    saveService?._id,
                    res,
                    "Property already has this Service"
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
        })
        .catch((err) => {
          console.log(err);
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

router.post("/Update-Service", async (req, res) => {
  try {
    const { id, message } = getUserId(req);
    if (id) {
      const Credentials = req.body;

      Service.findOne({ _id: req.body.id })
        .then(async (data) => {
          await Service.updateOne({ _id: data?._id }, Credentials, {
            new: false,
          })
            .then((docs) => {
              res.status(401).json({
                status: 200,
                message: "Your Service has been Updated",
              });
            })
            .catch((error) => {
              res.status(500).json({ status: 500, message: error });
            });
        })
        .catch((error) => {
          res.status(500).json({ status: 500, message: error });
        });
    } else {
      res.status(401).json({ status: 401, message: message });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error });
  }
});

router.get("/ServiceInfo/:id", async (req, res) => {
  try {
    const { id, message } = getUserId(req);
    if (id) {
      Service.findOne({ _id: req.params.id })
        .populate("User")
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

router.get("/GetAllService", async (req, res) => {
  try {
    const { id, message } = getUserId(req);
    if (id) {
      Service.find()
        .populate("User")
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

router.post("/Service-User", async (req, res) => {
  try {
    const { id, message } = getUserId(req);
    if (id) {
      const searchService = await Service.findOne({ _id: req.body.Service })
        .then((data) => {
          return data;
        })
        .catch((err) => {
          res.status(500).json({ status: 500, message: err });
        });

      const searchUser = await User.findOne({ _id: req.body.user })
        .then((data) => {
          return data;
        })
        .catch((err) => {
          res.status(500).json({ status: 500, message: err });
        });

      if (searchService?._id && searchUser?._id) {
        User.updateOne(
          { _id: req.body.user },
          {
            Service: new mongoose.Types.ObjectId(req.body.Service),
            verifiedByAdmin: true,
          }
        )
          .then(async (data) => {
            const setArr = await SetArrManyRelationhip(
              searchService?.User,
              req.body?.user,
              res,
              "User already has this Service"
            );
            if (setArr.Msg == "Error") {
              return;
            }
            const Users = setArr.Arr;
            Service.updateOne(
              { _id: req.body.Service },
              {
                User: Users,
              }
            )
              .then((data) => {
                res
                  .status(200)
                  .json({ status: 200, data: "Service was added to user" });
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
          .status(500)
          .json({ status: 500, message: "Propery or User not Found" });
      }
    } else {
      res.status(401).json({ status: 401, message: message });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ status: 500, message: error });
  }
});

module.exports = router;
