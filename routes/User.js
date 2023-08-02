const UserModel = require("./Model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET, getUserId } = require("../utils");
const { Router } = require("express");

const router = Router();

router.post("/SignUp", async (req, res) => {
  try {
    const Credentials = req.body;
    if (!Credentials?.password && !Credentials?.name && !Credentials?.email && !Credentials?.phoneNumber) {
      res.status(400).json({ "status": 400, message: "Please Fill All The Fields" });
    }

    const password = await bcrypt.hash(Credentials?.password, 15);
    const User = new UserModel({
      name: Credentials?.name,
      email: Credentials?.email,
      phoneNumber: Credentials?.phoneNumber,
      password: password,
    });

    await User.save();

    const token = jwt.sign({ id: User?._id }, APP_SECRET);

    res.status(200).json({ token, "status": 200, message: "User Created in Succesfully" });
  } catch (error) {
    res.status(500).json({ "status": 500, message: error });
  }
});

router.post("/Login", async (req, res) => {
  try {
    const Credentials = req.body;
    if (!Credentials?.password && !Credentials?.email) {
      res.status(400).json({ "status": 400, message: "Please Fill All The Fields" });
    }
    UserModel.findOne({ email: req.body?.email }).then((docs) => {
      if (docs?.password) {
        const valid = bcrypt.compare(req.body?.password, docs?.password);
        if (!valid) {
          res.status(500).json({ "status": 500, message: "Your Password is incorrect" });
        }
        else if (valid && docs?.email && docs) {
          const token = jwt.sign({ id: docs?._id }, APP_SECRET);
          res.status(200).json({ token, "status": 200, message: "User Logged in Succesfully" });
        }
      }
      else {
        res.status(500).json({ "status": 500, message: "User Not Found" });
      }
    }).catch((error) => {
      res.status(500).json({ "status": 500, message: error });
    });
  }
  catch (error) {

    res.status(500).json({ "status": 500, message: error });
  }
});

router.get("/userInfo", async (req, res) => {
  try {
    const { id, message } = getUserId(req);
    if (id) {
      UserModel.findOne({ _id: id }).then((User) => {
        console.log(User)
        res.status(200).json({ "status": 200, data: User });
      }).catch((err) => {
        res.status(500).json({ "status": 500, message: err });
      });
    } else {
      res.status(401).json({ "status": 401, message: message });
    }
  } catch (error) {
    res.status(500).json({ "status": 500, message: error });
  }
});


module.exports = router;