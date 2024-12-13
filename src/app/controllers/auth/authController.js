import authValidation from "../../../utils/validations/authValidation.js";
import sequelize from "../../../database/queries/dbConnection.js";
import User from "../../../database/models/userModel.js";
import jwtService from "../../../utils/services/jwtService.js";
import accessToken, {
  createAccessToken,
} from "../../../database/models/accessTokenModel.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import TimeLog from "../../../database/models/TimeLog.js";
import { getShiftData } from "../../../utils/validations/socketValidation.js";
import bcrypt from "bcrypt";
import { Device } from "../../../database/models/device.js";
import { io } from "../../../../app.js";
import Model from "../../../database/queries/dbConnection.js";
import { QueryTypes } from "@sequelize/core";
import { BlockedWebsites } from "../../../database/models/BlockedWebsite.js";
import { Notification } from "../../../database/models/Notification.js";
import company from "../../../database/models/company.js";
import department from "../../../database/models/departmentModel.js";
import designation from "../../../database/models/designationModel.js";

class authController extends jwtService {
  //* Login Funciton Rajan --------------------------------------------------------------
  login = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      let today = new Date().toISOString().split("T")[0];
      let requestData = req.body;

      let validationResult = await authValidation.loginValid(requestData, res); // validation done here

      //* Request parameters
      let email = requestData.email;
      let password = requestData.password;

      let user = await User.findOne({ 
        where: { email: email 
        },
        include: [
          {
            model: department,
            attributes: ["name"],
          },
          {
            model: designation,
            attributes: ["name"],
          }
        ]
      }); // checking whether user exists
      
      let comparePwd = await bcrypt.compare(password, user.password); // comparing passwords
      if (!comparePwd) {
        return helper.sendResponse(
          res,
          variables.Unauthorized,
          0,
          null,
          "Invalid Credentials"
        );
      }

      // checking whether user is active or not
      if (!user.status) {
        return helper.sendResponse(
          res,
          variables.Forbidden,
          0,
          null,
          "Your Account has been De-Activated. Contact Support"
        );
      }
      let token;

