const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const { Admin } = require("../models/Admin");

const APP_SECRET = "Metropolitan";

function getTokenPayload(token) {
  return jwt.verify(token, APP_SECRET);
}

async function getUserId(req) {
  if (req) {
    const authHeader = req?.headers?.authorization;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      if (!token) {
        return { message: "No token found" };
      }
      const { id } = getTokenPayload(token);

      const isUser = await User.findOne({ _id: id });

      if (isUser?._id) return { id };
      else return { message: "Not authenticated" };
    }
  } else {
    return { message: "Not authenticated" };
  }
}

async function getAdminId(req) {
  if (req) {
    const authHeader = req?.headers?.authorization;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      if (!token) {
        return { message: "No token found" };
      } else {
        const { id, Role } = getTokenPayload(token);

        const isAdmin = await Admin.findOne({ _id: id });

        if (isAdmin?._id && isAdmin?.Role == Role) return { id, Role };
        else return { message: "Not authenticated" };
      }
    }
  } else {
    return { message: "Not authenticated" };
  }
}

module.exports = {
  APP_SECRET,
  getUserId,
  getAdminId,
};
