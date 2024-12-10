import authValidation from "../../../utils/validations/authValidation.js";
import sequelize from "../../../database/queries/dbConnection.js";
import User from "../../../database/models/userModel.js";
import { createUserSetting } from "../../../database/models/userSettingModel.js";
import jwtService from "../../../utils/services/jwtService.js";
import accessToken, { createAccessToken } from "../../../database/models/accessTokenModel.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import TimeLog from "../../../database/models/TimeLog.js";
import { getShiftData } from "../../../utils/validations/socketValidation.js";
import bcrypt from "bcrypt";

class authController extends jwtService {
  // register = async (req, res) => {
  //   const dbTransaction = await sequelize.transaction();
  //   try {
  //     const requestData = req.body;

  //     // Validating request body
  //     const validationResult = await authValidation.registerValid(requestData, res);

  //     // Check if the user already exists
  //     const existingUser = await User.findOne({
  //       where: { email: requestData.email },
  //       transaction: dbTransaction,
  //     });

  //     if (existingUser) {
  //       return helper.sendResponse(res, variables.Unauthorized, 0, null, "User already exists with this mail!");
  //     }

  //     // Create and save the new user
  //     const user = await User.create(requestData, {
  //       transaction: dbTransaction,
  //     });

  //     // Create user settings
  //     const userSetting = await createUserSetting(teamMember.id, dbTransaction, res);

  //     if(!userSetting){
  //       await dbTransaction.rollback();
  //       return helper.failed(res, variables.UnknownError, "Unknow Error Occured While creating User Setting");
  //     }

  //     // Generate JWT token
  //     const token = this.generateToken(user.id.toString(), user.isAdmin, "1d");

  //     // Save token to the database
  //     const expireTime = this.calculateTime();
  //     await createAccessToken(user.id, user.isAdmin, token, expireTime, dbTransaction);

  //     await dbTransaction.commit();
  //     return helper.sendResponse(res, variables.Success, 1, { token: token }, "Register Successfully");
  //   } catch (error) {
  //     if (dbTransaction) await dbTransaction.rollback();
  //     console.log(error.message);
  //     return helper.sendResponse(res, variables.BadRequest, 0, null, error.message);
  //   }
  // };

  //* Previous Login Function Harneet ------------------------------------------------------------
  // login = async (req, res) => {
  //   const dbTransaction = await sequelize.transaction();
  //   try {
  //     const requestData = req.body;

  //     //Validating request data
  //     await authValidation.loginValid(requestData, res);

  //     // Find the user and check if they are deactivated
  //     const existsUser = await User.findOne({
  //       where: { email: requestData.email },
  //       transaction: dbTransaction,
  //     });

  //     // Password Matching if user exists
  //     if (existsUser) {
  //       if (await bcrypt.compare(requestData.password, user.password)) return helper.sendResponse(res, variables.Unauthorized, 0, null, "Invalid Credentials");
  //     }else{
  //       return helper.sendResponse(res, variables.NotFound, 0, null, "Email Does not exists in system");
  //     }

  //     // Create and save the new user
  //     const user = await User.create(requestData, {
  //       transaction: dbTransaction,
  //     });

  //     // Create user settings
  //     await createUserSetting(user.id, dbTransaction);

  //     // Generate JWT token
  //     const token = this.generateToken(user.id.toString(), user.isAdmin, "1d");

  //     // Save token to the database
  //     const expireTime = this.calculateTime();
  //     await createAccessToken(
  //       user.id,
  //       user.isAdmin,
  //       token,
  //       expireTime,
  //       dbTransaction
  //     );

  //     await dbTransaction.commit();
  //     return helper.sendResponse(
  //       res,
  //       variables.Success,
  //       1,
  //       { token: token },
  //       "Register Successfully"
  //     );
  //   } catch (error) {
  //     if (dbTransaction) await dbTransaction.rollback();
  //     console.log(error.message);
  //     return helper.sendResponse(
  //       res,
  //       variables.BadRequest,
  //       0,
  //       null,
  //       error.message
  //     );
  //   }
  // };

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
      
      let user = await User.findOne({ where: { email: email } }); // checking whether user exists
      if(!user){
        return helper.sendResponse(res, variables.Unauthorized, 0, null, "Invalid Credentials");
      }
      
      let comparePwd = await bcrypt.compare(password, user.password); // comparing passwords
      if (!comparePwd) {
        return helper.sendResponse(res, variables.Unauthorized, 0, null, "Incorrect Password!!!");
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

        // setting Admin attendence (currentStatus) to present(1)
        user.currentStatus = 1;
        user.save();
      } else {
        // Ensure the user isn't logging in after shift end time
        let now = new Date();
        let currentHours = now.getHours();
        let currentMinutes = now.getMinutes();

        let shiftData = await getShiftData(user.teamId); //getting shift details of user

        let [shiftHours, shiftMinutes] = shiftData.start_time.split(":").map(Number);
        let [endHours, endMinutes] = shiftData.end_time.split(":").map(Number);
        
        if (currentHours > endHours && (currentHours === endHours && currentMinutes > endMinutes)) {
          return helper.sendResponse(res, variables.Forbidden, 0, {}, "Your shift is over. You cannot log in at this time.");
        }

        // Generating Token for user
        token = this.generateToken(user.id.toString(), user.isAdmin, user.company_id, "1d");
        let expireTime = this.calculateTime();
        await createAccessToken(user.id, user.isAdmin, user.company_id, token, expireTime, dbTransaction);

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
          timeLog.spare_time = parseInt(timeLog.spare_time) + parseInt(spareMinutes);
          timeLog.logged_out_time = null;
          timeLog.save();
          user.currentStatus = 1;
          user.save();
        } else {
          if (currentHours > shiftHours || (currentHours === shiftHours && currentMinutes > shiftMinutes)) {
            lateMinutes = (currentHours - shiftHours) * 60 + (currentMinutes - shiftMinutes);
            lateComing = 1;
            lateComingDuration = `${Math.floor(lateMinutes / 60)}:${lateMinutes % 60}`;
          }
          const [lateHours, lateMins] = lateComingDuration.split(":").map(Number);
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
      return helper.sendResponse(res, variables.Success, 1, { token: token, user: user }, "Login Successfully");
    } catch (error) {
      console.log(error);

      await dbTransaction.rollback();
      return helper.sendResponse(res, variables.BadRequest, 0, null, error.message);
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
          let [loginHours, loginMinutes] = time_data?.logged_in_time.split(":").map(Number);
          let loginTimeInMinutes = loginHours * 60 + loginMinutes;
          let logoutHours = logged_out_time.getHours();
          let logoutMinutes = logged_out_time.getMinutes();
          let logoutTimeInMinutes = logoutHours * 60 + logoutMinutes;

          let duration = logoutTimeInMinutes - loginTimeInMinutes;
          let active_time = parseInt(parseInt(duration) - parseInt(time_data?.spare_time)) - parseInt(time_data?.idle_time);

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

      return helper.sendResponse(res, variables.Success, 1, {}, "Logout Successfully");
    } catch (error) {
      // Handle errors
      return helper.sendResponse(res, variables.BadRequest, 0, null, error.message);
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
}

export default authController;
