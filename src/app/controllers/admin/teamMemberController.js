import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import User from "../../../database/models/userModel.js";
import teamsValidationSchema from "../../../utils/validations/teamsValidation.js";
import { createUserSetting } from "../../../database/models/userSettingModel.js";

class teamMemberController {
  getAllTeamMembers = async (req, res) => {
    try {
      const alldata = await User.findAll({
        where: { isAdmin: 0 },
        attributes: { exclude: ["password", "mobile", "country", "isAdmin", "workstationId", "createdAt", "updatedAt"] }, // Exclude the password field
      });
      if (!alldata) return helper.failed(res, variables.NotFound, "No Data is available!");

      return helper.success(res, variables.Success, "All Data fetched Successfully!", alldata);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, "All Data fetched Successfully!");
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
        where: { email: requestData.email },
        transaction: dbTransaction,
      });

      if (existingUser) {
        return helper.failed(res, variables.Unauthorized, "User already exists with this mail!");
      }

      const password = await helper.generatePass();
      if (!password) return helper.failed(res, variables.UnknownError, "User already exists with this mail!");
      requestData.password = password;
      console.log(requestData);
      // Create and save the new user
      const teamMember = await User.create(requestData, {
        transaction: dbTransaction,
      });

      // Create user settings
      const userSetting = await createUserSetting(teamMember.id, dbTransaction, res);

      if (userSetting) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Team Member Added Successfully", {note: "This response is just for testing purposes for now", requestData: requestData, addedMember: teamMember});
      } else {
        await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unknow Error Occured While creating User Setting");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      console.log(error.message);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  updateTeamMembers = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const requestData = req.body;

      const existingTeamMember = await User.findOne({
        where: { id: requestData.id },
        transaction: dbTransaction,
      });

      if (!existingTeamMember) return helper.failed(res, variables.BadRequest, "User does not exists");
      if (existingTeamMember.isAdmin) return helper.failed(res, variables.Unauthorized, "You are not authorized to made this change");
      const { id, ...updateFields } = requestData;

      // Perform the update operation
      const [updatedRows] = await User.update(updateFields, {
        where: { id: id },
        transaction: dbTransaction,
        individualHooks: true,
      });

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "User Updated Successfully");
      } else {
        await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to update the shift");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default teamMemberController;
