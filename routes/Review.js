const { Review } = require("../models/Review");
const { getAdminId, getUserId } = require("../utils/AuthCheck");
const { Router } = require("express");
const { User } = require("../models/User");
const { default: mongoose } = require("mongoose");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { connectToDB } = require("../Middlewares/Db");
const { Service } = require("../models/Service");
const { Property } = require("../models/Property");

const router = Router();

router.post("/Create-Review", async (req, res) => {
  try {
    connectToDB();

    const { id, message } = await getUserId(req);
    if (id) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["description", "Rating", "Service", "User", "Property"],
        res
      );
      if (Check) {
        return;
      }

      const searchService = await Service.findOne({
        _id: Credentials?.Service,
      });
      const searchUser = await User.findOne({ _id: id });
      const searchProperty = await Property.findOne({
        _id: Credentials?.Property,
      });
      if (
        (!searchService?.Review || searchService?.Review == "") &&
        searchService?._id &&
        searchUser?._id &&
        searchProperty?._id
      ) {
        const newReview = new Review({
          description: Credentials?.description,
          Rating: Credentials?.Rating,
          Service: new mongoose.Types.ObjectId(Credentials?.Service),
          User: new mongoose.Types.ObjectId(Credentials?.User),
          Property: new mongoose.Types.ObjectId(Credentials?.Property),
        });

        const saveReview = await newReview.save();
        if (saveReview?._id) {
          // Add Review to Service
          Service.updateOne(
            { _id: Credentials?.Service },
            { Review: new mongoose.Types.ObjectId(saveReview?._id) },
            { new: false }
          )
            .then(async (data) => {
              // Add Review to Property
              const Review_Property = await Review.find({
                Property: Credentials?.Property,
              }).select("_id");
              Property.updateOne(
                { _id: Credentials?.Property },
                { Review: Review_Property },
                { new: false }
              )
                .then(async (data) => {
                  // Add Review to User
                  const Review_User = await Review.find({
                    User: id,
                  }).select("_id");

                  User.updateOne(
                    { _id: id },
                    { Review: Review_User },
                    { new: false }
                  )
                    .then(async (data) => {
                      res.status(200).json({
                        status: 200,
                        message: "Review Created in Succesfully",
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
              res.status(500).json({ status: 500, message: err });
            });
        } else {
          res.status(401).json({
            status: 401,
            message: "There was Some error saving review",
          });
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

router.get("/ReviewInfo/:id", async (req, res) => {
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

      Review.findOne({ _id: req.params.id })
        .populate("User", "Service", "Property")
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

router.get("/GetAllReview", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getAdminId(req);
    const { id: userId, message: userMessage } = await getUserId(req);

    if (id || userId) {
      Review.find()
        .populate("User", "Service", "Property")
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
