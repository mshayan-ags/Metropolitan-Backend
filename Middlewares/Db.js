const { default: mongoose } = require("mongoose");
const { User } = require("../models/User");
const { Admin } = require("../models/Admin");
const { Property } = require("../models/Property");
const { ServiceOffered } = require("../models/ServiceOffered");
const { Service } = require("../models/Service");
const { Bill } = require("../models/Bill");
const { Payment } = require("../models/Payment");
const { Review } = require("../models/Review");
const { Utility } = require("../models/Utility");

const connectToDB = async () => {
  mongoose
    .connect(
      "mongodb+srv://user:RgBCB1vlcT0Cow6A@chatapp.4yxjjzq.mongodb.net/Metropolitan?retryWrites=true&w=majority"
    )
    .catch((err) => console.log(err));

  return await mongoose;
};

const connect = async () => {
  mongoose
    .connect(
      "mongodb+srv://user:RgBCB1vlcT0Cow6A@chatapp.4yxjjzq.mongodb.net/Metropolitan?retryWrites=true&w=majority"
    )
    .then(async () => {
      console.log("Connected to mongodb");
      await User.find();
      await Admin.find();
      await Property.find();
      await ServiceOffered.find();
      await Service.find();
      await Bill.find();
      await Payment.find();
      await Review.find();
      await Utility.find();
    })
    .catch((err) => console.log(err));

  return await mongoose;
};

module.exports = { connectToDB, connect };
