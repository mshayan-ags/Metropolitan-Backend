const Express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const { connectToDB } = require("./Middlewares/Db");
const Importer = require("./routes/Importer");
const DataEntry = require("./routes/DataEntry");
const DailyReport = require("./routes/DailyReport");

const app = Express();

app.use(Express.json({limit: '50mb'}));
app.use(Express.urlencoded({limit: '50mb'}));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const httpServer = http.createServer(app);

const port = process.env.PORT || 5000;

connectToDB();

app.use(Importer);
app.use(DataEntry);
app.use(DailyReport);

httpServer.listen(port, () => {
  console.log(`Server on http://localhost:${port}`);
});
