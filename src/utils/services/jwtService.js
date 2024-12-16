import jwt from "jsonwebtoken";
import appConfig from "../../app/config/appConfig.js";

const jwtConfig = new appConfig().getJwtConfig();
// console.log("JWT Configuration ----------------------");
// console.log(jwtConfig);


class jwtService {
  constructor(){}
  generateToken = (userId, isAdmin, company_id, expTime) => {
    // console.log("Jwt token generator --------------------------");
    // console.log(jwtConfig);
    return jwt.sign({ userId, isAdmin, company_id }, jwtConfig, {
      expiresIn: expTime,
    });
  };

  verifyToken = (token) => {
    try {
      return jwt.verify(token, jwtConfig);
    } catch (err) {
      console.error("Token verification failed:", err);
      return null; // Or throw an error if needed
    }
  };
}

export default jwtService;
