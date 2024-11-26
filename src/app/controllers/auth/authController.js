// import { User } from "../models/userModel";
// import { Department } from "../models/departmentModel";
// import { generateToken } from "../utils/jwtUtils";
import responseUtils from "../../../utils/common/responseUtils.js";
import authValidationSchema from "../../validations/authValidationSchema.js";
// import { UserSettings } from "../models/userSettingsModel";
// import { adminController } from "../sockets/adminSocket";

class authController {
  register = async (req, res) => {
    try {
      let {
        email,
        password,
        username,
        department,
        designation,
        phoneNumber,
        deviceId,
        deviceName,
        country,
      } = req.body;

      console.log(email, password, username);
      
      // Validate request body using Joi
      const { error } = authValidationSchema.authSchema.validate({
        email,
        password,
        username,
        department,
        designation,
        phoneNumber,
        deviceId,
        deviceName,
        country,
      });
      if (error) {
        return responseUtils.errorResponse(res, error.details[0].message, 400);
      }

      // Check if the total number of users has reached 6
      const totalUsersCount = await User.countDocuments();

      if (totalUsersCount >= 6) {
        return responseUtils.errorResponse(
          c,
          "The maximum number of users (5) has been reached",
          400
        );
      }

      // Check if the user already exists, either active or deactivated
      const existingUser = await User.findOne({
        $or: [{ userId }, { email }, { username }],
      });

      if (existingUser) {
        if (existingUser.userId === userId) {
          return responseUtils.errorResponse(res, "UserId already in use", 400);
        }
        if (existingUser.email === email) {
          return responseUtils.errorResponse(res, "Email already in use", 400);
        }
        if (existingUser.username === username) {
          return responseUtils.errorResponse(res, "Username already in use", 400);
        }
        if (existingUser.isDeactivated) {
          return responseUtils.errorResponse(
            res,
            "This account has been deactivated",
            400
          );
        }
      }

      if (department) {
        department = department.toLowerCase(); // Convert to lowercase
      }

      // Find the department by name
      const departmentDoc = await Department.findOne({ name: department });
      if (!departmentDoc) {
        return responseUtils.errorResponse(res, "Department not found", 400);
      }

      // Create and save the new user
      const user = new User({
        userId,
        email,
        password,
        username,
        department: departmentDoc._id,
        designation,
        phoneNumber,
        deviceId,
        deviceName,
        country,
      });
      await user.save();

      // Set default user settings
      const defaultUserSettings = new UserSettings({
        user: user._id,
        screenshotTime: 300,
        appHistoryTime: 300,
        browsingHistoryTime: 300,
      });
      await defaultUserSettings.save();

      // Exclude sensitive information like password, _id, __v from the response
      const { password: _, _id, __v, ...userDetails } = user.toObject();

      // Generate JWT token
      const token = generateToken(user.userId.toString(), user.isAdmin);
      adminController.updateUsers(); // Call to update users for the admin panel

      // Send success response with token and user details
      return responseUtils.successResponse(
        c,
        { token, user: userDetails },
        201
      );
    } catch (error) {
      return responseUtils.errorResponse(res, "Department not found", 400);
    }
  };

  login = async () => {
    const { email, password } = await c.req.json().catch((e) => {
      return responseUtils.errorResponse(res, "Invalid request body", 400);
    });

    // Validate request body using Joi
    const { error } = userLoginSchema.validate({ email, password });
    if (error) {
      return responseUtils.errorResponse(res, error.details[0].message, 400);
    }

    // Find the user and check if they are deactivated
    const user = await User.findOne({ email }).populate("department");
    if (!user || !(await user.comparePassword(password))) {
      return responseUtils.errorResponse(res, "Invalid credentials", 401);
    }

    // Check if the user is deactivated
    if (user.isDeactivated) {
      return responseUtils.errorResponse(
        res,
        "Your account has been deactivated. Contact support.",
        403
      );
    }

    // Generate JWT token
    const token = generateToken(user.userId.toString(), user.isAdmin);

    // Exclude sensitive information like password, _id, __v from the response
    const { password: _, _id, __v, ...userWithoutPassword } = user.toObject();

    // Send success response with token and user details
    return responseUtils.successResponse(res, {
      token,
      user: userWithoutPassword,
    });
  };
}

export default authController;
