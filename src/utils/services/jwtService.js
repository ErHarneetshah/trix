import jwt from "jsonwebtoken";
import appConfiguration from "../../app/config/appConfiguration.js";

const jwtConfig = new appConfiguration().jwt_config;

class jwtService {
  constructor(){}
  generateToken = (userId, isAdmin) => {
    return jwt.sign({ userId, isAdmin }, jwtConfig.jwtSecret, {
      expiresIn: jwtConfig.jwtExpTime,
    });
  };

  verifyToken = (token) => {
    try {
      return jwt.verify(token, jwtConfig.jwtSecret);
    } catch (err) {
      console.error("Token verification failed:", err);
      return null; // Or throw an error if needed
    }
  };
}

export default jwtService;
