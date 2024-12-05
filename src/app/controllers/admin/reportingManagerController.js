import reportingManager from "../../../database/models/reportingManagerModel.js";
import team from "../../../database/models/teamModel.js";
import User from "../../../database/models/userModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";

class reportingManagerController {
  getAllReportManager = async (req, res) => {
    try {
      const allData = await reportingManager.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      });
      if (!allData) return helper.failed(res, variables.NotFound, "Data not Found");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", allData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getReportManagerDropdown = async (req, res) => {
    try {
      const allData = await reportingManager.findAll({
        where: {status: true},
        attributes: { exclude: ['createdAt', 'updatedAt', 'status'] }
      });
      if (!allData) return helper.failed(res, variables.NotFound, "Data not Found");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", allData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getSpecificReportManager = async (req, res) => {
    try {
      const requestData = req.body;
      
      const specificData = await reportingManager.findOne({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        where: requestData,
      });
      if (!specificData) return helper.failed(res, variables.NotFound, "Data not Found");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", specificData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  addReportManager = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { userId, teamId } = req.body;

      if (!userId || !teamId) {
        const missingField = !userId ? "User Id" : "Team Id";
        return helper.failed(res, variables.NotFound,`${missingField} is Required!`);
      }

      const userExists = await User.findOne({ where: { id: userId } });
      const teamExists = await team.findOne({ where: { id: teamId } });

      if (!userExists) return helper.failed(res, variables.NotFound, "User does not exists in system!");
      if (!teamExists) return helper.failed(res, variables.NotFound, "Team does not exists in system!");

      const existingReportManager = await reportingManager.findOne({
        where: { userId, teamId },
        transaction: dbTransaction,
      });
      if (existingReportManager) return helper.failed(res, variables.ValidationError, "Report Manager Already Exists in our system");

      // Create and save the new user
      const addNewReportManager = await reportingManager.create({ userId, teamId }, { transaction: dbTransaction });
      await dbTransaction.commit();
      return helper.success(res, variables.Created, "Reporting Manager Added Successfully!");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  updateReportManager = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id, ...updateFields } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is Required!");

      const existingReportManager = await reportingManager.findOne({
        where: { id: id },
        transaction: dbTransaction,
      });
      if (!existingReportManager) return helper.failed(res, variables.NotFound, "Reporting Manager does not exists");

      const [updatedRows] = await reportingManager.update(updateFields, {
        where: { id: id },
        transaction: dbTransaction,
        individualHooks: true,
      });

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Reporting Manager updated successfully!");
      } else {
        await dbTransaction.rollback();
        return helper.failed(res, variables.BadRequest, "Unable to update reporting manager!");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  deleteReportManager = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is Required!");

      const existingReportManager = await reportingManager.findOne({
        where: { id: id },
        transaction: dbTransaction,
      });
      if (!existingReportManager) return helper.failed(res, variables.ValidationError, "Report Manager does not exists");

      // Create and save the new user
      const deleteRole = await reportingManager.destroy({
        where: { id: id },
        transaction: dbTransaction,
      });

      if (deleteRole) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Report Manager deleted Successfully!");
      } else {
        await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to delete reporting Manager!");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default reportingManagerController;
