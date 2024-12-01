import authValidation from "../../../utils/validations/authValidation.js";
import sequelize from "../../../database/queries/dbConnection.js";
import User from "../../../database/models/userModel.js";
import { createUserSetting } from "../../../database/models/userSettingModel.js";
import jwtService from "../../../utils/services/jwtService.js";
import { createAccessToken } from "../../../database/models/accessTokenModel.js";
import { Op } from "sequelize";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";

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
        where: {
          [Op.or]: [{ email }, { username }],
        },
        transaction: dbTransaction,
      });

      if (existingUser) {
        if (existingUser.email === email) {
          throw new Error("Email already in use");
        }
        if (existingUser.username === username) {
          throw new Error("Username already in use");
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
        { AuthToken: token },
        "Register Successfully"
      );
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.sendResponse(
        res,
        variables.BadRequest,
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

      // Find the user and check if they are deactivated
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return helper.sendResponse(
          res,
          variables.Unauthorized,
          null,
          "Invalid Credentials"
        );
      }

      // Check if the user is deactivated
      if (!user.status) {
        return helper.sendResponse(
          res,
          variables.Forbidden,
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

      await dbTransaction.commit();
      return helper.sendResponse(
        res,
        variables.Success,
        { AuthToken: token },
        "Login Successfully"
      );
    } catch (error) {
      await dbTransaction.rollback();
      return helper.sendResponse(res, variables.BadRequest, null, error.message);
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
