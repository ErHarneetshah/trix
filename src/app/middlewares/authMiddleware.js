import jwt from "jsonwebtoken";
import User from "../../database/models/userModel.js";
import accessToken from "../../database/models/accessTokenModel.js";
import variables from "../config/variableConfig.js";
import appConfig from "../config/appConfig.js";
import helper from "../../utils/services/helper.js";
import { decode } from "punycode";

const jwtConfig = new appConfig().getJwtConfig();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader)
      return helper.failed(res, variables.Unauthorized, "Access Denied. No Token Provided");

    const token = authHeader.replace("Bearer ", "");

    const access_token = await accessToken.findOne({ where: {token: token } });
    if (access_token) {
      if (new Date() > access_token.expiry_time) {
        await accessToken.destroy({ where: { token: token } });
        return helper.failed(res, variables.Unauthorized, "Token Expired. Please log in again");
      }
    }

    // Verify the token
    const decoded = jwt.verify(token, jwtConfig);

    // Fetch the full user object, excluding the password
    const user = await User.findOne({
      where: { id: decoded.userId },
      attributes: { exclude: ["password"] }, // Exclude password from result
    });
    if (!user) return helper.failed(res, variables.NotFound, "User not found in system!");
    req.user = user;
    next();
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      return helper.failed(res, variables.Unauthorized, e.message);
    }
    return helper.failed(res, variables.Unauthorized, e.message);
  }
};

export default authMiddleware;
