import variables from "../config/variableConfig.js";
import appConfig from "../config/appConfig.js";
import helper from "../../utils/services/helper.js";


const verifyUserMiddleware = async (req, res, next) => {
  // console.log("Verify User Middleware -----------------------------");
  try {
    if(req.user.isAdmin) return helper.failed(res, variables.BadRequest, "You are not allowed to access it."); 
    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return helper.failed(res, variables.BadRequest, "You are not allowed to access it.");
    }
    return helper.failed(res, variables.BadRequest, "Invalid Token");
  }
};

export default verifyUserMiddleware;
