const { Server } = require("socket.io");
const { httpServer } = require("./Server");

const io = new Server(httpServer, {});

module.exports = {
  io,
};
