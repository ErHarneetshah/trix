import authValidation from "../../../utils/validations/authValidation.js";
import sequelize from "../../../database/queries/dbConnection.js";
import User from "../../../database/models/userModel.js";
import { createUserSetting } from "../../../database/models/userSettingModel.js";
import jwtService from "../../../utils/services/jwtService.js";
import { createAccessToken } from "../../../database/models/accessTokenModel.js";
import { Op } from "sequelize";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import bcrypt from "bcryptjs";

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

  login = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const requestData = req.body;

      //Validating request data
      await authValidation.loginValid(requestData, res);

      // Find the user and check if they are deactivated
      const user = await User.findOne({
        where: { email: requestData.email },
        transaction: dbTransaction,
      });

      // Password Matching
      if (!user) {
        if (await bcrypt.compare(requestData.password, user.password)) return helper.sendResponse(res, variables.Unauthorized, 0, null, "Invalid Credentials");
      }

      //Verifying Admin Account
      if (!user.isAdmin) {
        return helper.sendResponse(res, variables.Unauthorized, 0, null, "User is Not Admin!");
      }

      // Check if the user is deactivated
      if (!user.status) {
        return helper.sendResponse(res, variables.Forbidden, 0, null, "Your Account has beem De-Activated. Contact Support");
      }

      // Generate JWT token
      const token = this.generateToken(user.id.toString(), user.isAdmin, "1d");

      // Save token to the database
      const expireTime = this.calculateTime();
      await createAccessToken(user.id, user.isAdmin, token, expireTime, dbTransaction);

      await dbTransaction.commit();
      return helper.sendResponse(res, variables.Success, 1, { token: token }, "Login Successfully");
    } catch (error) {
      await dbTransaction.rollback();
      return helper.sendResponse(res, variables.BadRequest, 0, null, error.message);
    }
  };

  calculateTime = () => {
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + oneDayInMilliseconds).toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" });
    return oneDayFromNow;
  };
}

export default authController;
