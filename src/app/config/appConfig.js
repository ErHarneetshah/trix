import dotenv from "dotenv";
dotenv.config();

class appConfig {
  //private variables
  #config;
  #jwtConfig;

  constructor() {
    if (process.env.NODE_ENV == "local") {
      this.#config = {
        port: process.env.DB_PORT,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        app_id: process.env.APP_ID,
        app_secret: process.env.APP_SECRET,
      };
    } else if (process.env.NODE_ENV == "staging") {
      this.#config = {
        port: process.env.S_DB_PORT,
        host: process.env.S_DB_HOST,
        database: process.env.S_DB_NAME,
        username: process.env.S_DB_USERNAME,
        password: process.env.S_DB_PASSWORD,
        app_id: process.env.APP_ID,
        app_secret: process.env.APP_SECRET,
      };
    } else {
      this.#config = {
        port: process.env.L_DB_PORT,
        host: process.env.L_DB_HOST,
        database: process.env.L_DB_NAME,
        username: process.env.L_DB_USERNAME,
        password: process.env.L_DB_PASSWORD,
        app_id: process.env.L_APP_ID,
        app_secret: process.env.L_APP_SECRET,
      };
    }
    this.#jwtConfig = process.env.JWT_SECRET_KEY;
  }

  getConfig(){
    return this.#config;
  }

  getJwtConfig(){
    return this.#jwtConfig;
  }
}

export default appConfig;
