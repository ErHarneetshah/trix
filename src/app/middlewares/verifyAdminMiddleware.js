import variables from '../config/variableConfig.js';
import helper from '../../utils/services/helper.js';
// dotenv.config();

const verifyAdminMiddleware = async (req, res, next) => {
  // //console.log("Verify Admin Middleware -----------------------------");
  // //console.log(req.user.company_id);
  try {
    if(!req.user.isAdmin) return helper.failed(res, variables.BadRequest, "You are not allowed to access it."); 
    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return helper.failed(res, variables.BadRequest, "You are not allowed to access it.");
    }
    return helper.failed(res, variables.BadRequest, "Invalid Token");
  }
};

export default verifyAdminMiddleware;