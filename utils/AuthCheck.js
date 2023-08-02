const jwt = require("jsonwebtoken");

const APP_SECRET = "HIK CAMERAS APP";

function getTokenPayload(token) {
    return jwt.verify(token, APP_SECRET);
}

function getUserId(req) {
    if (req) {
        const authHeader = req?.headers?.authorization;
        if (authHeader) {
            const token = authHeader.replace("Bearer ", "");
            if (!token) {
                return { message: "No token found" };
            }
            const { id } = getTokenPayload(token);
            return { id };
        }
    }
    else {
        return { message: "Not authenticated" };
    }
}


module.exports = {
    APP_SECRET,
    getUserId,
};
