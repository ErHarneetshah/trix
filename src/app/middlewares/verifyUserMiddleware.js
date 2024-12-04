import jwt from "jsonwebtoken";
import accessToken from "../../database/models/accessTokenModel.js";
import variables from "../config/variableConfig.js";
import appConfig from "../config/appConfig.js";
import helper from "../../utils/services/helper.js";

const jwtConfig = new appConfig().getJwtConfig();

const verifyUserMiddleware = async (req, res, next) => {
  console.log("Verify User Middleware -----------------------------");
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) return helper.failed(res, variables.Unauthorized, "Access Denied! No Token Provided");
    const token = authHeader.replace("Bearer ", "");
    const access_token = await accessToken.findOne({ where: { token } });
    if (access_token) {
      if (new Date() > access_token.expiry_time) {
        await accessToken.destroy({ where: { token } });
        return helper.failed(res, variables.Unauthorized, "Token Expired! Please Log in again.");
      }
    }

    // Verify the token
    const decoded = jwt.verify(token, jwtConfig);

    if (decoded.isAdmin) return helper.failed(res, variables.Unauthorized, "You are not allowed to access it.");
    next();
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      return helper.failed(res, variables.Unauthorized, "You are not allowed to access it.");
    }
    return helper.failed(res, variables.Unauthorized, "Invalid Token");
  }
};

export default verifyUserMiddleware;
