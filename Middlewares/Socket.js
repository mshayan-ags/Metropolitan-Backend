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

// io.on("connection", (socket) => {
//   AllChatsSocket(socket);
// });

module.exports = {
  io,
};
