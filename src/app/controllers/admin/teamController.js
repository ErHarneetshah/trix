import team from "../../../database/models/teamModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import teamsValidationSchema from "../../../utils/validations/teamsValidation.js";
import variables from "../../config/variableConfig.js";

class teamController {
  getAllTeam = async (req, res) => {
    try {
      const alldata = await team.findAll();
      if (!alldata) return helper.failed(res, variables.NotFound, "No Data is available!");

      return helper.success(res, variables.Success, "All Data fetched Successfully!", alldata);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, "All Data fetched Successfully!");
    }
  };

  addTeam = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const requestData = req.body;

      await teamsValidationSchema.teamsValid(requestData, res);

      const existingTeam = await team.findOne({
        where: {
          name: requestData.name,
          departmentId: requestData.departmentId,
          shiftId: requestData.shiftId,
        },
        transaction: dbTransaction,
      });

      if (existingTeam) return helper.failed(res, variables.ValidationError, "Team Already Exists!");

      // Create and save the new user
      const addNewTeam = await team.create(requestData, { transaction: dbTransaction });
      await dbTransaction.commit();
      return helper.success(res, variables.Created, "Team Added Successfully!");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  updateTeam = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id, ...updateFields } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is Required!");

      const existingReportManager = await team.findOne({
        where: { id: id },
        transaction: dbTransaction,
      });
      if (!existingReportManager) return helper.failed(res, variables.BadRequest, "Team does not exists");

      const [updatedRows] = await team.update(updateFields, {
        where: { id: id },
        transaction: dbTransaction,
        individualHooks: true,
      });

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Team Updated Successfully");
      } else {
        await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to update the team");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  deleteTeam = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is Required!");

      const existingTeam = await team.findOne({
        where: { id: id },
        transaction: dbTransaction,
      });
      if (!existingTeam) return helper.success(res, variables.ValidationError, "Team does not exists!");

      // Create and save the new user
      const deleteTeam = await team.destroy({
        where: { id: id },
        transaction: dbTransaction,
      });

      if (deleteTeam) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Team deleted Successfully!");
      } else {
        await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to delete the Team!");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default teamController;
