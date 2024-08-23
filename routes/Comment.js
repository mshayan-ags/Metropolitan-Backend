const express = require("express");
const { Comment } = require("../models/Comment");
const { Admin } = require("../models/Admin");
const { Complain } = require("../models/Complain/Complain");
const { Service } = require("../models/Service");
const { CheckAllRequiredFieldsAvailaible } = require("../utils/functions");
const { connectToDB } = require("../Middlewares/Db");
const { getAdminId } = require("../utils/AuthCheck");
const { default: mongoose } = require("mongoose");
const { Chat } = require("../models/Complain/Chat");

const router = express.Router();

router.post("/CreateComment", async (req, res) => {
  try {
    connectToDB();
    const { id: adminId, message: adminMessage } = await getAdminId(req);

    if (adminId) {
      const Credentials = req.body;

      const Check = await CheckAllRequiredFieldsAvailaible(
        Credentials,
        ["text"],
        res
      );

      if (Check) {
        return;
      }

      // Create Comment
      const newComment = new Comment({
        admin: adminId,
        text: Credentials.text,
      });


      // Connect the Comment to either Complain or Service
      if (Credentials.complainId) {
        newComment.complain = new mongoose.Types.ObjectId(Credentials.complainId);
      } else if (Credentials.serviceId) {
        newComment.service = new mongoose.Types.ObjectId(Credentials.serviceId);
      }

      await newComment.save();

      if (Credentials.serviceId) {
        const Comment_Service = await Comment.find({
          service: Credentials?.serviceId,
        }).select("_id");

        await Service.updateOne(
          { _id: Credentials?.serviceId },
          {
            Comment: Comment_Service,
            Admin: new mongoose.Types.ObjectId(Credentials.assignedTo)
          }
        ).then((data) => {
          res.status(200).json({
            status: 200,
            message: "Comment Assigned Successfully",
          });
        }).catch((err) => {
          console.log(err);
          res.status(500).json({ status: 500, message: err });
        });
      }
      else if (Credentials.complainId) {
        const Comment_Complain = await Comment.find({
          complain: Credentials?.complainId,
        }).select("_id");

        await Complain.updateOne(
          { _id: Credentials?.complainId },
          {
            Comment: Comment_Complain,
            Admin: new mongoose.Types.ObjectId(Credentials.assignedTo)
          }
        ).then(async (data) => {
          await Chat.updateOne(
            { Complain: Credentials?.complainId },
            {
              Admin: new mongoose.Types.ObjectId(Credentials.assignedTo)
            }
          ).then((data) => {
            res.status(200).json({
              status: 200,
              message: "Comment Assigned Successfully",
            });
          }).catch((err) => {
            console.log(err);
            res.status(500).json({ status: 500, message: err });
          });
        }).catch((err) => {
          console.log(err);
          res.status(500).json({ status: 500, message: err });
        });

      }
    } else {
      res.status(401).json({ status: 401, message: adminMessage });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

router.get("/CommentInfoId/:id", async (req, res) => {
  try {
    connectToDB();
    const Comment = await Comment.findOne({ _id: req.params.id })
      .populate("admin complain service")
      .exec();

    if (!Comment) {
      res.status(404).json({
        status: 404,
        message: "Comment not found",
      });
      return;
    }

    res.status(200).json({
      status: 200,
      data: Comment,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

router.get("/CommentInfoComplain/:complainId", async (req, res) => {
  try {
    connectToDB();
    const Comments = await Comment.find({ complain: req?.params?.complainId })
      .populate("admin")
      .exec();

    if (!Comments) {
      res.status(404).json({
        status: 404,
        message: "Comment not found",
      });
      return;
    }

    res.status(200).json({
      status: 200,
      data: Comments,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});


router.get("/CommentInfoService/:serviceId", async (req, res) => {
  try {
    connectToDB();
    const Comments = await Comment.find({ service: req?.params?.serviceId })
      .populate("admin")
      .exec();

    if (!Comments) {
      res.status(404).json({
        status: 404,
        message: "Comment not found",
      });
      return;
    }

    res.status(200).json({
      status: 200,
      data: Comments,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ status: 500, message: error.message });
  }
});

router.get("/GetAllComments", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getAdminId(req);

    if (id) {
      const Comments = await Admin.findOne({ _id: id })
        .populate("Comment")
        .then((admin) => admin.Comments);

      res.status(200).json({
        status: 200,
        data: Comments,
      });
    } else {
      res.status(401).json({ status: 401, message: message });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

module.exports = router;
