const { Event } = require("../models/Event");
const { getAdminId, getUserId } = require("../utils/AuthCheck");
const { Router } = require("express");
const {
  filterArrayOfObjectAndRemoveRepetitions,
  CheckAllRequiredFieldsAvailaible,
} = require("../utils/functions");
const { connectToDB } = require("../Middlewares/Db");
const { default: mongoose } = require("mongoose");
const { SaveImageDB } = require("./Image");
const { User } = require("../models/User");
const { SetArrManyRelationhip } = require("../utils/SetArrManyRelationhip");

const router = Router();

router.post("/Create-Event", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getAdminId(req);
    if (id) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["title", "venue", "description", "Time", "TotalSeats", "CoverPhoto"],
        res
      );
      if (Check == "Error") {
        return;
      }

      const newEvent = new Event({
        title: Credentials?.title,
        venue: Credentials?.venue,
        description: Credentials?.description,
        Time: Credentials?.Time,
        TotalSeats: Credentials?.TotalSeats,
        Admin: new mongoose.Types.ObjectId(id),
      });

      const image = await SaveImageDB(
        Credentials?.CoverPhoto,
        { Event: new mongoose.Types.ObjectId(newEvent?._id) },
        res
      );

      if (image?.file?._id) {
        newEvent.CoverPhoto = new mongoose.Types.ObjectId(image?.file?._id);
      } else {
        res.status(500).json({ status: 500, message: image?.Error });
      }

      await newEvent.save();

      res.status(200).json({
        status: 200,
        message: "Event Created in Succesfully",
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

router.post("/Update-Event", async (req, res) => {
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
      if (Check == "Error") {
        return;
      }

      const searchEvent = await Event.findOne({
        _id: Credentials.id,
      });

      if (searchEvent?._id) {
        if (Credentials?.TotalSeats > searchEvent?.noSeatsReserved) {
          res.status(400).json({
            status: 400,
            message:
              "You can not Decrease seats Availiable as all seats are Booked",
          });
        }
        if (JSON.parse(Credentials?.CoverPhoto)?.name) {
          const image = await SaveImageDB(
            Credentials?.CoverPhoto,
            {
              Event: new mongoose.Types.ObjectId(searchEvent?._id),
            },
            res
          );
          if (image?.file?._id) {
            Credentials.CoverPhoto = new mongoose.Types.ObjectId(
              image?.file?._id
            );
          } else {
            res.status(500).json({ status: 500, message: image?.Error });
          }
        }

        await Event.updateOne(
          { _id: searchEvent?._id },
          {
            title: Credentials?.title ? Credentials?.title : searchEvent?.title,
            venue: Credentials?.venue ? Credentials?.venue : searchEvent?.venue,
            description: Credentials?.description
              ? Credentials?.description
              : searchEvent?.description,
            Time: Credentials?.Time ? Credentials?.Time : searchEvent?.Time,
            TotalSeats: Credentials?.TotalSeats
              ? Credentials?.TotalSeats
              : searchEvent?.TotalSeats,
            Admin: new mongoose.Types.ObjectId(id),
            CoverPhoto: Credentials?.CoverPhoto
              ? Credentials?.CoverPhoto
              : searchEvent?.CoverPhoto,
          },
          {
            new: false,
          }
        )
          .then((docs) => {
            res.status(200).json({
              status: 200,
              message: "Your Event has been Updated",
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

router.get("/EventInfo/:id", async (req, res) => {
  try {
    connectToDB();
    const Check = await CheckAllRequiredFieldsAvailaible(
      req?.params,
      ["id"],
      res
    );
    if (Check == "Error") {
      return;
    }
    Event.findOne({ _id: req.params.id })
      .populate("CoverPhoto")
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

router.get("/GetAllEvent", async (req, res) => {
  try {
    connectToDB();
    Event.find()
      .populate("CoverPhoto")
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

router.post("/Reserve-Event-Seats", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getUserId(req);
    if (id) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["id", "noSeatsReserved"],
        res
      );
      if (Check == "Error") {
        return;
      }

      const searchEvent = await Event.findOne({
        _id: Credentials.id,
      });

      const searchUser = await User.findOne({
        _id: id,
      });

      if (searchEvent?._id && searchUser?._id) {
        if (
          Credentials?.noSeatsReserved >
          searchEvent?.TotalSeats - searchEvent?.noSeatsReserved
        ) {
          res.status(400).json({
            status: 400,
            message: `You can not Reserve ${
              Credentials?.noSeatsReserved
            } seat as all seats are Booked only ${
              searchEvent?.TotalSeats - searchEvent?.noSeatsReserved
            } are Left`,
          });
        }

        // Add User to Event
        const setArrEvent = await SetArrManyRelationhip(
          searchEvent?.User,
          id,
          res
        );
        if (setArrEvent.Msg == "Error") {
          return;
        }
        const User_Event = setArrEvent.Arr;

        await Event.updateOne(
          { _id: searchEvent?._id },
          {
            User: User_Event,
            noSeatsReserved: parseInt(
              parseInt(searchEvent?.noSeatsReserved) +
                parseInt(Credentials?.noSeatsReserved)
            ),
          },
          {
            new: false,
          }
        )
          .then(async (docs) => {
            // Add Event to User
            const setArrUser = await SetArrManyRelationhip(
              searchUser?.Event,
              id,
              res
            );
            if (setArrUser.Msg == "Error") {
              return;
            }
            const Event_User = setArrUser.Arr;

            await User.updateOne(
              { _id: searchUser?._id },
              { Event: Event_User },
              {
                new: false,
              }
            )
              .then((docs) => {
                res.status(200).json({
                  status: 200,
                  message: "Your Event seats are Reserved",
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
        res.status(500).json({ status: 500, message: error });
      }
    } else {
      res.status(401).json({ status: 401, message: message });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error });
  }
});

module.exports = router;