      // Generate Token if user is Admin
      if (user.isAdmin) {
        token = this.generateToken(
          user.id.toString(),
          user.isAdmin,
          user.company_id,
          "1d"
        );
        let expireTime = this.calculateTime();
        await createAccessToken(
          user.id,
          user.isAdmin,
          user.company_id,
          token,
          expireTime,
          dbTransaction
        );

        // setting Admin attendence (currentStatus) to present(1)
        user.currentStatus = 1;
        user.save();
      } else {
        // Ensure the user isn't logging in after shift end time
        let now = new Date();
        let currentHours = now.getHours();
        let currentMinutes = now.getMinutes();

        let shiftData = await getShiftData(user.teamId); //getting shift details of user

        let [shiftHours, shiftMinutes] = shiftData.start_time
          .split(":")
          .map(Number);
        let [endHours, endMinutes] = shiftData.end_time.split(":").map(Number);

        if (
          currentHours > endHours &&
          currentHours === endHours &&
          currentMinutes > endMinutes
        ) {
          return helper.sendResponse(
            res,
            variables.Forbidden,
            0,
            {},
            "Your shift is over. You cannot log in at this time."
          );
        }

        // Generating Token for user
        token = this.generateToken(
          user.id.toString(),
          user.isAdmin,
          user.company_id,
          "1d"
        );
        let expireTime = this.calculateTime();
        await createAccessToken(
          user.id,
          user.isAdmin,
          user.company_id,
          token,
          expireTime,
          dbTransaction
        );

        //* Time Log Management is done from here -----------------------------------------------
        let timeLog = await TimeLog.findOne({
          where: {
            user_id: user.id,
            date: today,
          },
          order: [["createdAt", "DESC"]],
        });
        let lateComing = 0;
        let lateComingDuration = "00:00";
        let lateMinutes = 0;

        if (timeLog && timeLog.logged_out_time != null) {
          const [hours, mins] = timeLog.logged_out_time.split(":").map(Number);
          let logoutTime = new Date();
          logoutTime.setHours(hours, mins, 0, 0);
          let spareMinutes = Math.floor((now - logoutTime) / 60000);
          timeLog.spare_time =
            parseInt(timeLog.spare_time) + parseInt(spareMinutes);
          timeLog.logged_out_time = null;
          timeLog.save();
          user.currentStatus = 1;
          user.save();
        } else {
          if (
            currentHours > shiftHours ||
            (currentHours === shiftHours && currentMinutes > shiftMinutes)
          ) {
            lateMinutes =
              (currentHours - shiftHours) * 60 +
              (currentMinutes - shiftMinutes);
            lateComing = 1;
            lateComingDuration = `${Math.floor(lateMinutes / 60)}:${
              lateMinutes % 60
            }`;
          }
          const [lateHours, lateMins] = lateComingDuration
            .split(":")
            .map(Number);
          lateMinutes = lateHours * 60 + lateMins;

          user.currentStatus = 1;
          user.save();

          // Create a new TimeLog entry
          await TimeLog.create({
            user_id: user.id,
            shift_id: shiftData.id,
            company_id: user.company_id,
            logged_in_time: `${currentHours}:${currentMinutes}`,
            late_coming: lateComing,
            late_coming_duration: lateMinutes,
            spare_time: 0,
            active_time: 0,
            date: today,
          });
        }
      }
      await dbTransaction.commit();
      return helper.sendResponse(
        res,
        variables.Success,
        1,
        { token: token, user: user },
        "Login Successfully"
      );
    } catch (error) {
      console.log(error);

      await dbTransaction.rollback();
      return helper.sendResponse(
        res,
        variables.BadRequest,
        0,
        null,
        error.message
      );
    }
  };

  //* Logout Function -----------------------------------------------------------------
  logout = async (req, res) => {
    try {
      let userData = await User.findOne({ where: { id: req.user.id } }); // checking if the user exists based on id
      let token = await accessToken.findOne({ where: { userId: req.user.id } }); // checking if the token exists in system

      //* Upadting Time log if the user is not admin
      if (!userData.isAdmin) {
        if (token) {
          let time_data = await TimeLog.findOne({
            where: { user_id: req.user.id },
            order: [["createdAt", "DESC"]],
          });

          userData.currentStatus = 0;
          userData.socket_id = null;
          await userData.save();

          let logged_out_time = new Date();
          let [loginHours, loginMinutes] = time_data?.logged_in_time
            .split(":")
            .map(Number);
          let loginTimeInMinutes = loginHours * 60 + loginMinutes;
          let logoutHours = logged_out_time.getHours();
          let logoutMinutes = logged_out_time.getMinutes();
          let logoutTimeInMinutes = logoutHours * 60 + logoutMinutes;

          let duration = logoutTimeInMinutes - loginTimeInMinutes;
          let active_time =
            parseInt(parseInt(duration) - parseInt(time_data?.spare_time)) -
            parseInt(time_data?.idle_time);

          await time_data.update({
            logged_out_time: `${logoutHours}:${logoutMinutes}`,
            active_time,
          });
        }
      } else {
        userData.currentStatus = 0;
        userData.socket_id = null;
        await userData.save();
      }
      await token.destroy(); // token destroyed here

      return helper.sendResponse(
        res,
        variables.Success,
        1,
        {},
        "Logout Successfully"
      );
    } catch (error) {
      // Handle errors
      return helper.sendResponse(
        res,
        variables.BadRequest,
        0,
        null,
        error.message
      );
    }
  };

  //* Calculation expiry time for token
  calculateTime = () => {
    let oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 1 day = 24 hours, 60 minutes, 60 seconds, 1000 ms
    const now = new Date(); // Current date and time

    // Add 1 day to the current date
    const oneDayFromNow = new Date(
      now.getTime() + oneDayInMilliseconds
    ).toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" });
    return oneDayFromNow;
  };

  device = async (req, res) => {
    try {
      let id = req.query.id;
      let { deviceName, deviceId, memory } = req.body;
      let user = await User.findOne({ where: { id } });
      if (!user) {
        return helper.sendResponse(
          res,
          variables.BadRequest,
          0,
          null,
          "User not found!!!"
        );
      }
      if (!deviceName || !deviceId || !memory) {
        return helper.sendResponse(
          res,
          variables.BadRequest,
          0,
          null,
          "Invalid Data!!!"
        );
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
      io.to("Admin").emit("updatedSystemConfig", create);
      return helper.sendResponse(
        res,
        variables.Success,
        1,
        {},
        "system configration add successfully"
      );
    } catch (error) {
      return helper.sendResponse(
        res,
        variables.BadRequest,
        0,
        null,
        error.message
      );
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
      return helper.sendResponse(
        res,
        variables.Success,
        1,
        blockedWebsites,
        "Blocked websites fetched successfully!!"
      );
    } catch (error) {
      return helper.sendResponse(
        res,
        variables.BadRequest,
        0,
        null,
        "Error in blocked Website!!!"
      );
    }
  };

  absent = async (req, res) => {
    try {
      let month = req.query.month ? req.query.month : new Date().getMonth() + 1;
      let year = req.query.year ? req.query.year : new Date().getFullYear();

      if (!month || !year) {
        return helper.sendResponse(
          res,
          variables.ValidationError,
          0,
          null,
          "Invalid Data!!!"
        );
      }
      let web_query = `select (select count(id) from users where company_id=${req.user.company_id}) as total_employees,(select count(id) from users where company_id=${req.user.company_id})-((select count(id) from users where company_id=${req.user.company_id}) -count(DISTINCT user_id)) as total_persent_employees,(select count(id) from users where company_id=${req.user.company_id}) -count(DISTINCT user_id) as total_absent_employees,date from timelogs where company_id=${req.user.company_id} and month(date)=${month} and year(date)=${year} group by date`;
      let Absent_data = await Model.query(web_query, {
        type: QueryTypes.SELECT,
      });
      return helper.sendResponse(
        res,
        variables.Success,
        1,
        Absent_data,
        "Absent Calender Data fetched successfully!!"
      );
    } catch (error) {
      return helper.sendResponse(
        res,
        variables.BadRequest,
        0,
        null,
        error.message
      );
    }
  };

  markAsRead = async (req, res) => {
    try {
      let data = await Notification.findAll({ where: { is_read: 0 } });
      if (!data || data.length == 0) {
        return helper.sendResponse(
          res,
          variables.Success,
          1,
          {},
          "No unread notifications found."
        );
      }
      await Notification.update({ is_read: 1 }, { where: { is_read: 0 } });
      io.to("Admin").emit("newNotification", { notificationCount: 0 });
      return helper.sendResponse(
        res,
        variables.Success,
        1,
        {},
        "Notification Data cleared successfully"
      );
    } catch (error) {
      return helper.sendResponse(
        res,
        variables.BadRequest,
        0,
        null,
        error.message
      );
    }
  };

  notification_page = async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const page = parseInt(req.query.page) || 1;
      const offset = (page - 1) * limit;
      const whereCondition = {};
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
        return helper.sendResponse(
          res,
          variables.Success,
          1,
          {},
          "No notifications found."
        );
      }

      return helper.sendResponse(
        res,
        variables.Success,
        1,
        data,
        "Notification Data fetched successfully"
      );
    } catch (error) {
      return helper.sendResponse(
        res,
        variables.BadRequest,
        0,
        null,
        error.message
      );
    }
  };

  advanced_setting = async (req, res) => {
    try {
      let { screen_capture, broswer_capture, app_capture } = req.body;
      if (
        ![0, 1].includes(screen_capture) ||
        ![0, 1].includes(broswer_capture) ||
        ![0, 1].includes(app_capture)
      ) {
        return helper.sendResponse(
          res,
          variables.BadRequest,
          0,
          null,
          "Invalid Data"
        );
      }

      let data = await company.findOne({ where: { id: req.user.company_id } });
      if (!data) {
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          {},
          "company not found!!"
        );
      }
      data.screen_capture = screen_capture;
      data.broswer_capture = broswer_capture;
      data.app_capture = app_capture;
      data.save();
      return helper.sendResponse(
        res,
        variables.Success,
        0,
        {},
        "Advanced setting update successfully!"
      );
    } catch (error) {
      return helper.sendResponse(
        res,
        variables.BadRequest,
        0,
        null,
        error.message
      );
    }
  };
}

export default authController;
