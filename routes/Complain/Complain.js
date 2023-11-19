const { Complain } = require("../../models/Complain/Complain");
const { getUserId, getAdminId } = require("../../utils/AuthCheck");
const { Router } = require("express");
const { User } = require("../../models/User");
const { default: mongoose } = require("mongoose");
const ComplainCategory = require("../../models/Complain/ComplainCategory");
const { Property } = require("../../models/Property");
const { Admin } = require("../../models/Admin");
const { CheckAllRequiredFieldsAvailaible } = require("../../utils/functions");
const { connectToDB } = require("../../Middlewares/Db");
const { Chat } = require("../../models/Complain/Chat");
const { SaveImageDB } = require("../Image");

const router = Router();

router.post("/Request-Complain", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getUserId(req);
    const { id: adminID, message: adminMesage } = await getAdminId(req);
    if (id || adminID) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["status", "title", "description", "Property", "ComplainCategory"],
        res
      );
      if (Check) {
        return;
      }

      const searchComplainCategory = await ComplainCategory.findOne({
        _id: Credentials?.ComplainCategory,
      });

      const searchProperty = await Property.findOne({
        _id: Credentials?.Property,
      });

      const searchUser = await User.findOne({
        _id: adminID ? Credentials?.User : id,
      });

      if (
        searchComplainCategory?._id &&
        searchProperty?._id &&
        searchUser?._id
      ) {
        // Create Complain
        const newComplain = new Complain({
          status: Credentials?.status,
          description: Credentials?.description,
          title: Credentials?.title,
          Property: new mongoose.Types.ObjectId(searchProperty?._id),
          ComplainCategory: new mongoose.Types.ObjectId(
            searchComplainCategory?._id
          ),
          User: new mongoose.Types.ObjectId(searchUser?._id),
          Admin: adminID ? new mongoose.Types.ObjectId(adminID) : "",
        });

        if (Credentials?.VoiceNote) {
          const image = await SaveImageDB(
            Credentials?.VoiceNote,
            {
              Complain: new mongoose.Types.ObjectId(newComplain?._id),
            },
            res
          );

          if (image?.file?._id) {
            newComplain.VoiceNote = new mongoose.Types.ObjectId(
              image?.file?._id
            );
          } else {
            console.log(image?.Error, 1);
            res.status(500).json({ status: 500, message: image?.Error });
          }
        }

        // Create Complain
        const newChat = new Chat({
          status: "active",
          Property: new mongoose.Types.ObjectId(searchProperty?._id),
          Complain: new mongoose.Types.ObjectId(newComplain?._id),
          User: new mongoose.Types.ObjectId(searchUser?._id),
          Admin: adminID ? new mongoose.Types.ObjectId(adminID) : "",
        });

        newComplain.Chat = new mongoose.Types.ObjectId(newChat?._id);

        await newComplain.save();
        await newChat.save();

        // Add Complain to ComplainCategory
        const Complain_ComplainCategory = await Complain.find({
          ComplainCategory: searchComplainCategory?._id,
        }).select("_id");

        const Complain_Property = await Complain.find({
          Property: searchProperty?._id,
        }).select("_id");

        const Complain_User = await Complain.find({
          User: id,
        }).select("_id");

        const Complain_Admin = await Complain.find({
          Admin: adminID ? adminID : "",
        }).select("_id");
        // Add Chat to Complain
        const Chat_Property = await Chat.find({
          Property: searchProperty?._id,
        }).select("_id");

        const Chat_User = await Chat.find({
          User: id,
        }).select("_id");

        const Chat_Admin = await Chat.find({
          Admin: id,
        }).select("_id");

        // ComplainCategory
        ComplainCategory.updateOne(
          { _id: Credentials.ComplainCategory },
          {
            Complain: Complain_ComplainCategory,
          }
        )
          .then(async (data) => {
            //  User
            User.updateOne(
              { _id: id },
              {
                Complain: Complain_User,
                Chat: Chat_User,
              }
            )
              .then((data) => {
                // Property
                Property.updateOne(
                  { _id: searchProperty?._id },
                  {
                    Complain: Complain_Property,
                    Chat: Chat_Property,
                  }
                )
                  .then(async (data) => {
                    if (adminID) {
                      await Admin.updateOne(
                        { _id: adminID },
                        {
                          Complain: Complain_Admin,
                          Chat: Chat_Admin,
                        }
                      )
                        .then(() => {
                          res.status(200).json({
                            status: 200,
                            message: "Complain Created in Succesfully",
                          });
                        })
                        .catch((err) => {
                          console.log(err, 2);
                          res.status(500).json({ status: 500, message: err });
                        });
                    }
                  })
                  .catch((err) => {
                    console.log(err, 3);
                    res.status(500).json({ status: 500, message: err });
                  });
              })
              .catch((err) => {
                console.log(err, 4);
                res.status(500).json({ status: 500, message: err });
              });
          })
          .catch((err) => {
            console.log(err, 5);
            res.status(500).json({ status: 500, message: err });
          });
      } else {
        res
          .status(401)
          .json({ status: 401, message: "Please Check Your Data" });
      }
    } else {
      res.status(401).json({ status: 401, message: message || adminMesage });
    }
  } catch (error) {
    console.log(error, 5);

    if (error?.code == 11000) {
      res.status(500).json({
        status: 500,
        message: `Please Change your ${
          Object.keys(error?.keyValue)[0]
        } as it's not unique`,
      });
    } else {
      console.log(error, 5);
      res.status(500).json({ status: 500, message: error });
    }
  }
});

router.post("/Update-Complain", async (req, res) => {
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

      const currComplain = await Complain.findOne({ _id: Credentials.id });

      // Update Complain
      const updateComplain = {
        status: Credentials?.status
          ? Credentials?.status
          : currComplain?.status,
        title: Credentials?.title ? Credentials?.title : currComplain?.title,
        description: Credentials?.description
          ? Credentials?.description
          : currComplain?.description,
      };

      if (Credentials?.VoiceNote) {
        const image = await SaveImageDB(
          Credentials?.VoiceNote,
          {
            Complain: new mongoose.Types.ObjectId(Credentials.id),
          },
          res
        );

        if (image?.file?._id) {
          updateComplain.VoiceNote = new mongoose.Types.ObjectId(
            image?.file?._id
          );
        } else {
          res.status(500).json({ status: 500, message: image?.Error });
        }
      }

      Complain.updateOne({ _id: Credentials?.id }, updateComplain)
        .then(async (data) => {
          res.status(200).json({
            status: 200,
            message: "Complain Updated in Succesfully",
          });
        })
        .catch((err) => {
          res.status(500).json({ status: 500, message: err });
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

router.get("/ComplainInfo/:id", async (req, res) => {
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
      if (Check) {
        return;
      }

      Complain.findOne({ _id: req.params.id })
        .populate([
          "ComplainCategory",
          "Review",
          "VoiceNote",
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

router.get("/GetAllComplain", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getAdminId(req);
    if (id) {
      Complain.find()
        .populate([
          "ComplainCategory",
          "VoiceNote",
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
      res.status(401).json({ status: 401, message: message });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ status: 500, message: error });
  }
});

router.get("/GetAllComplainUser", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getUserId(req);
    if (id) {
      Complain.find({ User: id })
        .populate([
          "ComplainCategory",
          "Review",
          "Bill",
          "Property",
          "Admin",
          "Payment",
          "VoiceNote",
        ])
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

module.exports = router;
