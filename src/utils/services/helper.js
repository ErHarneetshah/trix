// import appConfig from "../../app/config/appConfig.js";
import fs from "fs";

// const ACCESS_TOKEN = new appConfig().getJwtConfig();

export default {
  success: (res, statusCode, message, data = null, extra = null) => {
    var result = {
      status: "1",
      status_text: "success",
      message: message,
    };

    if (data != null || data == []) {
      result["data"] = data;
    }

    if (extra != null) {
      Object.assign(result, extra);
    }

    return res.status(statusCode).json(result);
  },

  failed: (res, statusCode, message, data = null) => {
    var result = {
      status: 0,
      message: message || "something went wrong",
    };

    if (data != null || data == []) {
      result["data"] = data;
    }

    console.log({ result });

    return res.status(statusCode).json(result);
  },

  unauth: () => {
    return {
      status: "0",
      status_text: "failed",
      message: "Unauthenticated",
    };
  },

  // notfound: () => {
  //     return {
  //         status: "0",
  //         status_text: "failed",
  //         message: 'Not Found',
  //     }
  // },

  s_success: (message, data = null, extra = null) => {
    var result = {
      status: "1",
      status_text: "success",
      message: message,
    };

    if (data != null || data == []) {
      result["data"] = data;
    }

    if (extra != null) {
      Object.assign(result, extra);
    }

    return result;
  },

  s_failed: (message) => {
    return {
      status: "0",
      status_text: "failed",
      message: message,
    };
  },

    sendResponse: (res, statusCode, status, data, message) => {
      res.status(statusCode).json({
        status: status,
        message: message || (status === 1 ? "Success" : "Error"),
        data: data || null,
      });
    },
  // jwtToken: (id) => {
  //     return JWT.sign({
  //         userInfo: {
  //             id: id
  //         },
  //     }, ACCESS_TOKEN, { expiresIn: "1m" })
  // },

  deleteFile: (filePath) => {
    try {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Failed to delete file", err);
        } else {
          console.log("File deleted successfully.");
        }
      });
    } catch (error) {
      console.log({ del_file_error: error });
      return { message: `Unable to delete file at this moment`, status: 0 };
    }
  },
};
