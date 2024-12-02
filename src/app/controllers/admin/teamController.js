import team from "../../../database/models/teamModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";

class teamController {
  getAllTeam = async (req, res) => {
    try {
      const alldata = await team.findAll();
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
        { data:alldata },
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

  addTeam = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name, departmentId, shiftId } = req.body;
      if (!name)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Name is Required!"
        );
      if (!departmentId)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Department Id is Required!"
        );
      if (!shiftId)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Shift Id is Required!"
        );

      const existingTeam = await team.findOne({
        where: { name, departmentId, shiftId },
        transaction: dbTransaction,
      });
      if (existingTeam)
        return helper.sendResponse(
          res,
          variables.ValidationError,
          null,
          "Team Already Exists!"
        );

      // Create and save the new user
      const addNewTeam = await team.create(
        { name, departmentId, shiftId },
        { transaction: dbTransaction }
      );
      await dbTransaction.commit();
      return helper.sendResponse(
        res,
        variables.Success,
        null,
        "Team Added Successfully!"
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

  updateTeam = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name, departmentId, shiftId, newTeamName, newDepartId, newShiftId } = req.body;
      if (!name)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Name is Required!"
        );
      if (!departmentId)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Department Id is Required!"
        );
      if (!shiftId)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Shift Id is Required!"
        );

      const existingReportManager = await team.findOne({
        where: { name, departmentId, shiftId },
        transaction: dbTransaction,
      });
      if (!existingReportManager)
        return helper.sendResponse(
          res,
          variables.BadRequest,
          null,
          "Team does not exists"
        );

      const updateData = {};
      if (newTeamName) updateData.name = newTeamName;
      if (newDepartId) updateData.departmentId = newDepartId;
      if (newShiftId) updateData.shiftId = newShiftId;

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "No Updating values provided to update"
        );
      }

      // Perform the update operation
      const [updatedRows] = await team.update(updateData, {
        where: { name, departmentId, shiftId },
        transaction: dbTransaction,
      });

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return helper.sendResponse(
          res,
          variables.Success,
          null,
          "Tea, Updated Successfully"
        );
      } else {
        await dbTransaction.rollback();
        return helper.sendResponse(
          res,
          variables.UnknownError,
          null,
          "Unable to update the team"
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

  deleteTeam = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name, departmentId, shiftId } = req.body;
      if (!name)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Name is Required!"
        );
      if (!departmentId)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Department Id is Required!"
        );
      if (!shiftId)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Shift Id is Required!"
        );

      const existingTeam = await team.findOne({
        where: { name, departmentId, shiftId },
        transaction: dbTransaction,
      });
      if (!existingTeam)
        return helper.sendResponse(
          res,
          variables.ValidationError,
          null,
          "Team does not exists!"
        );

      // Create and save the new user
      const deleteTeam = await team.destroy({
        where: { name, departmentId, shiftId },
        transaction: dbTransaction,
      });

      if (deleteTeam) {
        await dbTransaction.commit();
        return helper.sendResponse(
          res,
          variables.Success,
          null,
          "Team deleted Successfully!"
        );
      } else {
        await dbTransaction.rollback();
        return helper.sendResponse(
          res,
          variables.UnknownError,
          null,
          "Unable to delete the Team!"
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
}

export default teamController;
