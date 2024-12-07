import variables from '../config/variableConfig.js';
import helper from '../../utils/services/helper.js';
// dotenv.config();

const verifyAdminMiddleware = async (req, res, next) => {
<<<<<<< HEAD
  console.log("Verify Admin Middleware -----------------------------");
=======
  const logger = new logs();
  const authHeader = req.header('Authorization');

  if (!authHeader) return res.json({ status: 204, message: 'Access denied. No token provided.' });
  const token = authHeader.replace('Bearer ', '');  // Extract token from heaacder

>>>>>>> b8a9d454818d1f701beb03ee7c84ab3f31ca442f
  try {
    if(!req.user.isAdmin) return helper.failed(res, variables.Unauthorized, "You are not allowed to access it."); 
    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return helper.failed(res, variables.Unauthorized, "You are not allowed to access it.");
    }
    return helper.failed(res, variables.Unauthorized, "Invalid Token");
  }
};

export default verifyAdminMiddleware;