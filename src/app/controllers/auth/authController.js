import authValidation from "../../../utils/validations/authValidation.js";
import sequelize from "../../../database/queries/dbConnection.js";
import User from "../../../database/models/userModel.js";
import { createUserSetting } from "../../../database/models/userSettingModel.js";
import jwtService from "../../../utils/services/jwtService.js";
import accessToken, {
  createAccessToken,
} from "../../../database/models/accessTokenModel.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import TimeLog from "../../../database/models/TimeLog.js";
import { getShiftData } from "../../../utils/validations/socketValidation.js";
import bcrypt from "bcrypt";


class authController extends jwtService {
  register = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const requestData = req.body;

      // Validating request body
      const validationResult = await authValidation.registerValid(
        requestData,
        res
      );

      // Check if the user already exists
      const existingUser = await User.findOne({
        where: { email: requestData.email },
        transaction: dbTransaction,
      });

      if (existingUser) {
        if (existingUser.email === email) {
          throw new Error("Email already in use");
        }
        if (existingUser.status) {
          throw new Error("This account has been deactivated");
        }
      }

      // Create and save the new user
      const user = await User.create(requestData, {
        transaction: dbTransaction,
      });

      // Create user settings
      await createUserSetting(user.id, dbTransaction);

      // Generate JWT token
      const token = this.generateToken(user.id.toString(), user.isAdmin, "1d");

      // Save token to the database
      const expireTime = this.calculateTime();
      await createAccessToken(
        user.id,
        user.isAdmin,
        token,
        expireTime,
        dbTransaction
      );

      await dbTransaction.commit();
      return helper.sendResponse(
        res,
        variables.Success,
        1,
        { token: token },
        "Register Successfully"
      );
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      console.log(error.message);
      return helper.sendResponse(
        res,
        variables.BadRequest,
        0,
        null,
        error.message
      );
    }
  };

  login = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const requestData = req.body;

      // Validate request body using Joi
      const validationResult = await authValidation.loginValid(
        requestData,
        res
      );

      let email = requestData.email;
      let password = requestData.password;

      // Find the user and check if they are deactivated
      const user = await User.findOne({ where: { email: email } });

      let compare_pwd = await bcrypt.compare(password,user.password);
      
      if (!compare_pwd) {
        return helper.sendResponse(
          res,
          variables.Unauthorized,
          0,
          null,
          "Invalid Credentials"
        );
      }

      // Check if the user is deactivated
      if (!user.status) {
        return helper.sendResponse(
          res,
          variables.Forbidden,
          0,
          null,
          "Your Account has beem De-Activated. Contact Support"
        );
      }

      // Generate JWT token
      const token = this.generateToken(user.id.toString(), user.isAdmin, "1d");

      // Save token to the database
      const expireTime = this.calculateTime();
      await createAccessToken(
        user.id,
        user.isAdmin,
        token,
        expireTime,
        dbTransaction
      );

      let shift_Data = await getShiftData(user.teamId);
      user.current_status = 1;
      user.save();

      // Create Time Log
      let date = new Date();
      let currentHours = date.getHours();
      let currentMinutes = date.getMinutes();
      let [shiftHours, shiftMinutes] = shift_Data.start_time
        .split(":")
        .map(Number);

      // Compare shift start time with the current time
      if (
        currentHours > shiftHours ||
        (currentHours == shiftHours && currentMinutes > shiftMinutes)
      ) {
        let shiftTimeInMinutes = shiftHours * 60 + shiftMinutes;
        let currentTimeInMinutes = currentHours * 60 + currentMinutes;

        let timeDifference = currentTimeInMinutes - shiftTimeInMinutes;
        let diffHours = Math.floor(timeDifference / 60);
        let diffMinutes = timeDifference % 60;

        await TimeLog.create({
          user_id: user.id,
          shift_id: shift_Data.id,
          logged_in_time: `${currentHours}:${currentMinutes}`,
          late_coming_duration: `${diffHours}:${diffMinutes}`,
          late_coming: 1,
        });
      } else {
        await TimeLog.create({
          user_id: user.id,
          shift_id: shift_Data.id,
          logged_in_time: `${currentHours}:${currentMinutes}`,
          late_coming_duration: "00:00",
        });
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

  logout = async (req, res) => {
    try {
      let userData = await User.findOne({ where: { id: req.user.id } });
      let token = await accessToken.findOne({ where: { userId: req.user.id } });

      if (token) {
        let shift_Data = await getShiftData(req.user.teamId);
        let time_data = await TimeLog.findOne({
          where: { user_id: req.user.id },
          order: [["createdAt", "DESC"]],
        });

        userData.current_status = 0;
        userData.socket_id = null;
        await userData.save();

        // Create Time Log for disconnect
        let date = new Date();
        let currentHours = date.getHours();
        let currentMinutes = date.getMinutes();
        let [shiftEndHours, shiftEndMinutes] = shift_Data.end_time
          .split(":")
          .map(Number);

        let shiftEndInMinutes = shiftEndHours * 60 + shiftEndMinutes;
        let currentTimeInMinutes = currentHours * 60 + currentMinutes;

        if (currentTimeInMinutes < shiftEndInMinutes) {
          let remainingMinutes = shiftEndInMinutes - currentTimeInMinutes;
          let remainingHours = Math.floor(remainingMinutes / 60);
          let remainingMinutesMod = remainingMinutes % 60;
          await time_data.update({
            user_id: req.user.id,
            shift_id: shift_Data.id,
            logged_out_time: `${currentHours}:${currentMinutes}`,
            early_going_duration: `${remainingHours}:${remainingMinutesMod}`,
            early_going: 1,
          });
        } else {
          await time_data.update({
            user_id: req.user.id,
            shift_id: shift_Data.id,
            logged_out_time: `${currentHours}:${currentMinutes}`,
            early_going_duration: "00:00",
          });
        }

      }
      await token.destroy();

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

  calculateTime = () => {
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 1 day = 24 hours, 60 minutes, 60 seconds, 1000 ms
    const now = new Date(); // Current date and time

    // Add 1 day to the current date
    const oneDayFromNow = new Date(
      now.getTime() + oneDayInMilliseconds
    ).toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" });
    return oneDayFromNow;
  };
}

export default authController;
