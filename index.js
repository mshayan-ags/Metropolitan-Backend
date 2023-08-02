const Express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const User = require("./routes/User");

const app = Express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose
  .connect(
    "mongodb+srv://user:RgBCB1vlcT0Cow6A@chatapp.4yxjjzq.mongodb.net/Metropolitan?retryWrites=true&w=majority"
  )
  .then(() => console.log("Connected to mongodb"))
  .catch((err) => console.log(err));

const httpServer = http.createServer(app);

const port = process.env.PORT || 5000;

app.use(User);

httpServer.listen(port, () => {
  console.log(`Server on http://localhost:${port}`);
});
