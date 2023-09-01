const { default: mongoose } = require("mongoose");

const connectToDB = async () => {
  mongoose
    .connect(
      "mongodb+srv://user:RgBCB1vlcT0Cow6A@chatapp.4yxjjzq.mongodb.net/OmalSon?retryWrites=true&w=majority"
    )
    .then(() => console.log("Connected to mongodb"))
    .catch((err) => console.log(err));

  return await mongoose;
};

module.exports = { connectToDB };
