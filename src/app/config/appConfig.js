import dotenv from "dotenv";
dotenv.config();

class appConfig {
  //private variables
  #config;
  #jwtConfig;
  #imageBaseUrl;
  #SuperAdminUrl;
  #redirectUrl;
  #bucketUrl;
  #emonitrx_private_key;

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
      this.#imageBaseUrl = process.env.Local_Image_Url;
      this.#SuperAdminUrl = process.env.SuperAdmin_Local_URL;
      this.#redirectUrl = process.env.Redirect_Local_URL;
      this.#bucketUrl = process.env.Bucket_Local_URL;
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
      this.#imageBaseUrl = process.env.Demo_Image_Url;
      this.#SuperAdminUrl = process.env.SuperAdmin_Demo_URL;
      this.#redirectUrl = process.env.Redirect_Demo_URL;
      this.#bucketUrl = process.env.Bucket_Demo_URL;
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
      this.#imageBaseUrl = process.env.Demo_Image_Url;
      this.#SuperAdminUrl = process.env.SuperAdmin_Demo_URL;
      this.#redirectUrl = process.env.Redirect_Demo_URL;
      this.#bucketUrl = process.env.Bucket_Demo_URL;
    }
    this.#config.collation = process.env.collation;
    this.#jwtConfig = process.env.JWT_SECRET_KEY;
    this.#emonitrx_private_key = process.env.EMONITRIX_PRIVATE_KEY;
  }

  getConfig() {
    return this.#config;
  }

  getJwtConfig() {
    return this.#jwtConfig;
  }
  getEmonKey() {
    return this.#emonitrx_private_key;
  }
  getImageUrl() {
    return this.#imageBaseUrl;
  }
  getSuperAdminUrl() {
    return this.#SuperAdminUrl;
  }
  getRedirectUrl() {
    return this.#redirectUrl;
  }
  getBucketUrl() {
    return this.#bucketUrl;
  }
}
export default appConfig;
