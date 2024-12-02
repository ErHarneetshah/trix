import jwt from "jsonwebtoken";
import User from "../../database/models/userModel.js";
import accessToken from "../../database/models/accessTokenModel.js";
import variables from "../config/variableConfig.js";
import appConfig from "../config/appConfig.js";

const jwtConfig = new appConfig().getJwtConfig();

const authMiddleware = async (req, res, next) => {
  try {
    console.log("Auth Middleware -----------------------------");
    const authHeader = req.header("Authorization");

    if (!authHeader)
      return res.json({
        status: variables.BadRequest,
        message: "Access denied. No token provided.",
      });

    const token = authHeader.replace("Bearer ", "");

    const access_token = await accessToken.findOne({ where: { token } });
    if (access_token) {
      if (new Date() > access_token.expiry_time) {
        await accessToken.destroy({ where: { token } });
        return res.json({
          status: variables.Unauthorized,
          message: "Token expired. Please log in again.",
        });
      }
    }

    // Verify the token
    const decoded = jwt.verify(token, jwtConfig);

    // Fetch the full user object, excluding the password
    const user = await User.findOne({
      where: { id: decoded.userId },
      attributes: { exclude: ["password"] }, // Exclude password from result
    });
    if (!user)
      return res.json({
        status: variables.NotFound,
        message: "User not found.",
      });
    req.user = user;
    // return res.json({ status: variables.SuccessStatus, message: 'verify done', user: req.user });
    next();
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      return res.json({
        status: variables.Unauthorized,
        message: "Token expired. Please log in again.",
      });
    }
    res.json({ status: variables.Unauthorized, message: "Invalid token." });
  }
};

export default authMiddleware;
