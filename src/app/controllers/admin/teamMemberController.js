import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import User from "../../../database/models/userModel.js";
import teamsValidationSchema from "../../../utils/validations/teamsValidation.js";
import department from "../../../database/models/departmentModel.js";
import designation from "../../../database/models/designationModel.js";
import role from "../../../database/models/roleModel.js";
import team from "../../../database/models/teamModel.js";
import { Op } from "sequelize";
import H from "../../../utils/Mail.js";
import bcrypt from "bcrypt";

class teamMemberController {
  getAllTeamMembers = async (req, res) => {
    try {
      // ___________---------- Search, Limit, Pagination ----------_______________
      let { searchParam, limit, page } = req.query;
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      let searchable = ["fullname", "email", "mobile", "country", "$department.name$", "$designation.name$", "$role.name$", "$team.name$"];
      let where = await helper.searchCondition(searchParam, searchable);
      where.isAdmin = 0;
      where.company_id = req.user.company_id;
      // ___________-----------------------------------------------_______________

      const alldata = await User.findAndCountAll({
        where: where,
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
        attributes: {
          exclude: ["password", "isAdmin", "workstationId", "createdAt", "updatedAt", "status"],
        },
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

      if (!alldata) return helper.failed(res, variables.NotFound, "No Data is available!");
      return helper.success(res, variables.Success, "All Data fetched Successfully!", alldata);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getSpecificTeamMembers = async (req, res) => {
    try {
      let { id } = req.query;

      const alldata = await User.findOne({
        where: {id: id, company_id: req.user.company_id},
        attributes: {
          exclude: ["password", "isAdmin", "createdAt", "updatedAt", "status"],
        },
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

      if (!alldata) return helper.failed(res, variables.NotFound, "No Data is available!");
      return helper.success(res, variables.Success, "All Data fetched Successfully!", alldata);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };


  addTeamMembers = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const requestData = req.body;

      // Validating request body
      const validationResult = await teamsValidationSchema.teamMemberValid(requestData, res);
      if (!validationResult.status) return helper.failed(res, variables.Unauthorized, validationResult.message);

      // Check if the user already exists
      const existingUser = await User.findOne({
        where: { email: requestData.email, company_id: req.user.company_id },
        transaction: dbTransaction,
      });

      if (existingUser) {
        return helper.failed(res, variables.Unauthorized, "User already exists with this mail!");
      }

      const plainTextPassword = await helper.generatePass();
      const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

      requestData.password = hashedPassword;
      requestData.screen_capture_time = 60;
      requestData.app_capture_time = 60;
      requestData.broswer_capture_time = 60;
      requestData.company_id = req.user.company_id;

      const teamMember = await User.create(requestData, {
        transaction: dbTransaction,
      });

      if (teamMember) {
        const textMessage = `Hello ${teamMember.fullname},\n\nYour account has been created successfully!\n\nHere are your login details:\n\nUsername: ${teamMember.fullname}\nEmail: ${teamMember.email}\nPassword: ${plainTextPassword}\n\nPlease log in to the application with these credentials.\n\nBest regards`;

        const subject = "Emonitrix-Your Credentials";
        const sendmail = await H.sendM(requestData.email, subject, textMessage);

        if (!sendmail.success) {
          // If email fails, rollback the transaction
          await dbTransaction.rollback();
          return helper.failed(res, variables.BadRequest, sendmail.message);
        }
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Team Member Added Successfully", {
          note: "This response is just for testing purposes for now",
          requestData: requestData,
          addedMember: teamMember,
        });
      } else {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unknow Error Occured While creating User Setting");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  updateTeamMembers = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const {id, ...updateFields } = req.body;
      if (!id || isNaN(id)) return helper.failed(res, variables.ValidationError, "Id is required and in numbers");
      const existingTeamMember = await User.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });

      if (!existingTeamMember) return helper.failed(res, variables.BadRequest, "User does not exists in your company data");
      // if (existingTeamMember.isAdmin) return helper.failed(res, variables.Unauthorized, "You are not authorized to made this change");

      // Remove the 'password' field if it exists in updateFields
      if (updateFields.hasOwnProperty("password")) {
        delete updateFields.password;
      }

      if (updateFields.email) {
        const existingTeamMemberWithEmail = await User.findOne({
          where: { email: updateFields.email },
          transaction: dbTransaction,
        });

        if (existingTeamMemberWithEmail) return helper.failed(res, variables.BadRequest, "Email is already used in system");
      }

      // Perform the update operation
      const [updatedRows] = await User.update(updateFields, {
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
        individualHooks: true,
      });

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "User Updated Successfully");
      } else {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to update the shift");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  updateSettings = async (req, res) => {
    try {
      let {id, screen_capture_time, broswer_capture_time, app_capture_time, screen_capture, broswer_capture, app_capture } = req.body;

      if (!id || isNaN(id)) {
        return helper.failed(res, variables.ValidationError, "ID is Required and in numbers");
      }

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
      const u = await User.findOne({ where: { id: id } });
      if (!u) {
        return helper.sendResponse(res, variables.NotFound, 0, null, "user not found");
      }

      await u.update(
        {
          screen_capture_time,
          broswer_capture_time,
          app_capture_time,
          screen_capture,
          broswer_capture,
          app_capture,
        },
        { where: { id: u?.id } }
      );
      return helper.sendResponse(res, variables.Success, 1, {}, "Settings Updated Successfully");
    } catch (error) {
      console.error("Error updating settings:", error.message);
      return helper.failed(res, variables.Failure, "Failed to update settings");
    }
  };

  getTeamlist = async (req, res) => {
    try {
      let data = await User.findAndCountAll({
        where: {
          [Op.or]: [{ departmentId: req.user.departmentId }, { teamId: req.user.teamId }],
          company_id: req.user.company_id,
        },
        attributes: ["id", "fullname"],
        include: [
          {
            model: designation,
            as: "designation",
            attributes: ["name"],
          },
        ],
      });
      return helper.sendResponse(res, variables.Success, 1, data, "Team List Fetched Successfully");
    } catch (error) {
      console.error("Error getTeamMember:", error.message);
      return helper.failed(res, variables.Failure, "Failed to getTeamMember");
    }
  };
}

export default teamMemberController;
