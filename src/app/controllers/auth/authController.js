import authValidation from "../../../utils/validations/authValidation.js";
import sequelize from "../../../database/queries/dbConnection.js";
import User from "../../../database/models/userModel.js";
import jwtService from "../../../utils/services/jwtService.js";
import accessToken, { createAccessToken } from "../../../database/models/accessTokenModel.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import TimeLog from "../../../database/models/timeLogsModel.js";
import { getShiftData } from "../../../utils/validations/socketValidation.js";
import bcrypt from "bcrypt";
import company from "../../../database/models/company.js";
import department from "../../../database/models/departmentModel.js";
import designation from "../../../database/models/designationModel.js";
import role from "../../../database/models/roleModel.js";
import team from "../../../database/models/teamModel.js";
import shift from "../../../database/models/shiftModel.js";
import app_modules from "../../../database/models/moduleModel.js";
import rolePermissionController from "../admin/rolePermissionController.js";
import { Device } from "../../../database/models/device.js";
import { io } from "../../../../app.js";
import Model from "../../../database/queries/dbConnection.js";
import { QueryTypes } from "@sequelize/core";
import { BlockedWebsites } from "../../../database/models/BlockedWebsite.js";
import { Notification } from "../../../database/models/Notification.js";
import reportSettings from "../../../database/models/reportSettingsModel.js";
import languageSettings from "../../../database/models/languageSettingsModel.js";

class authController extends jwtService {
  companyRegister = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const requestData = req.body;

      console.log(requestData);

      // Validating request body
      const validationResult = await authValidation.companyRegisterValid(requestData, res);
      if (!validationResult.status) return helper.sendResponse(res, variables.ValidationError, 0, {}, validationResult.message);

      // Check if the user already exists
      const existingCompany = await company.findOne({
        where: { name: requestData.name /*email: requestData.email*/ },
        transaction: dbTransaction,
      });
      if (existingCompany) {
        return helper.sendResponse(res, variables.Unauthorized, 0, null, "Company already exists with this Name and Email!");
      }

      //* Step1
      const createCompany = await company.create(
        {
          name: requestData.name,
          email: requestData.email,
          employeeNumber: requestData.employeeNumber,
        },
        {
          transaction: dbTransaction,
        }
      );

      if (!createCompany || !createCompany.id) {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.sendResponse(res, variables.BadRequest, 0, null, "Unable to Register Company");
      }

      const createReportSettings = await reportSettings.create(
        {
          company_id: createCompany.id,
        },
        {
          transaction: dbTransaction,
        }
      );

      if (!createReportSettings || !createReportSettings.id) {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.sendResponse(res, variables.BadRequest, 0, null, "Unable to Create Report Settings for this Company");
      }

      const createDepartment = await department.create(
        {
          name: "Upper Management",
          isRootId: 1,
          company_id: createCompany.id,
        },
        {
          transaction: dbTransaction,
        }
      );

      if (!createDepartment || !createDepartment.id) {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.sendResponse(res, variables.BadRequest, 0, null, "Unable to Create Department for this Company");
      }

      const createDesignation = await designation.create(
        {
          name: "MD (Managing Director)",
          company_id: createCompany.id,
        },
        {
          transaction: dbTransaction,
        }
      );

      if (!createDesignation || !createDesignation.id) {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.sendResponse(res, variables.BadRequest, 0, null, "Unable to Create Designation for this Company");
      }

      const createRole = await role.create(
        {
          name: "Super Admin",
          company_id: createCompany.id,
        },
        {
          transaction: dbTransaction,
        }
      );

      if (!createRole || !createRole.id) {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.sendResponse(res, variables.BadRequest, 0, null, "Unable to Create Role for this Company");
      }

