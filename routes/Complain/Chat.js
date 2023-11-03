const { Chat } = require("../../models/Chat/Chat");
const { getUserId, getAdminId } = require("../../utils/AuthCheck");
const { Router } = require("express");
const { CheckAllRequiredFieldsAvailaible } = require("../../utils/functions");
const { connectToDB } = require("../../Middlewares/Db");
const { Chat } = require("../../models/Chat/Chat");

const router = Router();

router.get("/ChatInfo/:id", async (req, res) => {
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

      Chat.findOne({ _id: req.params.id })
        .populate(["Admin", "User", "Message", "Media", "Property", "Complain"])
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

router.get("/GetAllChat", async (req, res) => {
  try {
    connectToDB();
    const { id: userId, message: userMessage } = await getUserId(req);
    const { id, message } = await getAdminId(req);
    if (id || userId) {
      Chat.find()
        .populate(["Admin", "User", "Message", "Media", "Property", "Complain"])
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

router.get("/GetAllChatUser", async (req, res) => {
  try {
    connectToDB();
    const { id, message } = await getUserId(req);
    if (id) {
      Chat.find({ User: id })
        .populate(["Admin", "User", "Message", "Media", "Property", "Complain"])
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
