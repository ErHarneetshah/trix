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
import company from "../../../database/models/company.js";

class teamMemberController {
  getAllTeamMembers = async (req, res) => {
    try {
      let { searchParam, limit, page } = req.query;
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;

      let where = {};
      let search = [];

      let searchable = ["fullname", "email", "mobile", "country", "$department.name$", "$designation.name$", "$role.name$", "$team.name$"];

      if (searchParam) {
        //searchable filter
        searchable.forEach((key) => {
          search.push({
            [key]: {
              [Op.substring]: searchParam,
            },
          });
        });

        where = {
          [Op.or]: search,
        };
      }

      where.isAdmin = 0;
      where.company_id = req.user.company_id;

      const alldata = await User.findAndCountAll({
        where: where,
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
        attributes: {
          exclude: ["password", "isAdmin", "workstationId", "createdAt", "updatedAt", "status"],
        }, // Exclude fields
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

      // Check if the user already exists
      const existingUser = await User.findOne({
        where: { email: requestData.email, company_id: req.user.company_id },
        transaction: dbTransaction,
      });

      if (existingUser) {
        return helper.failed(res, variables.Unauthorized, "User already exists with this mail!");
      }

      const password = "$2b$10$moBYrpFMk0DJemIgdUqlgO4LXj5nUj0FK1zzV7GpEEmqh2yhcShVK";
      // if (!password) return helper.failed(res, variables.UnknownError, "User already exists with this mail!");

      requestData.password = password;
      // Create and save the new user
      requestData.screenshot_time = 60;
      requestData.app_history_time = 60;
      requestData.browser_history_time = 60;
      requestData.company_id = req.user.company_id;

      const teamMember = await User.create(requestData, {
        transaction: dbTransaction,
      });

      // Create user settings
      // const userSetting = await createUserSetting(teamMember.id, dbTransaction, res);

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
      // console.log(error.message);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  updateTeamMembers = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id, ...updateFields } = req.body;
      const existingTeamMember = await User.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });

      if (!existingTeamMember) return helper.failed(res, variables.BadRequest, "User does not exists in your company data");
      if (existingTeamMember.isAdmin) return helper.failed(res, variables.Unauthorized, "You are not authorized to made this change");

      // Check if the status updation request value is in 0 or 1 only >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      // if (updateFields.status !== 0 && updateFields.status !== 1) {
      //   return helper.failed(res, variables.ValidationError, "Status must be either 0 or 1");
      // }

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

      if (!id) {
        return helper.failed(res, variables.ValidationError, "ID is Required");
      }

      if (!Number.isInteger(screen_capture_time) || !Number.isInteger(broswer_capture_time) || !Number.isInteger(app_capture_time)) {
        return helper.failed(res, variables.BadRequest, "Invalid Data: Only integer values are allowed");
      }
  
      const u = await User.findOne({ where: { id } });
      if (!u) {
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          "user not found"
        );
      }
  
      // u.screen_capture_time = screen_capture_time;
      // u.broswer_capture_time = broswer_capture_time;
      // u.app_capture_time = app_capture_time;
      // await u.save();
      
      await u.update({screen_capture_time,broswer_capture_time,app_capture_time},{where:{id:u?.id}});
      return helper.sendResponse(
        res,
        variables.Success,
        1,
        {},
        "Settings Updated Successfully",
      );
    } catch (error) {
      console.error("Error updating settings:", error.message);
      return helper.failed(res, variables.Failure, "Failed to update settings");
    }
  };
}

export default teamMemberController;
