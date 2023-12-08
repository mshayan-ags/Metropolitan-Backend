const { Server } = require("socket.io");
const { httpServer } = require("./Server");
const { Chat } = require("../models/Complain/Chat");

const io = new Server(httpServer, {});

async function AllChatsSocket(socket) {
  const AllChat = await Chat.find().select("_id");

  // return AllChat.map((a) => {
  //   return socket.on(a?._id?.toString(), (msg) => {
  //     // io.emit(a?._id?.toString(), msg);
  //   });
  // });
}

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join room", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("chat message", ({ room, message }) => {
    io.to(room).emit("chat message", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

module.exports = {
  io,
};
