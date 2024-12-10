import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";
import { Model, Op } from "sequelize";
import rolePermission from "../../../database/models/rolePermissionModel.js";
import role from "../../../database/models/roleModel.js";

class rolePermissionController {
  getAllRolePermissions = async (req, res) => {
    try {
      let { searchParam, limit, page } = req.query;
      // let permissionSearchable = ["modules"];
      // let roleSearchable = ["name"];

      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      // let permissionWhere = await helper.searchCondition(searchParam, permissionSearchable);
      // let roleWhere = await helper.searchCondition(searchParam, roleSearchable);

      const alldata = await rolePermission.findAndCountAll({
        // where: permissionWhere,
        where: {company_id: req.user.company_id},
        attributes: { exclude: ["createdAt", "updatedAt"] },
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
        include: [
          {
            model: role,
            // where: roleWhere,
            as: "role",
            attributes: ["name"],
          },
        ],
      });
      if (!alldata || alldata.length === 0) return helper.failed(res, variables.NotFound, "No Data is available!");

      // Restructure the data to match the desired response
      const transformedData = alldata.rows.reduce((acc, item) => {
        const { id, modules, permissions, role, roleId } = item;

        // Ensure role and role.name exist
        const roleName = role?.name;
        if (!roleName) {
          // Skip if role or role.name is not available
          console.warn(`Role name is missing for module ${modules}`);
          return acc;
        }

        let existingModule = acc.find((data) => data.modules === modules);

            if (!existingModule) {
                existingModule = {
                    id,
                    modules,
                    roleDetails: []
                };
                acc.push(existingModule);
            }

            // existingModule.roleDetails[`roleName`] = roleName;
            // existingModule.roleDetails[`permissions`] = permissions;
            let i = 0;
          //   [roleName].forEach((name) => {
          //     existingModule.roleDetails[name] = {
          //         roleName: name,
          //         permissions: permissions
          //     };
          // });
          existingModule.roleDetails.push({
            roleName: roleName,
            permissions: permissions
        });

            return acc;

      }, []);

      return helper.success(res, variables.Success, "All Data Fetched Successfully!", transformedData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getSpecificRolePermissions = async (roleId, moduleName) => {
    try {
      const roleModuledata = await rolePermission.findOne({
        where: { roleId: roleId, modules: moduleName, company_id: req.user.company_id },
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (!roleModuledata) return helper.failed(res, variables.NotFound, "No Data is available!");

      return roleModuledata;
      // return helper.success(res, variables.Success, "All Data Fetched Successfully!", roleModuledata);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  addRolePermissions = async (module, roleId, company_id, transaction) => {
    try {
      const permissionData = {
        roleId,
        modules: module.name,
        company_id: company_id,
        permissions: {
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
      const { roleName, moduleName, permissions } = req.body;
      if (!roleName) return helper.failed(res, variables.NotFound, "Role Name is required!");
      if (!moduleName) return helper.failed(res, variables.NotFound, "Module name is required!");
      if (!permissions) return helper.failed(res, variables.NotFound, "Permissions are required!");

      // Validate permissions object
      if (typeof permissions !== "object" || permissions === null || Array.isArray(permissions)) {
        return helper.failed(res, variables.BadRequest, "Permissions must be a valid object.");
      }

      // Define the required keys
      const requiredKeys = ["GET", "POST", "PUT", "DELETE"];

      // Check if all required keys are present and their values are either true or false
      for (const key of requiredKeys) {
        if (!(key in permissions)) {
          return helper.failed(res, variables.BadRequest, `Permissions must include this Exact key: ${key}`);
        }
        if (typeof permissions[key] !== "boolean") {
          return helper.failed(res, variables.BadRequest, `The value for ${key} in permissions must be true or false.`);
        }
      }

      // Ensure each key in `permissions` has a value of `true` or `false`
      for (const [key, value] of Object.entries(permissions)) {
        if (value !== true && value !== false) {
          return helper.failed(res, variables.BadRequest, `Invalid value for permission "${key}". Only 'true' or 'false' are allowed.`);
        }
      }

      const existRole = await role.findOne({
        where: { name: roleName, company_id: req.user.company_id },
        attributes: ["id"],
        transaction: dbTransaction,
      });
      if (!existRole) return helper.failed(res, variables.ValidationError, "Role Name Does not exists in Roles!");

      console.log(existRole.id);

      // Checking whether the role id exists in system or not
      const existingRolePermission = await rolePermission.findOne({
        where: { roleId: existRole.id, modules: moduleName, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingRolePermission) return helper.failed(res, variables.ValidationError, "Role Permission does not exists!");

      // when there is actually something to update
      const [updatedRows] = await rolePermission.update(
        {
          permissions: permissions,
        },
        {
          where: { roleId: existRole.id, modules: moduleName, company_id: req.user.company_id },
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
}

export default rolePermissionController;
