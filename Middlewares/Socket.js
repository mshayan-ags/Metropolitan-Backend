const socketIO = require("socket.io");
const { httpServer } = require("./Server");

const io = socketIO(httpServer, {
  cors: {
    origin: "*", // Replace with your frontend URL
  },
});

io.on("connection", (socket) => {
  function isUserInRoom(room, userId) {
    const roomSockets = io.sockets.adapter.rooms[room];
    if (roomSockets != undefined) {
      return roomSockets && roomSockets?.has(userId);
    } else {
      return false;
    }
  }

  socket.on("room", ({ room }) => {
    try {
      const roomExists = io.sockets.adapter.rooms[room] !== undefined;

      if (!roomExists) {
        socket.join(room);
      }

      const userAlreadyInRoom = isUserInRoom(room, socket.id);
      if (!userAlreadyInRoom) {
        socket.join(room);
      }

    } catch (error) {
      console.log(error)
    }
  });

  socket.on("leaveRoom", ({ room, user }) => {
    if (isUserInRoom(room, socket.id)) {
      socket.leave(room);
      io.to(room).emit("userDisconnected", { room, user });
    }
  });

  socket.on("message", ({ room, message, user }) => {
    io.to(room).emit("newmessage", { room, message, user });
  });

  socket.on("disconnect", () => {
    const rooms = Object.keys(socket.rooms);
    rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
        io.to(room).emit("userDisconnected", { room, user: socket.id });
      }
    });
  });
});

module.exports = {
  io,
};
