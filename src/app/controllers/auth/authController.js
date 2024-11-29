import responseUtils from "../../../utils/common/responseUtils.js";
import authValidationSchema from "../../validations/authValidationSchema.js";
import sequelize from "../../../database/queries/dbConnection.js";
import User from "../../../database/models/userModel.js";
import userSetting from "../../../database/models/userSettingModel.js";
import jwtService from "../../../utils/services/jwtService.js";
import accessToken from "../../../database/models/accessTokenModel.js";
import appConfig from "../../config/appConfig.js";
import { Op } from "sequelize";

const jwtConfig = new appConfig().jwt_config;

class authController extends jwtService {
  register = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const {
        firstname,
        lastname,
        username,
        email,
        password,
        departmentId,
        designationId,
        roleId,
        workstationId,
        teamId,
        mobile,
        country,
        isAdmin,
        status,
      } = req.body;
  
      // Validate request body using Joi
      const { error } = authValidationSchema.registerSchema.validate({
        firstname,
        lastname,
        username,
        email,
        password,
        departmentId,
        designationId,
        roleId,
        mobile,
        country,
      });
      if (error) {
        throw new Error(error.details[0].message);
      }
  
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
      const user = await User.create(
        {
          firstname,
          lastname,
          username,
          email,
          password,
          departmentId,
          designationId,
          roleId,
          workstationId,
          teamId,
          mobile,
          country,
          isAdmin,
          status,
        },
        { transaction: dbTransaction } // Include transaction in model creation
      );
  
      await userSetting.create(
        {
          userId: user.id,
          screenshot_time: 300,
          app_history_time: 300,
          browser_history_time: 300,
          status: 1,
        },
        { transaction: dbTransaction }
      );
  
      // Generate JWT token
      const token = this.generateToken(user.id.toString(), user.isAdmin);

      // Save token to the database
      const expireTime = this.calculateTime();
      await accessToken.create(
        {
          userId: user.id,
          isUserAdmin: user.isAdmin,
          token,
          expiry_time: expireTime,
        },
        { transaction: dbTransaction }
      );

      await dbTransaction.commit();
  
      return responseUtils.successResponse(res, { token }, 201);
    } catch (error) {
      if (dbTransaction) {
        await dbTransaction.rollback();
      }
      return responseUtils.errorResponse(res, error.message, 400);
    }
  };
  

  login = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { email, password } = req.body;

      // Validate request body using Joi
      const { error } = authValidationSchema.loginSchema.validate({
        email,
        password,
      });
      if (error) {
        return responseUtils.errorResponse(res, error.details[0].message, 400);
      }

      // Find the user and check if they are deactivated
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return responseUtils.errorResponse(res, "Invalid credentials", 401);
      }

      // Check if the user is deactivated
      if (!user.status) {
        return responseUtils.errorResponse(
          res,
          "Your account has been deactivated. Contact support.",
          403
        );
      }

      // Generate JWT token
      const token = this.generateToken(user.id.toString(), user.isAdmin);

      // Save token to the database
      const expireTime = this.calculateTime();
      await accessToken.create(
        {
          userId: user.id,
          isUserAdmin: user.isAdmin,
          token,
          expiry_time: expireTime,
        },
        { transaction: dbTransaction }
      );

      // Send success response with token and user details
      await dbTransaction.commit();
      return responseUtils.successResponse(res, token, 200);
    } catch (error) {
      await dbTransaction.rollback();
      return responseUtils.errorResponse(res, error.message, 400);
    }
  };

  adminLogin = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { email, password } = req.body;

      // Validate request body using Joi
      const { error } = authValidationSchema.loginSchema.validate({
        email,
        password,
      });
      if (error) {
        return responseUtils.errorResponse(res, error.details[0].message, 400);
      }

      // Find the user and check if they are deactivated
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return responseUtils.errorResponse(res, "Invalid credentials", 401);
      }

      // Check if the user is admin or not
      if (!user.isAdmin) {
        return responseUtils.errorResponse(
          res,
          "You are not authorized for this!",
          401
        );
      }

      // Check if the user is deactivated
      if (!user.status) {
        return responseUtils.errorResponse(
          res,
          "Your account has been deactivated. Contact support.",
          403
        );
      }

      // Generate JWT token
      const token = this.generateToken(user.id.toString(), user.isAdmin);

      // Send success response with token and user details
      await dbTransaction.commit();
      return responseUtils.successResponse(res, token, 200);
    } catch (error) {
      await dbTransaction.rollback();
      return responseUtils.errorResponse(res, error.message, 400);
    }
  };

  calculateTime = () => {
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 1 day = 24 hours, 60 minutes, 60 seconds, 1000 ms
    const now = new Date(); // Current date and time

    // Add 1 day to the current date
    const oneDayFromNow = new Date(now.getTime() + oneDayInMilliseconds).toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' });

    return oneDayFromNow;
  };
}

export default authController;
