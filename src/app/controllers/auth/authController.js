import authValidation from "../../../utils/validations/authValidation.js";
import sequelize from "../../../database/queries/dbConnection.js";
import User from "../../../database/models/userModel.js";
import jwtService from "../../../utils/services/jwtService.js";
import accessToken, { createAccessToken } from "../../../database/models/accessTokenModel.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
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
import commonfuncitons from "../../../utils/services/commonfuncitons.js";
import validate from "../../../utils/CustomValidation.js";
import H from "../../../utils/Mail.js";

class authController extends jwtService {
  companyRegister = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const requestData = req.body;

      // Validating request body
      const validationResult = await authValidation.companyRegisterValid(requestData, res);
      if (!validationResult.status) return helper.sendResponse(res, variables.ValidationError, 0, {}, validationResult.message);

      // Check if the user already exists
      const existingCompany = await company.findOne({
        where: { name: requestData.companyName },
        transaction: dbTransaction,
      });
      if (existingCompany) {
        return helper.sendResponse(res, variables.BadRequest, 0, {}, "Company already exists with this Name!");
      }

      const existingCompanyWithEmail = await company.findOne({
        where: { email: requestData.email },
        transaction: dbTransaction,
      });
      if (existingCompanyWithEmail) {
        return helper.sendResponse(res, variables.BadRequest, 0, {}, "Company already exists with this Email!");
      }

      let companyPrefix = await helper.prefixInit(requestData.companyName);

      //* -------------- Create Company --------------------------
      const createCompany = await company.create(
        {
          name: requestData.companyName,
          email: requestData.email,
          employeeNumber: requestData.employeeNumber,
        },
        {
          transaction: dbTransaction,
        }
      );

      if (!createCompany || !createCompany.id) {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.sendResponse(res, variables.BadRequest, 0, {}, "Unable to Register Company");
      }

      companyPrefix = `${companyPrefix}-${createCompany.id}`;

      const updateCompany = await company.update(
        {
          companyEmpPrefix: companyPrefix,
        },
        {
          where: {
            id: createCompany.id,
          },
          transaction: dbTransaction,
        }
      );

