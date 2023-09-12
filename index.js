const Express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const User = require("./routes/User");
const Admin = require("./routes/Admin");
const Property = require("./routes/Property");
const ServiceOffered = require("./routes/ServiceOffered");
const Service = require("./routes/Service");
const { connectToDB } = require("./Middlewares/Db");
const Bill = require("./routes/Bill");
const Payment = require("./routes/Payment");

const app = Express();

app.use(Express.json({ limit: "50mb" }));
app.use(Express.urlencoded({ limit: "50mb" }));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const httpServer = http.createServer(app);

const port = process.env.PORT || 5000;

connectToDB();

app.use(User);
app.use(Admin);
app.use(Property);
app.use(ServiceOffered);
app.use(Service);
app.use(Bill);
app.use(Payment);

httpServer.listen(port, () => {
  console.log(`Server on http://localhost:${port}`);
});
