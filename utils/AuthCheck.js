const jwt = require("jsonwebtoken");

const APP_SECRET = "OmalSons";

function getTokenPayload(token) {
  return jwt.verify(token, APP_SECRET);
}

async function getUserId(req) {
  if (req) {
    // const authHeader = req?.headers?.authorization;
    // if (authHeader) {
    //   const token = authHeader.replace("Bearer ", "");
    //   if (!token) {
    //     return { message: "No token found" };
    //   }
    //   const { id } = getTokenPayload(token);

    //   const isUser = await User.findOne({ _id: id });

    //   if (isUser?._id) return { id };
    //   else return { message: "Not authenticated" };
    // }
    return { id: "Test Id For Now" };
  } else {
    return { message: "Not authenticated" };
  }
}

module.exports = {
  APP_SECRET,
  getUserId,
};
