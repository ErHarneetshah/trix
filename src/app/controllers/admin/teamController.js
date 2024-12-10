import { Op } from "sequelize";
import department from "../../../database/models/departmentModel.js";
import shift from "../../../database/models/shiftModel.js";
import team from "../../../database/models/teamModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import teamsValidationSchema from "../../../utils/validations/teamsValidation.js";
import variables from "../../config/variableConfig.js";
import User from "../../../database/models/userModel.js";

class teamController {
  getAllTeam = async (req, res) => {
    try {
      let { searchParam, limit, page } = req.query;
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;

      let where = {};
      let search = [];

      let searchable = ["name", "$department.name$", "$shift.name$"];

      if (searchParam) {
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

      where.company_id = req.user.company_id;

      const alldata = await team.findAndCountAll({
        where: where,
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
        attributes: { exclude: ["createdAt", "updatedAt", "status"] },
        include: [
          {
            model: department,
            as: "department",
            attributes: ["name"],
          },
          {
            model: shift,
            as: "shift",
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

  getTeamDropdown = async (req, res) => {
    try {
      const alldata = await team.findAll({
        where: { status: true, company_id: req.user.company_id },
        attributes: { exclude: ["createdAt", "updatedAt", "status", "departmentId", "shiftId"] },
      });
      if (!alldata) return helper.failed(res, variables.NotFound, "No Data is available!");

      return helper.success(res, variables.Success, "All Data fetched Successfully!", alldata);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getSpecificTeam = async (req, res) => {
    try {
      const requestData = req.body;
      if (!requestData.departmentId) return helper.failed(res, variables.NotFound, "Department Id is required");

      requestData.company_id = req.user.company_id;

      const specificData = await team.findOne({
        attributes: { exclude: ["createdAt", "updatedAt"] },
        where: requestData,
      });
      if (!specificData) return helper.failed(res, variables.NotFound, `Data not Found of matching attributes `);

      return helper.success(res, variables.Success, "Data Fetched Succesfully", specificData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  addTeam = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const requestData = req.body;

      await teamsValidationSchema.teamsValid(requestData, res);

      const existingTeam = await team.findOne({
        where: {
          company_id: req.user.company_id,
          name: requestData.name,
          departmentId: requestData.departmentId,
          shiftId: requestData.shiftId,
        },
        transaction: dbTransaction,
      });

      const existingTeamWithSameParam = await team.findOne({
        where: {
          company_id: req.user.company_id,
          departmentId: requestData.departmentId,
          shiftId: requestData.shiftId,
        },
        transaction: dbTransaction,
      });
      if (existingTeamWithSameParam) return helper.failed(res, variables.ValidationError, "Team Already Exists under different name!");

      const existingTeamWithSameName = await team.findOne({
        where: {
          company_id: req.user.company_id,
          name: requestData.name,
        },
        transaction: dbTransaction,
      });
      if (existingTeamWithSameName) return helper.failed(res, variables.ValidationError, "Team with same Name Already Exists!");


      requestData.company_id = req.user.company_id;

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

      //* Check if there is a dept already exists
      const existingTeam = await team.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingTeam) return helper.failed(res, variables.ValidationError, "Team does not exists!");

      //* Check if there is a dept with a name in a different id
      const existingTeamWithName = await team.findOne({
        where: {
          name: updateFields.name,
          company_id: req.user.company_id,
          id: { [Op.ne]: id }, // Exclude the current record by id
        },
        transaction: dbTransaction,
      });
      if (existingTeamWithName) {
        return helper.failed(res, variables.ValidationError, "Team name already exists in different record!");
      }

      if (updateFields.departmentId && updateFields.shiftId) {
        const alreadySameTeam = await team.findOne({
          where: { id: id, name: updateFields.name, company_id: req.user.company_id, departmentId: updateFields.departmentId, shiftId: updateFields.shiftId },
          transaction: dbTransaction,
        });
        if (alreadySameTeam) return helper.success(res, variables.Success, "Team Re-Updated Successfully!");

        const existingTeamWithSameParam = await team.findOne({
          where: { company_id: req.user.company_id,departmentId: updateFields.departmentId, shiftId: updateFields.shiftId },
          transaction: dbTransaction,
        });
        if (existingTeamWithSameParam) return helper.success(res, variables.Success, "Team With Same Specs already exists!");
      }

      // Check if the status updation request value is in 0 or 1 only >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      // if (updateFields.status !== 0 && updateFields.status !== 1) {
      //   return helper.failed(res, variables.ValidationError, "Status must be either 0 or 1");
      // }

      const [updatedRows] = await team.update(updateFields, {
        where: { id: id, company_id: req.user.company_id },
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
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingTeam) return helper.success(res, variables.ValidationError, "Team does not exists!");

      const isUsedInUsers = await User.findOne({ where: { teamId: id } });
      if (isUsedInUsers) {
        return helper.failed(res, variables.Unauthorized, "Cannot Delete this Team as it is referred in other tables");
      }

      // Create and save the new user
      const deleteTeam = await team.destroy({
        where: { id: id, company_id: req.user.company_id },
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