      //* -------------- Create Report Settings --------------------------
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
        return helper.sendResponse(res, variables.BadRequest, 0, {}, "Unable to Create Report Settings for this Company");
      }

      //* -------------- Create Department --------------------------
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
        return helper.sendResponse(res, variables.BadRequest, 0, {}, "Unable to Create Department for this Company");
      }

      //* -------------- Create Designation --------------------------
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
        return helper.sendResponse(res, variables.BadRequest, 0, {}, "Unable to Create Designation for this Company");
      }

      //* -------------- Create Role --------------------------
      const createRole = await role.create(
        {
          name: "Admin",
          company_id: createCompany.id,
        },
        {
          transaction: dbTransaction,
        }
      );

      if (!createRole || !createRole.id) {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.sendResponse(res, variables.BadRequest, 0, {}, "Unable to Create Role for this Company");
      }

      //* -------------- Create Role Permissions --------------------------
      const permissionInstance = new rolePermissionController();
      const createPermissionModules = await app_modules.findAll({
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      for (const module of createPermissionModules) {
        let addedPermissions = await permissionInstance.addSuperAdminPermissions(module, createRole.id, createCompany.id, dbTransaction);
        if (!addedPermissions) {
          if (dbTransaction) await dbTransaction.rollback();
          return helper.sendResponse(res, variables.BadRequest, 0, {}, "Unable to Create Role Permission for this Company");
        }
      }

      //* -------------- Create Shift --------------------------
      const createShift = await shift.create(
        {
          company_id: createCompany.id,
          name: "Morning Shift",
          start_time: "09:00",
          end_time: "18:00",
          total_hours: 9,
          days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        },
        {
          transaction: dbTransaction,
        }
      );

      if (!createShift || !createShift.id) {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.sendResponse(res, variables.BadRequest, 0, {}, "Unable to Create Shift for this Company");
      }

      //* -------------- Create Team --------------------------
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

      let companyUserCount = await User.count({
        where: {
          company_id: createCompany.id,
        },
      });

      companyUserCount++;

      //* -------------- Create User -------------------------
      const createUser = await User.create(
        {
          empId: `${companyPrefix}-${companyUserCount}`,
          company_id: createCompany.id,
          fullname: requestData.name,
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
          next_reports_schedule_date: commonfuncitons.getNextMonthDate(),
        },
        {
          transaction: dbTransaction,
        }
      );

      if (!createUser || !createUser.id) {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.sendResponse(res, variables.BadRequest, 0, {}, "Unable to Create User for this Company");
      }

      const userWithRole = createUser.toJSON();
      userWithRole.role = { name: createRole.name };

      const updateEmpCount = await company.increment(
        { employeeCount: Number(companyUserCount) },
        {
          where: {
            id: createCompany.id,
          },
          transaction: dbTransaction,
        }
      );

      //* -------------- Update Department --------------------------
      const updateDept = await department.update(
        {
          reportingManagerId: createUser.id,
        },
        {
          where: {
            id: createDepartment.id,
            company_id: createCompany.id,
          },
          transaction: dbTransaction,
        }
      );

      if (!updateDept || updateDept[0] === 0) {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.sendResponse(res, variables.BadRequest, 0, {}, "Unable to Add Reporting Manager for Department");
      }

      //* -------------- Create Language Settings --------------------------
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
        return helper.sendResponse(res, variables.BadRequest, 0, {}, "Unable to Create Language Settings for this Company");
      }

      //* -------------- Create Access Token --------------------------
      const token = this.generateToken(createUser.id.toString(), createUser.isAdmin, createUser.company_id, "1d");
      if (!token) return helper.failed(res, variables.serviceUnavailabe, "Unable to create access token");

      const expireTime = this.calculateTime();
      await createAccessToken(createUser.id, createUser.isAdmin, createUser.company_id, token, expireTime, dbTransaction);

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "Register Successfully", {
        token: token,
        user: userWithRole,
      });
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.sendResponse(res, variables.BadRequest, 0, {}, error.message);
    }
  };

  login = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      let requestData = req.body;

      let validationResult = await authValidation.loginValid(requestData, res);
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
      });
      if (!user) {
        return helper.sendResponse(res, variables.BadRequest, 0, null, "Invalid Credentials");
      }

      let comparePwd = await bcrypt.compare(password, user.password);
      if (!comparePwd) {
        return helper.sendResponse(res, variables.BadRequest, 0, null, "Incorrect Credentials!!!");
      }

      if (!user.status) {
        return helper.sendResponse(res, variables.Unauthorized, 0, null, "Your Account has been De-Activated. Contact Support");
      }
      let token;
      if (user.isAdmin) {
        //Deleting previous sessions here
        // await accessToken.destroy({ where: { userId: user.id } });  //! commenting for now

        token = this.generateToken(user.id.toString(), user.isAdmin, user.company_id, "1d");
        let expireTime = this.calculateTime();
        await createAccessToken(user.id, user.isAdmin, user.company_id, token, expireTime, dbTransaction);
      } else {
        let now = new Date();
        let currentHours = now.getHours();
        let currentMinutes = now.getMinutes();
        let shiftData = await getShiftData(user.teamId);

        let shiftStart = shiftData.start_time.split(":").map(Number);
        let shiftEnd = shiftData.end_time.split(":").map(Number);

        let shiftStartInMinutes = shiftStart[0] * 60 + shiftStart[1];
        let shiftEndInMinutes = shiftEnd[0] * 60 + shiftEnd[1];
        let currentInMinutes = currentHours * 60 + currentMinutes;

        if (shiftEndInMinutes < shiftStartInMinutes) {
          shiftEndInMinutes += 24 * 60;
          if (currentInMinutes < shiftStartInMinutes) {
            currentInMinutes += 24 * 60;
          }
        }

        if (currentInMinutes < shiftStartInMinutes || currentInMinutes > shiftEndInMinutes) {
          return helper.sendResponse(res, variables.Forbidden, 0, {}, "Your shift is over. You cannot log in at this time.");
        }
        ///////------  Previous Code --------///////
        // let now = new Date();
        // let currentHours = now.getHours();
        // let currentMinutes = now.getMinutes();

        // let shiftData = await getShiftData(user.teamId);

        // // let [shiftHours, shiftMinutes] = shiftData.start_time.split(":").map(Number);
        // let [endHours, endMinutes] = shiftData.end_time.split(":").map(Number);

        // if (currentHours > endHours || (currentHours == endHours && currentMinutes > endMinutes)) {
        //   return helper.sendResponse(res, variables.Forbidden, 0, {}, "Your shift is over. You cannot log in at this time.");
        // }

        //Deleting previous sessions here
        // await accessToken.destroy({ where: { userId: user.id } }); //! commenting for now

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
      let token = await accessToken.findOne({ where: { token: req.sessionToken } });
      if (!token) return helper.success(res, variables.Success, "Already Logout");

      await token.destroy();

      return helper.success(res, variables.Success, "Logout Successfully");
    } catch (error) {
      return helper.failed(res, variables.Unauthorized, error.message);
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

  advanced_setting = async (req, res) => {
    try {
      // ___________-------- Role Permisisons Exists or not ---------________________
      const routeMethod = req.method;
      const isApproved = await helper.checkRolePermission(req.user.roleId, "Advance Settings", routeMethod, req.user.company_id);
      if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
      // ___________-------- Role Permisisons Exists or not ---------________________

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
        {
          key: "screen_capture",
          value: screen_capture,
          validValues: [0, 1, true, false],
        },
        {
          key: "broswer_capture",
          value: broswer_capture,
          validValues: [0, 1, true, false],
        },
        {
          key: "app_capture",
          value: app_capture,
          validValues: [0, 1, true, false],
        },
        {
          key: "screen_capture_time",
          value: screen_capture_time,
          minValue: 30,
        },
        {
          key: "broswer_capture_time",
          value: broswer_capture_time,
          minValue: 30,
        },
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
      // ___________-------- Role Permisisons Exists or not ---------________________
      const routeMethod = req.method;
      const isApproved = await helper.checkRolePermission(req.user.roleId, "Advance Settings", routeMethod, req.user.company_id);
      if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
      // ___________-------- Role Permisisons Exists or not ---------________________

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

  sendOtp = async (req, res) => {
    try {
      let { email } = req.body;
      console.log(email);
      const rules = {
        email: "required|email",
      };

      const { status, message } = await validate(req.body, rules);

      if (status === 0) {
        return helper.failed(res, variables.ValidationError, message);
      }

      let isUserExist = await User.findOne({
        where: { email: email },
      });

      if (!isUserExist) {
        return helper.failed(res, variables.NotFound, "This user does not exist in our records.");
      }

      let otp = Math.floor(100000 + Math.random() * 900000);
      let otpExpireTime = new Date();
      otpExpireTime.setMinutes(otpExpireTime.getMinutes() + 2);
      // UPDATE THE USERS TABLE
      await User.update({ otp: otp, otp_expire_time: otpExpireTime }, { where: { id: isUserExist.id } });

      const textMessage = `Hello ${isUserExist.fullname},\n\nYour OTP is ${otp}. This OTP is valid for only 2 mimnutes.\n\nBest regards`;

      const subject = "Emonitrix-Otp for Forgot Password";
      const sendmail = await H.sendM(isUserExist.company_id, isUserExist.email, subject, textMessage);

      if (!sendmail.success) {
        return helper.failed(res, variables.BadRequest, "Failed to send Email. Please try Again!");
      }
      return helper.success(res, variables.Success, "OTP is sent to your email.Please check your Email.");
    } catch (error) {
      return helper.failed(res, variables.BadRequest, "Unable to Fulfil Request. Please Try Again!");
    }
  };

  changePassword = async (req, res) => {
    try {
      let { otp, password, confirmPassword } = req.body;

      const rules = {
        otp: "required|integer",
        password: "string|password_regex",
        confirmPassword: "required_with:password|same:password",
      };

      const { status, message } = await validate(req.body, rules);
      if (status === 0) {
        return helper.failed(res, variables.ValidationError, message);
      }

      // Find user by OTP
      const user = await User.findOne({ where: { otp: otp } });

      if (!user) {
        return helper.failed(res, variables.NotFound, "Invalid OTP.");
      }

      // Check if OTP is expired
      if (new Date() > user.otp_expire_time) {
        return helper.failed(res, variables.NotFound, "OTP has expired.");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user's password
      await User.update({ password: hashedPassword, otp: null, otp_expire_time: null }, { where: { id: user.id } });
      const textMessage = `Hello ${user.fullname},\n\nYour  password changed successfully!\n\nHere are your login details:\nEmail: ${user.email}\nPassword: ${password}\n\nPlease log in to the application with these credentials.\n\nBest regards`;

      const subject = "Emonitrix-Updated Password";
      const sendmail = await H.sendM(user.company_id, user.email, subject, textMessage);

      if (!sendmail.success) {
        return helper.failed(res, variables.BadRequest, "Failed to send Email");
      }
      return helper.success(res, variables.Success, "Password updated successfully.Please check your updated password email.");
    } catch (error) {
      console.error("Error generateNewPassword:", error.message);
      return helper.failed(res, variables.BadRequest, "Failed to getTeamMember");
    }
  };
}

export default authController;
