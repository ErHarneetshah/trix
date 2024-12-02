import jwt from 'jsonwebtoken';
import accessToken from '../../database/models/accessTokenModel.js';
import variables from '../config/variableConfig.js';
import appConfig from "../config/appConfig.js";
// dotenv.config();

const jwtConfig = new appConfig().getJwtConfig();

const verifyAdminMiddleware = async (req, res, next) => {
  console.log("Verify Admin Middleware -----------------------------");
  try {
  const authHeader = req.header('Authorization');

  if (!authHeader) return res.json({ status: 204, message: 'Access denied. No token provided.' });
  const token = authHeader.replace('Bearer ', '');  // Extract token from header
    const access_token = await accessToken.findOne({ where: { token } });
    if (access_token) {
      if (new Date() > access_token.expiry_time) {
        await accessToken.destroy({ where: { token } });
        return res.json({ status: variables.Unauthorized, message: 'Token expired. Please log in again.' });
      }
    }

    // Verify the token
    const decoded = jwt.verify(token, jwtConfig);
    
    if(!decoded.isAdmin) return res.json({ status: variables.UnknownError, message: 'User is not an Admin.' }); 
    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.json({ status: variables.Unauthorized, message: 'Token expired. Please log in again.' });
    }
    res.json({ status: variables.Unauthorized, message: 'Invalid token.' });
  }
};

export default verifyAdminMiddleware;