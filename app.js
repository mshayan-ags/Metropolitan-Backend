const Express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const User = require("./routes/User");
const Admin = require("./routes/Admin");
const Property = require("./routes/Property");
const ServiceOffered = require("./routes/ServiceOffered");
const Service = require("./routes/Service");
const { connect } = require("./Middlewares/Db");
const Bill = require("./routes/Bill");
const Payment = require("./routes/Payment");
const Review = require("./routes/Review");
const Utility = require("./routes/Utility");
const { GetImage } = require("./routes/Image");
const Car = require("./routes/Car");
const ComplainCategory = require("./routes/Complain/ComplainCategory");
const Complain = require("./routes/Complain/Complain");
const Chat = require("./routes/Complain/Chat");
const Message = require("./routes/Complain/Message");

const app = Express();

app.use(Express.json({ limit: "50mb" }));
// app.use(Express.urlencoded({ limit: "50mb" }));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const httpServer = http.createServer(app);

const port = process.env.PORT || 5000;

connect();

app.use(Car);
app.use(User);
app.use(Admin);
app.use(Property);
app.use(ServiceOffered);
app.use(Service);
app.use(Bill);
app.use(Payment);
app.use(Review);
app.use(Utility);
app.use(GetImage);
//
app.use(ComplainCategory);
app.use(Complain);
app.use(Chat);
app.use(Message);

httpServer.listen(port, () => {
  console.log(`Server on http://localhost:${port}`);
});
