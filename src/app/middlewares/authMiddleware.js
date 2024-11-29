import jwt from 'jsonwebtoken';
import User from '../../database/models/userModel.js';
import accessToken from '../../database/models/accessTokenModel.js';
import variables from '../config/variableConfig.js';
import logs from '../../storage/logs/logs.js';
// dotenv.config();

const authMiddleware = async (req, res, next) => {
  const logger = new logs();
  const authHeader = req.header('Authorization');

  if (!authHeader) return res.json({ status: 204, message: 'Access denied. No token provided.' });
  const token = authHeader.replace('Bearer ', '');  // Extract token from header

  try {
    const access_token = await accessToken.findOne({ where: { token } });
    if (access_token) {
      if (new Date() > access_token.expiry_time) {
        await accessToken.destroy({ where: { token } });
        return res.json({ status: variables.Unauthorized, message: 'Token expired. Please  log in again.' });
      }
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Fetch the full user object, excluding the password
    const user = await User.findOne({
      where: { id: userId },
      attributes: { exclude: ['password'] }  // Exclude password from result
    });
    if (!user) return res.json({ status: variables.UnknownError, message: 'User not found.' });
    req.user = user;
    // return res.json({ status: variables.SuccessStatus, message: 'verify done', user: req.user });
    next();  // Call the next middleware/route handler
  } catch (e) {
    logger.errorLogger(`Error occurred: ${e.message}`);
    if (e.name === 'TokenExpiredError') {
      return res.json({ status: variables.Unauthorized, message: 'Token expired. Please log in again.' });
    }
    res.json({ status: variables.Unauthorized, message: 'Invalid token.' });
  }
};

export default authMiddleware;