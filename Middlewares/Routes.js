const { app } = require("./Server");
const User = require("../routes/User");
const Admin = require("../routes/Admin");
const Property = require("../routes/Property");
const ServiceOffered = require("../routes/ServiceOffered");
const Service = require("../routes/Service");
const Bill = require("../routes/Bill");
const Payment = require("../routes/Payment");
const Review = require("../routes/Review");
const Utility = require("../routes/Utility");
const { GetImage } = require("../routes/Image");
const Car = require("../routes/Car");
const ComplainCategory = require("../routes/Complain/ComplainCategory");
const Complain = require("../routes/Complain/Complain");
const Chat = require("../routes/Complain/Chat");
const Message = require("../routes/Complain/Message");
const Task = require("../routes/Task");
const Dashboard = require("../routes/Dashboard");

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
//
app.use(Task);
app.use(Dashboard);
