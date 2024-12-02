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
        attributes: { exclude: ['password', 'mobile', 'country', 'isAdmin', 'workstationId', 'createdAt', 'updatedAt'] }, // Exclude the password field
      });
      ;
      if (!alldata)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "No Data is available!"
        );

      return helper.sendResponse(
        res,
        variables.Success,
        { data: alldata },
        "All Data fetched Successfully!"
      );
    } catch (error) {
      return helper.sendResponse(
        res,
        variables.BadRequest,
        null,
        "All Data fetched Successfully!"
      );
    }
  };



  addTeamMembers = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const requestData = req.body;

      // Validating request body
      const validationResult = await teamsValidationSchema.teamMemberValid(
        requestData,
        res
      );

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
      const token = this.generateToken(teamMember.id.toString(), teamMember.isAdmin, "1d");

      // Save token to the database
      const expireTime = this.calculateTime();
      await createAccessToken(
        teamMember.id,
        teamMember.isAdmin,
        token,
        expireTime,
        dbTransaction
      );

      await dbTransaction.commit();
      return helper.sendResponse(
        res,
        variables.Success,
        { token: token },
        "Team Member Added Successfully"
      );
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      console.log(error.message);
      return helper.sendResponse(
        res,
        variables.BadRequest,
        null,
        error.message
      );
    }
  };

  updateTeamMembers = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const requestData = req.body;

      const existingShift = await User.findOne({
        where: {name: name, start_time: start_time, end_time: end_time},
        transaction: dbTransaction,
      });

      if (!existingShift)
        return helper.sendResponse(
          res,
          variables.BadRequest,
          null,
          "Shift does not exists"
        );

      const updateData = {};
      if (newShiftName) updateData.name = newShiftName;
      if (newStart_time) updateData.start_time = newStart_time;
      if (newEnd_time) updateData.end_time = newEnd_time;
      if (newDays) updateData.days = newDays;

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "No Updating values provided to update"
        );
      }

      if (newStart_time && newEnd_time) {
        updateData.total_hours = await this.calTotalHr(
          newStart_time,
          newEnd_time
        );
      }

      console.log(updateData);
      // Perform the update operation
      const [updatedRows] = await User.update(updateData, {
        where: {name: name, start_time: start_time, end_time: end_time},
        transaction: dbTransaction,
      });

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return helper.sendResponse(
          res,
          variables.Success,
          null,
          "Shift Updated Successfully"
        );
      } else {
        await dbTransaction.rollback();
        return helper.sendResponse(
          res,
          variables.UnknownError,
          null,
          "Unable to update the shift"
        );
      }
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

  deleteTeamMembers = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name, start_time, end_time } = req.body;
      if (!name)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Name is Required!"
        );
      if (!start_time)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Start Time is Required!"
        );
      if (!end_time)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "End Time is Required!"
        );

      const existingShift = await User.findOne({
        where: {name: name, start_time: start_time, end_time: end_time},
        transaction: dbTransaction,
      });
      if (!existingShift)
        return helper.sendResponse(
          res,
          variables.ValidationError,
          null,
          "Shift does not exists!"
        );

      // Create and save the new user
      const deleteShift = await User.destroy({
        where: {name: name, start_time: start_time, end_time: end_time},
        transaction: dbTransaction,
      });

      if (deleteShift) {
        await dbTransaction.commit();
        return helper.sendResponse(
          res,
          variables.Success,
          null,
          "Shift deleted Successfully!"
        );
      } else {
        await dbTransaction.rollback();
        return helper.sendResponse(
          res,
          variables.UnknownError,
          null,
          "Unable to delete the Shift!"
        );
      }
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

  calTotalHr = async (start_time, end_time) => {
    let startTime = parseInt(start_time.split(":")[0], 10); // Extract the hour part: 18
    let endTime = parseInt(end_time.split(":")[0], 10); // Extract the hour part: 9

    let total_hours = endTime - startTime;
    return total_hours;
  };
}

export default teamMemberController;
