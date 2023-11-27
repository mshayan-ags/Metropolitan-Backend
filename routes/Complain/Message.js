const { Message } = require("../../models/Complain/Message");
const { getAdminId, getUserId } = require("../../utils/AuthCheck");
const { Router } = require("express");
const { CheckAllRequiredFieldsAvailaible } = require("../../utils/functions");
const { connectToDB } = require("../../Middlewares/Db");
const { default: mongoose } = require("mongoose");
const { SaveImageDB } = require("../Image");
const { Chat } = require("../../models/Complain/Chat");

const router = Router();

router.post("/Create-Message", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getAdminId(req);
    const { id: userId, message: userMessage } = await getUserId(req);
    if (id || userId) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["text", "Chat"],
        res
      );
      if (Check) {
        return;
      }

      const searchChat = await Chat.findOne({
        _id: Credentials?.Chat,
      });
      if (searchChat?._id) {
        const Obj = {
          text: Credentials?.text,
          Chat: new mongoose.Types.ObjectId(Credentials?.Chat),
          User: userId ? new mongoose.Types.ObjectId(userId) : null,
          Admin: id ? new mongoose.Types.ObjectId(id) : null,
        };
        const newMessage = new Message(Obj);

        if (Credentials?.VoiceNote) {
          const image = await SaveImageDB(
            Credentials?.VoiceNote,
            {
              Message: new mongoose.Types.ObjectId(newMessage?._id),
            },
            res
          );

          if (image?.file?._id) {
            newMessage.VoiceNote = new mongoose.Types.ObjectId(
              image?.file?._id
            );
          } else {
            res.status(500).json({ status: 500, message: image?.Error });
          }
        }

        if (Credentials?.Media) {
          const image = await SaveImageDB(
            Credentials?.Media,
            {
              Message: new mongoose.Types.ObjectId(newMessage?._id),
            },
            res
          );

          if (image?.file?._id) {
            newMessage.Media = new mongoose.Types.ObjectId(image?.file?._id);
          } else {
            res.status(500).json({ status: 500, message: image?.Error });
          }
        }

        await newMessage.save();

        const AllMessages = await Message.find({
          Chat: Credentials?.Chat,
        }).select("_id");

        Chat.updateOne(
          { _id: Credentials?.Chat },
          {
            Message: AllMessages,
          }
        )
          .then((data) => {
            res.status(200).json({
              status: 200,
              id: newMessage?._id,
              message: "Message Created in Succesfully",
            });
          })
          .catch((err) => {
            res.status(500).json({ status: 500, message: err });
          });
      } else {
        res
          .status(500)
          .json({ status: 500, message: "Please Check Your Data!" });
      }
    } else {
      res.status(401).json({ status: 401, message: message || userMessage });
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

router.get("/GetAllMessage/:id", async (req, res) => {
  try {
    Message.find({ Chat: req?.params?.id })
      .populate(["Admin", "User", "Media", "VoiceNote", "Chat"])
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

module.exports = router;
