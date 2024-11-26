import responseUtils from "../../../utils/common/responseUtils.js";
import authValidationSchema from "../../validations/authValidationSchema.js";
import sequelize from "../../../database/queries/db_connection.js";
import User from "../../../database/models/userModel.js";
import userSetting from "../../../database/models/userSettingModel.js";
import jwtService from "../../../utils/services/jwtService.js";

class authController extends jwtService {
  register = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const {
        name,
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
        name,
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
        return responseUtils.errorResponse(res, error.details[0].message, 400);
      }

      // Check if the total number of users has reached 6
      // const totalUsersCount = await User.countDocuments();

      // if (totalUsersCount >= 6) {
      //   return responseUtils.errorResponse(
      //     c,
      //     "The maximum number of users (5) has been reached",
      //     400
      //   );
      // }

      // Check if the user already exists, either active or deactivated
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        if (existingUser.email === email) {
          return responseUtils.errorResponse(res, "Email already in use", 400);
        }
        if (existingUser.username === username) {
          return responseUtils.errorResponse(
            res,
            "Username already in use",
            400
          );
        }
        if (existingUser.status) {
          return responseUtils.errorResponse(
            res,
            "This account has been deactivated",
            400
          );
        }
      }

      // if (departmentId) {
      //   department = department.toLowerCase(); // Convert to lowercase
      // }

      // Find the department by name
      // const departmentDoc = await Department.findOne({ name: department });
      // if (!departmentDoc) {
      //   return responseUtils.errorResponse(res, "Department not found", 400);
      // }

      // Create and save the new user
      const user = new User({
        name,
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
      });
      await user.save();

      // Set default user settings
      const defaultUserSettings = new userSetting({
        userId: user.id,
        screenshot_time: 300,
        app_history_time: 300,
        browser_history_time: 300,
        status: 1,
      });
      await defaultUserSettings.save();

      // Generate JWT token
      const token = this.generateToken(user.id.toString(), user.isAdmin);
      // adminController.updateUsers(); // Call to update users for the admin panel

      // Send success response with token and user details
      await dbTransaction.commit();
      return responseUtils.successResponse(res, { token }, 201);
    } catch (error) {
      await dbTransaction.rollback();
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

      // Send success response with token and user details
      await dbTransaction.commit();
      return responseUtils.successResponse(res, token, 200);
    } catch (error) {
      await dbTransaction.rollback();
      return responseUtils.errorResponse(res, error.message, 400);
    }
  };
}

export default authController;
