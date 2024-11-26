import dotenv from "dotenv";
dotenv.config();

class appConfiguration {
  constructor() {
    this.db_config = {
      dbHost: process.env.DB_HOST,
      dbName: process.env.DB_DATABASE,
      dbUser: process.env.DB_USERNAME,
      dbPassword: process.env.DB_PASSWORD,
      port: process.env.PORT || 3000, // Default to 3000 if PORT is not set
    };
  }
}

export default appConfiguration;
