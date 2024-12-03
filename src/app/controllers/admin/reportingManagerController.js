import reportingManager from "../../../database/models/reportingManagerModel.js";
import team from "../../../database/models/teamModel.js";
import User from "../../../database/models/userModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";

class reportingManagerController {
  getAllReportManager = async (req, res) => {
    try {
      const allData = await reportingManager.findAll();
      if (!allData)
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          error.message
        );

      return helper.sendResponse(
        res,
        variables.Success,
        1,
        { data: allData },
        "Data Fetched Succesfully"
      );
    } catch (error) {
      return helper.sendResponse(
        res,
        variables.BadRequest,
        0,
        null,
        error.message
      );
    }
  };

  addReportManager = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { userId, teamId } = req.body;

      if (!userId)
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          "User Id is Required!"
        );
      if (!teamId)
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          "Team Id is Required!"
        );

      const userExists = await User.findOne({ where: { id: userId } });
      const teamExists = await team.findOne({ where: { id: teamId } });

      if (!userExists)
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          "User does not exists in system!"
        );
      if (!teamExists)
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          "Team does not exists in system!"
        );

      
      const existingReportManager = await reportingManager.findOne({
        where: { userId, teamId },
        transaction: dbTransaction,
      });
      if (existingReportManager)
        return helper.sendResponse(
          res,
          variables.ValidationError,
          0,
          null,
          "Report Manager Already Exists in our system"
        );

      // Create and save the new user
      const addNewReportManager = await reportingManager.create(
        { userId, teamId },
        { transaction: dbTransaction }
      );
      await dbTransaction.commit();
      return helper.sendResponse(
        res,
        variables.Success,
        1,
        null,
        "Reporting Manager Added Successfully!"
      );
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.sendResponse(
        res,
        variables.BadRequest,
        0,
        null,
        error.message
      );
    }
  };

  updateReportManager = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { userId, teamId, newUserId, newTeamId } = req.body;
      if (!userId)
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          "User Id is Required!"
        );
      if (!teamId)
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          "Team Id is Required!"
        );

      
      const existingReportManager = await reportingManager.findOne({
        where: { userId, teamId },
        transaction: dbTransaction,
      });
      if (!existingReportManager)
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          "Reporting Manager does not exists"
        );

      const updateData = {};
      if (newUserId) updateData.userId = newUserId;
      if (newTeamId) updateData.teamId = newTeamId;

      //   Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          error.message
        );
      }

      // Perform the update operation
      const [updatedRows] = await reportingManager.update(updateData, {
        where: { userId, teamId },
        transaction: dbTransaction,
      });

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return helper.sendResponse(
          res,
          variables.Success,
          1,
          null,
          "Reporting Manager updated successfully!"
        );
      } else {
        await dbTransaction.rollback();
        return helper.sendResponse(
          res,
          variables.BadRequest,
          0,
          null,
          "Unable to update reporting manager!"
        );
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.sendResponse(
        res,
        variables.BadRequest,
        0,
        null,
        error.message
      );
    }
  };

  deleteReportManager = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { userId, teamId } = req.body;
      if (!userId)
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          "User Id is Required!"
        );
      if (!teamId)
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          "Team Id is Required!"
        );

      const existingReportManager = await reportingManager.findOne({
        where: { userId, teamId },
        transaction: dbTransaction,
      });
      if (!existingReportManager)
        return helper.sendResponse(
          res,
          variables.ValidationError,
          0,
          null,
          "Report Manager does not exists"
        );

      // Create and save the new user
      const deleteRole = await reportingManager.destroy({
        where: { userId, teamId },
        transaction: dbTransaction,
      });

      if (deleteRole) {
        await dbTransaction.commit();
        return helper.sendResponse(
          res,
          variables.Success,
          1,
          null,
          "Report Manager deleted Successfully!"
        );
      } else {
        await dbTransaction.rollback();
        return helper.sendResponse(
          res,
          variables.UnknownError,
          0,
          null,
          "Unable to delete reporting Manager!"
        );
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();

      return helper.sendResponse(
        res,
        variables.BadRequest,
        0,
        null,
        error.message
      );
    }
  };
}

export default reportingManagerController;
