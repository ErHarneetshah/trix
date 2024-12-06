import role from "../../../database/models/roleModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";
import module from "../../../database/models/moduleModel.js";
import { Op } from "sequelize";
import rolePermissionController from "./rolePermissionController.js";

class roleController {
  getAllRole = async (req, res) => {
    try {
      let { searchParam, limit, page } = req.query;
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;

      let where = {};
      let search = [];

      let searchable = ["name", "status"];

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
      const allData = await role.findAndCountAll({
        where,
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (!allData) return helper.failed(res, variables.NotFound, "Data Not Found");

      return helper.success(res, variables.Success, "All Data Fetched Successfully!", allData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getRoleDropdown = async (req, res) => {
    try {
      let { searchParam, limit, page } = req.query;
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;

      let where = {};
      let search = [];

      let searchable = ["name"];

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
      const allData = await role.findAndCountAll({
        where,
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (!allData) return helper.failed(res, variables.NotFound, "Data Not Found");

      return helper.success(res, variables.Success, "All Data Fetched Successfully!", allData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getSpecificRole = async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is required");

      const roleData = await role.findOne({
        where: { id: id },
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (!roleData) return helper.failed(res, variables.NotFound, "Data Not Found");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", roleData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  addRole = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    const permissionInstance = new rolePermissionController();
    try {
      const { name } = req.body;
      if (!name) return helper.failed(res, variables.NotFound, "Name is required!");

      const existingRole = await role.findOne({
        where: { name: name },
        transaction: dbTransaction,
      });
      if (existingRole) return helper.failed(res, variables.ValidationError, "Role Already Exists!");

      // Create and save the new user
      const addNewRole = await role.create({ name }, { transaction: dbTransaction });

      const permissionModules = await module.findAll({
        attributes: { exclude: ["createdAt", "updatedAt"] },
      })
      for (const module of permissionModules) {
        await permissionInstance.addRolePermissions(module, addNewRole.id, dbTransaction);
      }

      await dbTransaction.commit();
      return helper.success(res, variables.Created, "Role Added Successfully!");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  updateRole = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id, name } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is required!");
      if (!name) return helper.failed(res, variables.NotFound, "No Updation value is present");

      //* Checking whether the role id exists in system or not
      const existingRole = await role.findOne({
        where: { id: id },
        transaction: dbTransaction,
      });
      if (!existingRole) return helper.failed(res, variables.ValidationError, "Role does not exists!");

      //* Checking whether the role name exists in system or not excluding the id we passed to update for
      const existingRoleWithName = await role.findOne({
        where: {
          name: name,
          id: { [Op.ne]: id }, // Exclude the current record by id
        },
        transaction: dbTransaction,
      });
      if (existingRoleWithName) {
        return helper.failed(res, variables.ValidationError, "Role name already exists in different record!");
      }

      //* if updating name for the role id is already the same value that exists in system with same id
      const alreadySameRole = await role.findOne({
        where: { id: id, name: name },
        transaction: dbTransaction,
      });
      if (alreadySameRole) return helper.success(res, variables.Success, "Role Re-Updated Successfully!");

      // Check if the status updation request value is in 0 or 1 only >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      // if (updateFields.status !== 0 && updateFields.status !== 1) {
      //   return helper.failed(res, variables.ValidationError, "Status must be either 0 or 1");
      // }

      // when there is actually something to update
      const [updatedRows] = await role.update(
        {
          name: name,
        },
        {
          where: { id: id },
          transaction: dbTransaction,
          // individualHooks: true,
        }
      );

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Role Updated Successfully!");
      } else {
        await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to update the role!");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  deleteRole = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is Required!");

      const existingRole = await role.findOne({
        where: { id: id },
        transaction: dbTransaction,
      });
      if (!existingRole) return helper.failed(res, variables.ValidationError, "Role does not exists!");

      // Create and save the new user
      const deleteRole = await role.destroy({
        where: { id: id },
        transaction: dbTransaction,
      });

      if (deleteRole) {
        await dbTransaction.commit();
        return helper.success(res, variables.Created, "Role deleted successfully");
      } else {
        await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to delete the role");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default roleController;
