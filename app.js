const { httpServer, port } = require("./Middlewares/Server");
const Routes = require("./Middlewares/Routes");
const { io } = require("./Middlewares/Socket");

Routes;
io;
httpServer.listen(port, () => {
  console.log(`Server on http://localhost:${port}`);
});
