import jwt from "jsonwebtoken";
import appConfig from "../../app/config/appConfig.js";

const jwtConfig = new appConfig().getJwtConfig();
class jwtService {
  constructor(){}
  generateToken = (userId, isAdmin, company_id, expTime) => {
    return jwt.sign({ userId, isAdmin, company_id }, jwtConfig, {
      expiresIn: expTime,
    });
  };

  generateCustomToken = () => {
    return jwt.sign({ "product_name": "emonitrix" }, jwtConfig, {
      // expiresIn: expTime,
    });
  };  

  verifyToken = (token) => {
    try {
      return jwt.verify(token, jwtConfig);
    } catch (err) {
      console.error("Token verification failed:", err);
      return null;
    }
  };
}

export default jwtService;
