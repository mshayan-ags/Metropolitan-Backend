const { httpServer, port, app } = require("./Middlewares/Server");
const Routes = require("./Middlewares/Routes");
const { io } = require("./Middlewares/Socket");
const cors = require("cors");

Routes;
io;
app.use(cors());

httpServer.listen(port, () => {
  console.log(`Server on http://localhost:${port}`);
});
