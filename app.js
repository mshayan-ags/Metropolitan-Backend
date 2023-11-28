const { httpServer, port } = require("./Middlewares/Server");
const { io } = require("./Middlewares/Socket");

io.on("connection", (socket) => {
  console.log("connection");
});

httpServer.listen(port, () => {
  console.log(`Server on http://localhost:${port}`);
});
