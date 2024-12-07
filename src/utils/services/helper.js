// import appConfig from "../../app/config/appConfig.js";
import { fail } from "assert";
import fs from "fs";
import generator from "generate-password";
import variables from "../../app/config/variableConfig.js";
import { Op } from "sequelize";


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

  sendResponse: (res, statusCode, status, data, message) => {
    res.status(statusCode).json({
      status: status,
      message: message || (status === 1 ? "Success" : "Error"),
      data: data || null,
    });
  },

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

  generatePass: async() => {
    try {
      const generatedPass = generator.generate({
        length: 10,
        numbers: true,
        uppercase: false,
        excludeSimilarCharacters: true,
        strict: true,
      });
      if (generatedPass) return generatedPass;

      return this.failed(res, variables.Unauthorized, "Unable to generate password for team member!");
    } catch (error) {
      return this.failed(res, variables.UnknownError, error.message);
    }
  },

  searchCondition: async (searchParam, searchable, otherField = null, otherParam = null) => {
      let where = {};
      let search = [];

      // let searchable = ["name", "status"];

      if (searchParam) {
        searchable.forEach((key) => {
          search.push({
            [key]: {
              [Op.substring]: searchParam,
            },
          });
        });

        where = {
          [Op.or]: search,
        };

        if (otherParam) {
          where.otherField = otherParam; // Adds another filter
        }
        return where;
      }
  }
};
