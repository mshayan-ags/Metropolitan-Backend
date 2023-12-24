const { httpServer, port, app } = require("./Middlewares/Server");
const Routes = require("./Middlewares/Routes");
const { io, CreateAllRooms } = require("./Middlewares/Socket");
const cron = require('node-cron');

Routes;

cron.schedule('0 * * * *', () => {
  CreateAllRooms();
});

httpServer.listen(port, () => {
  console.log(`Server on http://localhost:${port}`);
});
