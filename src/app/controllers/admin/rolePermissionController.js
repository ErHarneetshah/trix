import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";
import { Model, Op } from "sequelize";
import rolePermission from "../../../database/models/rolePermissionModel.js";

class rolePermissionController {
  getAllRolePermissions = async (req, res) => {
    try {
      const alldata = await rolePermission.findAll({
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (!alldata) return helper.failed(res, variables.NotFound, "No Data is available!");

      return helper.success(res, variables.Success, "All Data Fetched Successfully!", alldata);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getSpecificRolePermissions = async (roleId, moduleName) => {
    try {
      console.log(roleId);
      const roleModuledata = await rolePermission.findOne({
        where:{roleId: roleId, modules: moduleName},
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (!roleModuledata) return helper.failed(res, variables.NotFound, "No Data is available!");

      return roleModuledata;
      // return helper.success(res, variables.Success, "All Data Fetched Successfully!", roleModuledata);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  addRolePermissions = async (module, roleId, transaction) => {
    try {
      const permissionData = {
        roleId,
        modules: module.name,
        permissions:{
          POST: false,
          GET: false,
          PUT: false,
          DELETE: false,
        },
      };
      console.log(permissionData);
  
      await rolePermission.create(permissionData, { transaction });
      return true;
    } catch (error) {
      console.error("Error adding role permissions:", error);
      throw new Error("Error adding role permissions");
    }
  };
  

  updateRolePermission = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { roleId, moduleName, permissions } = req.body;
      if (!roleId) return helper.failed(res, variables.NotFound, "Role Id is required!");
      if (!moduleName) return helper.failed(res, variables.NotFound, "Module name is required!");
      if (!permissions) return helper.failed(res, variables.NotFound, "Permissions are required!");

      // Checking whether the role id exists in system or not
      const existingRolePermission = await rolePermission.findOne({
        where: { roleId: roleId, modules:moduleName },
        transaction: dbTransaction,
      });
      if (!existingRolePermission) return helper.failed(res, variables.ValidationError, "Role Permission does not exists!");

      // when there is actually something to update
      const [updatedRows] = await rolePermission.update(
        {
          permissions: permissions,
        },
        {
          where: { roleId: roleId, modules: moduleName },
          transaction: dbTransaction,
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

export default rolePermissionController;
