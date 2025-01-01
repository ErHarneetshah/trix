import { fail } from "assert";
import fs from "fs";
import generator from "generate-password";
import variables from "../../app/config/variableConfig.js";
import { Op } from "sequelize";
import appConfig from "../../app/config/appConfig.js";
import JWT from "jsonwebtoken";
import { parse } from "tldts";
import moment from "moment";
import rolePermissionController from "../../app/controllers/admin/rolePermissionController.js";
import dns from "dns";

export default {
  checkRolePermission: async (roleId, moduleName, method, company_id) => {
    try {
      const permissionInstance = new rolePermissionController();
      const getPermission = await permissionInstance.getSpecificRolePermissions(roleId, moduleName, company_id);
      if (!getPermission.success) {
        return {
          success: "false",
          message: "Permission Not Found",
        };
      }
      let permissions = getPermission.data.dataValues.permissions;
      const reqMethod = method;
      if (typeof permissions === "string") {
        permissions = JSON.parse(permissions);
      }
      if (reqMethod in permissions) {
        if (permissions[reqMethod]) {
          return {
            success: true,
            message: "Permission granted",
          };
        } else {
          return {
            success: false,
            message: "You are not allowed to access this resource",
          };
        }
      } else {
        return {
          success: false,
          message: "Permission does not exist",
        };
      }
    } catch (error) {
      console.error("Error checking role permission:", error);
      return {
        success: false,
        message: "An error occurred while checking permissions",
      };
    }
  },

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

    //console.log({ result });

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
      return { message: `Unable to delete file at this moment`, status: 0 };
    }
  },

  generatePass: async () => {
    try {
      const generatedPass = generator.generate({
        length: 10,
        numbers: true,                 // Include numbers
        uppercase: true,               // Include uppercase letters
        symbols: true,                 // Include symbols
        excludeSimilarCharacters: true,// Exclude visually similar characters
        strict: true                   // Ensure at least one character from each selected pool
    });
    if (generatedPass) return generatedPass;    

      return this.failed(res, variables.BadRequest, "Unable to generate password for team member!");
    } catch (error) {
      return this.failed(res, variables.UnknownError, error.message);
    }
  },

  validateDomain: async (url) => {
    try {
      const domain = new URL(url).hostname; // Extract the domain from the URL
      
      const dnsCheck = await new Promise((resolve, reject) => {
        dns.lookup(domain, (err, address) => {
          if (err) {
            console.log(`${domain} is not valid or does not resolve.`);
            reject({ status: false, message: "Website URL is not Valid" });
          } else {
            console.log(`${domain} is valid and resolves to ${address}.`);
            resolve({ status: true, message: "Website URL is Valid" });
          }
        });
      });
  
      return dnsCheck;
    } catch (err) {
      return { status: false, message: "Website URL is not Valid" };
    }
  },
  


  searchCondition: async (searchParam, searchable, otherField = null, otherParam = null) => {
    let where = {};
    let search = [];

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
        where.otherField = otherParam;
      }
    }
    return where;
  },

  extractWebsiteName: (url) => {
    try {
      const parsed = parse(url);
      return parsed.domain;
    } catch (error) {
      console.error("Invalid URL:", url);
      return null;
    }
  },

  getDateRange: async (option, customStart, customEnd) => {
    const today = moment();
    let startDate, endDate;

    option = String(option);

    switch (option) {
      case "1": // Yesterday
        startDate = today.clone().subtract(1, "days").startOf("day").format("YYYY-MM-DD HH:mm:ss");
        endDate = today.clone().subtract(1, "days").endOf("day").format("YYYY-MM-DD HH:mm:ss");
        break;

      case "2": // Last week
        endDate = today.clone().startOf("week").subtract(1, "days").endOf("day").format("YYYY-MM-DD HH:mm:ss");
        startDate = moment(endDate, "YYYY-MM-DD HH:mm:ss").subtract(6, "days").startOf("day").format("YYYY-MM-DD HH:mm:ss");
        break;

      case "3": // Last month
        const firstDayOfThisMonth = today.clone().startOf("month");
        const lastDayOfPreviousMonth = firstDayOfThisMonth.clone().subtract(1, "days");
        startDate = lastDayOfPreviousMonth.clone().startOf("month").startOf("day").format("YYYY-MM-DD HH:mm:ss");
        endDate = lastDayOfPreviousMonth.endOf("day").format("YYYY-MM-DD HH:mm:ss");
        break;

      case "4": // Custom range
        if (!customStart || !customEnd) {
          throw new Error("Both customStart and customEnd must be provided for 'custom range'.");
        }
        startDate = moment(customStart).startOf("day").format("YYYY-MM-DD HH:mm:ss");
        endDate = moment(customEnd).endOf("day").format("YYYY-MM-DD HH:mm:ss");
        break;

      default:
        return { status: 0, message: "Invalid option!!!" };
    }

    return { startDate, endDate };
  },
};
