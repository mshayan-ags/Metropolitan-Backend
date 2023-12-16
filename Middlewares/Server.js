const Express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const { connect } = require("./Db");

const app = Express();

app.use(cors());
app.use(Express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 5000;

connect();

const httpServer = http.createServer(app);

module.exports = {
  httpServer,
  port,
  app,
};
