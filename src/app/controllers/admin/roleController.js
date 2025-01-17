import role from "../../../database/models/roleModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";
import app_modules from "../../../database/models/moduleModel.js";
import { Op } from "sequelize";
import rolePermissionController from "./rolePermissionController.js";
import rolePermission from "../../../database/models/rolePermissionModel.js";
import User from "../../../database/models/userModel.js";

class roleController {
  getAllRole = async (req, res) => {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "Role", routeMethod, req.user.company_id);
    if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________

    try {
      // ___________---------- Search, Limit, Pagination ----------_______________
      let { searchParam, limit, page } = req.query;
      let searchable = ["name", "status"];
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      let where = await helper.searchCondition(searchParam, searchable);
      where.company_id = req.user.company_id;
      // ___________----------------------------------------------________________

      const allData = await role.findAndCountAll({
        where: where,
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (!allData) return helper.failed(res, variables.NotFound, "Data Not Found");

      return helper.success(res, variables.Success, "All Data Fetched Successfully!", allData);
    } catch (error) {
      //helper.logger(res, "Role Controller -> getAllRole", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getRoleDropdown = async (req, res) => {
    try {
      const allData = await role.findAll({
        where: { company_id: req.user.company_id },
        attributes: ["id", "company_id", "name"],
      });
      if (!allData) return helper.failed(res, variables.NotFound, "Data Not Found");

      return helper.success(res, variables.Success, "All Data Fetched Successfully!", allData);
    } catch (error) {
      //helper.logger(res, "Role Controller -> getRoleDropdown", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getSpecificRole = async (req, res) => {
    try {
      const { id } = req.body;
      if (!id || isNaN(id)) return helper.failed(res, variables.NotFound, "Id is required");

      const roleData = await role.findOne({
        where: { id: id, company_id: req.user.company_id },
        attributes: { exclude: ["createdAt", "updatedAt", "status"] },
      });
      if (!roleData) return helper.failed(res, variables.NotFound, "Role Data Not Found in company data");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", roleData);
    } catch (error) {
      //helper.logger(res, "Role Controller -> getSpecificRole", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  addRole = async (req, res) => {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "Role", routeMethod, req.user.company_id);
    if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________

    const dbTransaction = await sequelize.transaction();
    const permissionInstance = new rolePermissionController();
    try {
      const { name } = req.body;
      if (!name || typeof name !== "string") return helper.failed(res, variables.NotFound, "Name is required!");

      const existingRole = await role.findOne({
        where: { name: name, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (existingRole) return helper.failed(res, variables.ValidationError, "Role Already Exists!");

      // Create and save the new user
      const routeMethod = req.method;
      const addNewRole = await role.create({ name: name, company_id: req.user.company_id }, { transaction: dbTransaction });
      if (!addNewRole) {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.failed(res, variables.InternalServerError, "Unable to create role!");
      }

      const permissionModules = await app_modules.findAll({
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      for (const module of permissionModules) {
        await permissionInstance.addRolePermissions(module, addNewRole.id, routeMethod, req.user.company_id, dbTransaction);
      }

      await dbTransaction.commit();
      return helper.success(res, variables.Created, "Role Added Successfully!");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      //helper.logger(res, "Role Controller -> addRole", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  updateRole = async (req, res) => {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "Role", routeMethod, req.user.company_id);
    if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________

    const dbTransaction = await sequelize.transaction();
    try {
      const { id, name } = req.body;
      if (!id || isNaN(id)) return helper.failed(res, variables.NotFound, "Id is required and in numbers!");
      if (!name || typeof name !== "string") return helper.failed(res, variables.NotFound, "Name is required to update");

      //* Checking whether the role id exists in system or not
      const existingRole = await role.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingRole) return helper.failed(res, variables.ValidationError, "Role does not exists!");

      //* Checking whether the role name exists in system or not excluding the id we passed to update for
      const existingRoleWithName = await role.findOne({
        where: {
          name: name,
          company_id: req.user.company_id,
          id: { [Op.ne]: id },
        },
        transaction: dbTransaction,
      });
      if (existingRoleWithName) {
        return helper.failed(res, variables.ValidationError, "Role name already exists in different record!");
      }

      await role.update(
        {
          name: name,
        },
        {
          where: { id: id, company_id: req.user.company_id },
          transaction: dbTransaction,
        }
      );

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "Role Updated Successfully!");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      //helper.logger(res, "Role Controller -> updateRole", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  deleteRole = async (req, res) => {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "Role", routeMethod, req.user.company_id);
    if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________

    const dbTransaction = await sequelize.transaction();
    try {
      const { id } = req.body;
      if (!id || isNaN(id)) return helper.failed(res, variables.NotFound, "Id is Required and in numbers!");

      const existingRole = await role.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingRole) return helper.failed(res, variables.ValidationError, "Role does not exists!");

      const isUsedInUsers = await User.findOne({ where: { roleId: id } });
      if (isUsedInUsers) {
        return helper.failed(res, variables.BadRequest, "Role cannot be deleted because it is in use by other records.");
      }

      // Create and save the new user
      const deleteRole = await role.destroy({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });

      const deleteRolePermission = await rolePermission.destroy({
        where: { roleId: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });

      if (deleteRolePermission) {
        await dbTransaction.commit();
        return helper.success(res, variables.Created, "Role and Role Permissions deleted successfully");
      } else {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to delete the role");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      //helper.logger(res, "Role Controller -> deleteRole", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default roleController;
