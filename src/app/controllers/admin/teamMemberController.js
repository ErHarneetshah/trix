import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import User from "../../../database/models/userModel.js";
import teamsValidationSchema from "../../../utils/validations/teamsValidation.js";

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

      console.log(requestData);
      return true;
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
      const teamMember = await User.create(requestData, {
        transaction: dbTransaction,
      });

      // Create user settings
      await createUserSetting(teamMember.id, dbTransaction);

      // Generate JWT token
      // const token = this.generateToken(teamMember.id.toString(), teamMember.isAdmin, "1d");

      // Save token to the database
      // const expireTime = this.calculateTime();
      // await createAccessToken(teamMember.id, teamMember.isAdmin, token, expireTime, dbTransaction);

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "Team Member Added Successfully");
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

      if (!existingTeamMember) return helper.failed(res, variables.BadRequest, "Shift does not exists");
      const { id, ...updateFields } = requestData;

      // Perform the update operation
      const [updatedRows] = await User.update(updateFields, {
        where: { id: id },
        transaction: dbTransaction,
        individualHooks: true,
      });

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Shift Updated Successfully");
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
