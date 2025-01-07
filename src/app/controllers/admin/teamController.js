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
      // ___________-------- Role Permisisons Exists or not ---------________________
      const routeMethod = req.method;
      const isApproved = await helper.checkRolePermission(req.user.roleId, "Team", routeMethod, req.user.company_id);
      if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
      // ___________-------- Role Permisisons Exists or not ---------________________

      // ___________---------- Search, Limit, Pagination ----------_______________
      let { searchParam, limit, page } = req.query;
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      let searchable = ["name", "$department.name$", "$shift.name$"];
      let where = await helper.searchCondition(searchParam, searchable);
      where.company_id = req.user.company_id;
      // ___________-----------------------------------------------_______________

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
            attributes: ["id", "name"],
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

  getTeamUserDropdown = async (req, res) => {
    try {
      let { id } = req.body;
      const alldata = await User.findAll({
        where: { status: true, company_id: req.user.company_id, teamId: id },
        attributes: ["id", "fullname"],
        include: [
          {
            model: team,
            as: "team",
            required: true,
            attributes: [],
          },
        ],
      });
      if (!alldata) return helper.failed(res, variables.NotFound, "No Data is available!");

      return helper.success(res, variables.Success, "All Data fetched Successfully!", alldata);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getTeamDeptDropdown = async (req, res) => {
    try {
      let { id } = req.query;
      if (!id || isNaN(id)) return helper.failed(res, variables.NotFound, "Id is Required and in numbers!");
      const alldata = await team.findAll({
        where: { status: true, company_id: req.user.company_id, departmentId: id },
        attributes: ["id", "name"],
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
      if (!requestData.id || isNaN(requestData.id)) return helper.failed(res, variables.NotFound, "Id is required and in numbers");

      requestData.company_id = req.user.company_id;

      const specificData = await team.findOne({
        attributes: { exclude: ["createdAt", "updatedAt"] },
        where: requestData,
        include: [
          {
            model: department,
            as: "department",
            attributes: ["name"],
          },
          {
            model: shift,
            as: "shift",
            attributes: ["id", "name"],
          },
        ],
      });
      if (!specificData) return helper.failed(res, variables.NotFound, `Team Not Found`);

      return helper.success(res, variables.Success, "Team details fetched successfully", specificData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  addTeam = async (req, res) => {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "Team", routeMethod, req.user.company_id);
    if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________

    const dbTransaction = await sequelize.transaction();
    try {
      const requestData = req.body;

      const validateTeam = await teamsValidationSchema.teamsValid(requestData, res);
      if (!validateTeam) return helper.failed(res, variables.ValidationError, validateTeam.message);

      const existingTeam = await team.findOne({
        where: {
          company_id: req.user.company_id,
          name: requestData.name,
          departmentId: requestData.departmentId,
          shiftId: requestData.shiftId,
        },
        transaction: dbTransaction,
      });

      const existingTeamWithSameName = await team.findOne({
        where: {
          company_id: req.user.company_id,
          name: requestData.name,
        },
        transaction: dbTransaction,
      });
      if (existingTeamWithSameName) return helper.failed(res, variables.ValidationError, "Team with same Name Already Exists!");

      const existingDept = await department.findOne({
        where: { id: requestData.departmentId, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingDept) return helper.failed(res, variables.ValidationError, "Department does not exists in company data");

      const existingShift = await shift.findOne({
        where: { id: requestData.shiftId, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingShift) return helper.failed(res, variables.ValidationError, "Shift does not exists in company data");

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
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "Team", routeMethod, req.user.company_id);
    if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________

    const dbTransaction = await sequelize.transaction();
    try {
      const { id, ...updateFields } = req.body;
      if (!id || isNaN(id)) return helper.failed(res, variables.NotFound, "Id is Required and in numbers!");

      //* Check if there is a dept already exists
      const existingTeam = await team.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingTeam) return helper.failed(res, variables.ValidationError, "Team does not exists!");

      //* Check if there is a dept with a name in a different id
      if (updateFields.name) {
        const existingTeamWithName = await team.findOne({
          where: {
            name: updateFields.name,
            company_id: req.user.company_id,
            id: { [Op.ne]: id },
          },
          transaction: dbTransaction,
        });
        if (existingTeamWithName) {
          return helper.failed(res, variables.ValidationError, "Team name already exists in different record!");
        }
      }

      if (updateFields.name && updateFields.departmentId && updateFields.shiftId) {
        const alreadySameTeam = await team.findOne({
          where: { id: id, name: updateFields.name, company_id: req.user.company_id, departmentId: updateFields.departmentId, shiftId: updateFields.shiftId },
          transaction: dbTransaction,
        });
        if (alreadySameTeam) return helper.success(res, variables.Success, "Team Re-Updated Successfully!");
      }

      if (updateFields.departmentId) {
        const existingDept = await department.findOne({
          where: { id: updateFields.departmentId, company_id: req.user.company_id },
          transaction: dbTransaction,
        });
        if (!existingDept) return helper.failed(res, variables.ValidationError, "Department does not exists in company data");
      }

      if (updateFields.shiftId) {
        const existingShift = await shift.findOne({
          where: { id: updateFields.shiftId, company_id: req.user.company_id },
          transaction: dbTransaction,
        });
        if (!existingShift) return helper.failed(res, variables.ValidationError, "Shift does not exists in company data");
      }

      await team.update(updateFields, {
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
        individualHooks: true,
      });

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "Team Updated Successfully");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  deleteTeam = async (req, res) => {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "Team", routeMethod, req.user.company_id);
    if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________

    const dbTransaction = await sequelize.transaction();
    try {
      const { id } = req.body;
      if (!id || isNaN(id)) return helper.failed(res, variables.NotFound, "Id is Required and in numbers!");

      const existingTeam = await team.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingTeam) return helper.failed(res, variables.ValidationError, "Team does not exists in company data!");

      const isUsedInUsers = await User.findOne({ where: { teamId: id } });
      if (isUsedInUsers) {
        return helper.failed(res, variables.BadRequest, "Team cannot be deleted because it's in use in other records.");
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
        if (dbTransaction) await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to delete the Team!");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default teamController;
