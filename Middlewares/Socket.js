const socketIO = require("socket.io");
const { httpServer } = require("./Server");
const { Chat } = require("../models/Complain/Chat");
const { connectToDB } = require("./Db");

const io = socketIO(httpServer, {
  cors: {
    origin: "*",
  },
  debug: true,
  pingInterval: 5000,
  pingTimeout: 10000,
});

async function CreateAllRooms() {
  try {
    connectToDB();
    io.emit("allroomsclosed");

    (await Chat.find()).filter((a) => a?.status == "active").forEach((room) => {
      const id = room?._id
      const existingRoom = io.sockets.adapter.rooms[id];

      if (existingRoom) {
        delete io.sockets.adapter.rooms[id];

      }

      io.sockets.adapter.rooms[id] = new Set();
    })
  } catch (error) {
    console.log(error)
  }
}

io.on("connection", (socket) => {
  function isUserInRoom(room, userId) {
    return socket.rooms.has(room);
  }

  socket.on("room", ({ room }) => {
    try {
      const userAlreadyInRoom = isUserInRoom(room, socket.id);
      if (!userAlreadyInRoom) {
        socket.join(room);
      }

    } catch (error) {
      console.log(error)
    }
  });

  socket.on("leaveRoom", ({ room }) => {
    if (isUserInRoom(room, socket.id)) {
      socket.leave(room);
    }
  });

  socket.on("message", ({ room, message, user }) => {
    io.to(room).emit("newmessage", { room, message, user });
  });

});

module.exports = {
  io,
  CreateAllRooms
};