      const permissionInstance = new rolePermissionController();
      const createPermissionModules = await app_modules.findAll({
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      for (const module of createPermissionModules) {
        let addedPermissions = await permissionInstance.addSuperAdminPermissions(module, createRole.id, createCompany.id, dbTransaction);
        if (!addedPermissions) {
          if (dbTransaction) await dbTransaction.rollback();
          return helper.sendResponse(res, variables.BadRequest, 0, null, "Unable to Create Role Permission for this Company");
        }
      }

      const createShift = await shift.create(
        {
          company_id: createCompany.id,
          name: "Morning Shift",
          start_time: "09:00",
          end_time: "18:00",
          total_hours: 9,
          days: ["mon", "tue", "wed", "thu", "fri"],
        },
        {
          transaction: dbTransaction,
        }
      );

      if (!createShift || !createShift.id) {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.sendResponse(res, variables.BadRequest, 0, null, "Unable to Create Shift for this Company");
      }


      const createTeam = await team.create(
        {
          name: "Upper Management Team",
          company_id: createCompany.id,
          departmentId: createDepartment.id,
          shiftId: createShift.id,
        },
        {
          transaction: dbTransaction,
        }
      );

      if (!createTeam || !createTeam.id) {
        if (dbTransaction) await dbTransaction.rollback();
        throw new Error("Unable to Create Team Record for this company.");
      }

      const createUser = await User.create(
        {
          company_id: createCompany.id,
          fullname: createCompany.name,
          email: requestData.email,
          password: await bcrypt.hash(requestData.password, 10),
          mobile: requestData.mobile,
          departmentId: createDepartment.id,
          designationId: createDesignation.id,
          roleId: createRole.id,
          teamId: createTeam.id,
          isAdmin: 1,
          screen_capture_time: 60,
          app_capture_time: 60,
          broswer_capture_time: 60,
        },
        {
          transaction: dbTransaction,
        }
      );

      if (!createUser || !createUser.id) {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.sendResponse(res, variables.BadRequest, 0, null, "Unable to Create User for this Company");
      }

      const createLanguages = await languageSettings.create(
        {
          user_id: createUser.id,
          company_id: createCompany.id,
        },
        {
          transaction: dbTransaction,
        }
      );

      if (!createLanguages || !createLanguages.id) {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.sendResponse(res, variables.BadRequest, 0, null, "Unable to Create Language Settings for this Company");
      }

      const token = this.generateToken(createUser.id.toString(), createUser.isAdmin, createUser.company_id, "1d");
      if (!token) return helper.failed(res, variables.serviceUnavailabe, "Unable to create access token");

      const expireTime = this.calculateTime();
      await createAccessToken(createUser.id, createUser.isAdmin, createUser.company_id, token, expireTime, dbTransaction);

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "Register Successfully");
    } catch (error) {
      console.log(error.message);
      if (dbTransaction) await dbTransaction.rollback();
      return helper.sendResponse(res, variables.BadRequest, 0, null, error.message);
    }
  };

  login = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      let today = new Date().toISOString().split("T")[0];
      let requestData = req.body;

      let validationResult = await authValidation.loginValid(requestData, res); // validation done here
      if (!validationResult.status) return helper.sendResponse(res, variables.ValidationError, 0, {}, validationResult.message);

      //* Request parameters
      let email = requestData.email;
      let password = requestData.password;

      let user = await User.findOne({
        where: { email: email },
        include: [
          {
            model: department,
            as: "department",
            attributes: ["name"],
          },
          {
            model: designation,
            as: "designation",
            attributes: ["name"],
          },
          {
            model: role,
            as: "role",
            attributes: ["name"],
          },
          {
            model: team,
            as: "team",
            attributes: ["name"],
          },
        ],
      }); // checking whether user exists
      if (!user) {
        return helper.sendResponse(res, variables.Unauthorized, 0, null, "Invalid Credentials");
      }

      let comparePwd = await bcrypt.compare(password, user.password); // comparing passwords
      if (!comparePwd) {
        return helper.sendResponse(res, variables.Unauthorized, 0, null, "Incorrect Credentials!!!");
      }

      // checking whether user is active or not
      if (!user.status) {
        return helper.sendResponse(res, variables.Forbidden, 0, null, "Your Account has been De-Activated. Contact Support");
      }
      let token;

      // Generate Token if user is Admin
      if (user.isAdmin) {
        token = this.generateToken(user.id.toString(), user.isAdmin, user.company_id, "1d");
        let expireTime = this.calculateTime();
        await createAccessToken(user.id, user.isAdmin, user.company_id, token, expireTime, dbTransaction);
      } else {
        let now = new Date();
        let currentHours = now.getHours();
        let currentMinutes = now.getMinutes();

        let shiftData = await getShiftData(user.teamId);

        // let [shiftHours, shiftMinutes] = shiftData.start_time.split(":").map(Number);
        let [endHours, endMinutes] = shiftData.end_time.split(":").map(Number);

        console.log(endHours, endMinutes, currentHours, currentMinutes);

        if (currentHours > endHours || (currentHours == endHours && currentMinutes > endMinutes)) {
          return helper.sendResponse(res, variables.Forbidden, 0, {}, "Your shift is over. You cannot log in at this time.");
        }

        token = this.generateToken(user.id.toString(), user.isAdmin, user.company_id, "1d");
        let expireTime = this.calculateTime();

        const generatedToken = await createAccessToken(user.id, user.isAdmin, user.company_id, token, expireTime, dbTransaction);

        if (!generatedToken) return helper.sendResponse(res, variables.BadRequest, 0, null, "Token Did not saved in db");
      }
      await dbTransaction.commit();
      return helper.sendResponse(res, variables.Success, 1, { token: token, user: user }, "Login Successfully");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.sendResponse(res, variables.Forbidden, 0, null, error.message);
    }
  };

  //* Logout Function -----------------------------------------------------------------
  logout = async (req, res) => {
    try {
      let userData = await User.findOne({ where: { id: req.user.id } });
      let token = await accessToken.findOne({ where: { token: req.sessionToken } }); // checking if the token exists in system
      if (!token) return helper.failed(res, variables.NotFound, "Already Logout");

      await token.destroy(); // token destroyed here

      return helper.success(res, variables.Success, "Logout Successfully");
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* Calculation expiry time for token
  calculateTime = () => {
    let oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 1 day = 24 hours, 60 minutes, 60 seconds, 1000 ms
    const now = new Date(); // Current date and time

    // Add 1 day to the current date
    const oneDayFromNow = new Date(now.getTime() + oneDayInMilliseconds).toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" });
    return oneDayFromNow;
  };

  device = async (req, res) => {
    try {
      let id = req.query.id;
      let { deviceName, deviceId, memory } = req.body;
      let user = await User.findOne({ where: { id } });
      if (!user) {
        return helper.failed(res, variables.BadRequest, "User not found!!!");
      }
      if (!deviceName || !deviceId || !memory) {
        return helper.failed(res, variables.BadRequest, "Invalid Data!!!");
      }
      let device = await Device.findOne({ where: { user_id: id } });
      let create;
      if (!device) {
        let departmentId = user?.departmentId;
        let companyId = user?.company_id;
        create = await Device.create({
          user_id: id,
          device_name: deviceName,
          device_id: deviceId,
          companyId,
          departmentId,
          memory,
        });
      } else {
        await device.update({
          device_name: deviceName ? deviceName : device.device_name,
          device_id: deviceId ? deviceId : device.device_id,
          memory: memory ? memory : device.memory,
        });
        create = await Device.findOne({ where: { user_id: id } });
      }
      io.to(`Admin_${req.user.company_id}`).emit("getSystemDetail", create);
      return helper.success(res, variables.Success, "system configration add successfully");
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  blockedlist = async (req, res) => {
    try {
      let user = await User.findOne({ where: { id: req.user.id } });
      if (!user) {
        return { error: "User not found" };
      }
      let blockedWebsites = await BlockedWebsites.findAndCountAll({
        where: {
          companyId: user.company_id,
          departmentId: user?.departmentId,
          status: 1,
        },
        attributes: ["website"],
      });
      return helper.success(res, variables.Success, "Blocked websites fetched successfully!!", blockedWebsites);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, "Error in blocked Website!!!");
    }
  };

  absent = async (req, res) => {
    try {
      let month = req.query.month ? req.query.month : new Date().getMonth() + 1;
      let year = req.query.year ? req.query.year : new Date().getFullYear();

      if (!month || !year) {
        return helper.failed(res, variables.ValidationError, "Invalid Data!!!");
      }
      let web_query = `select (select count(id) from users where company_id=${req.user.company_id}) as total_employees,(select count(id) from users where company_id=${req.user.company_id})-((select count(id) from users where company_id=${req.user.company_id}) -count(DISTINCT user_id)) as total_persent_employees,(select count(id) from users where company_id=${req.user.company_id}) -count(DISTINCT user_id) as total_absent_employees,date from timelogs where company_id=${req.user.company_id} and month(date)=${month} and year(date)=${year} group by date`;
      let Absent_data = await Model.query(web_query, {
        type: QueryTypes.SELECT,
      });
      return helper.success(res, variables.Success, "Absent Calender Data fetched successfully!!", Absent_data);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  markAsRead = async (req, res) => {
    try {
      let data = await Notification.findAll({ where: { is_read: 0 } });
      if (!data || data.length == 0) {
        return helper.success(res, variables.Success, "No unread notifications found.");
      }
      await Notification.update({ is_read: 1 }, { where: { is_read: 0 } });
      io.to(`Admin_${req.user.company_id}`).emit("newNotification", {
        notificationCount: 0,
      });
      return helper.success(res, variables.Success, "Notification Data cleared successfully");
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  notification_page = async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const page = parseInt(req.query.page) || 1;
      const offset = (page - 1) * limit;
      const whereCondition = {
        company_id: req.user.company_id,
      };
      if (req.query.date) {
        whereCondition.date = req.query.date;
      }

      const data = await Notification.findAndCountAll({
        where: whereCondition,
        order: [["id", "DESC"]],
        limit,
        offset,
      });

      if (!data || data.length == 0) {
        return helper.success(res, variables.Success, "No notifications found.");
      }

      return helper.success(res, variables.Success, "Notification Data fetched successfully", data);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  // advanced_setting = async (req, res) => {
  //   try {
  //     let { screen_capture, broswer_capture, app_capture } = req.body;
  //     if (![0, 1].includes(screen_capture) || ![0, 1].includes(broswer_capture) || ![0, 1].includes(app_capture)) {
  //       return helper.failed(res, variables.BadRequest, "Invalid Data");
  //     }

  //     let data = await company.findOne({ where: { id: req.user.company_id } });
  //     if (!data) {
  //       return helper.failed(res, variables.NotFound, "company not found!!");
  //     }
  //     data.screen_capture = screen_capture;
  //     data.broswer_capture = broswer_capture;
  //     data.app_capture = app_capture;
  //     data.save();
  //     return helper.success(res, variables.Success, "Advanced setting update successfully!");
  //   } catch (error) {
  //     return helper.failed(res, variables.BadRequest, error.message);
  //   }
  // };
  advanced_setting = async (req, res) => {
    try {
      let { screen_capture, broswer_capture, app_capture, screen_capture_time, broswer_capture_time, app_capture_time } = req.body;

      // Normalize boolean inputs (convert string 'true'/'false' to actual booleans)
      const normalizeBoolean = (value) => {
        if (value === "true") return true;
        if (value === "false") return false;
        return value;
      };

      screen_capture = normalizeBoolean(screen_capture);
      broswer_capture = normalizeBoolean(broswer_capture);
      app_capture = normalizeBoolean(app_capture);

      const validations = [
        { key: "screen_capture", value: screen_capture, validValues: [0, 1, true, false] },
        { key: "broswer_capture", value: broswer_capture, validValues: [0, 1, true, false] },
        { key: "app_capture", value: app_capture, validValues: [0, 1, true, false] },
        { key: "screen_capture_time", value: screen_capture_time, minValue: 30 },
        { key: "broswer_capture_time", value: broswer_capture_time, minValue: 30 },
        { key: "app_capture_time", value: app_capture_time, minValue: 30 },
      ];

      for (const validation of validations) {
        if (validation.validValues && !validation.validValues.includes(validation.value)) {
          return helper.failed(res, variables.BadRequest, `Invalid value for ${validation.key}. Allowed values are: ${validation.validValues.join(", ")}.`);
        }
        if (validation.minValue && validation.value < validation.minValue) {
          return helper.failed(res, variables.BadRequest, `${validation.key} must be at least ${validation.minValue}.`);
        }
      }

      const users = await User.findAll({
        where: { company_id: req.user.company_id },
      });
      if (!users || users.length === 0) {
        return helper.failed(res, variables.NotFound, "Data Not Found!!");
      }

      for (const user of users) {
        await user.update({
          screen_capture_time,
          broswer_capture_time,
          app_capture_time,
          screen_capture,
          broswer_capture,
          app_capture,
        });
      }

      return helper.success(res, variables.Success, "Advanced settings updated successfully!");
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  get_advanced_setting = async (req, res) => {
    try {
      let id = req.user.id;
      let data = await User.findOne({
        where: { id },
        attributes: ["screen_capture_time", "broswer_capture_time", "app_capture_time", "screen_capture", "broswer_capture", "app_capture"],
      });
      if (!data) {
        return helper.failed(res, variables.NotFound, "Data Not Found!!");
      }
      return helper.success(res, variables.Success, "Advanced settings updated successfully!", data);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default authController;
