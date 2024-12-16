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

      const password = "$2b$10$moBYrpFMk0DJemIgdUqlgO4LXj5nUj0FK1zzV7GpEEmqh2yhcShVK"; // Test@123

      requestData.password = password;
      requestData.screenshot_time = 60;
      requestData.app_history_time = 60;
      requestData.browser_history_time = 60;
      requestData.company_id = req.user.company_id;

      const teamMember = await User.create(requestData, {
        transaction: dbTransaction,
      });

      if (teamMember) {
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
      const { id, ...updateFields } = req.body;
      if (!id || isNaN(id)) return helper.failed(res, variables.ValidationError, "Id is required and in numbers");
      const existingTeamMember = await User.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });

      if (!existingTeamMember) return helper.failed(res, variables.BadRequest, "User does not exists in your company data");
      if (existingTeamMember.isAdmin) return helper.failed(res, variables.Unauthorized, "You are not authorized to made this change");

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
      let id = req.query.id;
      let { screen_capture_time, broswer_capture_time, app_capture_time } = req.body;

      if (!id || isNaN(id)) {
        return helper.failed(res, variables.ValidationError, "ID is Required and in numbers");
      }

      if (!Number.isInteger(screen_capture_time) || !Number.isInteger(broswer_capture_time) || !Number.isInteger(app_capture_time)) {
        return helper.failed(res, variables.BadRequest, "Invalid Data: Only integer values are allowed");
      }

      const u = await User.findOne({ where: { id: id } });
      if (!u) {
        return helper.sendResponse(res, variables.NotFound, 0, null, "user not found");
      }

      await u.update({ screen_capture_time, broswer_capture_time, app_capture_time }, { where: { id: u?.id } });
      return helper.sendResponse(res, variables.Success, 1, {}, "Settings Updated Successfully");
    } catch (error) {
      console.error("Error updating settings:", error.message);
      return helper.failed(res, variables.Failure, "Failed to update settings");
    }
  };
}

export default teamMemberController;
