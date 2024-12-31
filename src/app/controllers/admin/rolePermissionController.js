import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";
import rolePermission from "../../../database/models/rolePermissionModel.js";
import role from "../../../database/models/roleModel.js";
import app_modules from "../../../database/models/moduleModel.js";

class rolePermissionController {
  getAllRolePermissions = async (req, res) => {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "permissions", routeMethod, req.user.company_id);
    if (!isApproved) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________

    try {
      const alldata = await rolePermission.findAndCountAll({
        where: { company_id: req.user.company_id },
        attributes: { exclude: ["createdAt", "updatedAt"] },
        order: [["id", "DESC"]],
        include: [
          {
            model: role,
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
          console.warn(`Role name is missing for module ${modules}`);
          return acc;
        }

        let existingModule = acc.find((data) => data.modules === modules);
        if (!existingModule) {
          existingModule = {
            id,
            modules,
            roleDetails: [],
          };
          acc.push(existingModule);
        }

        existingModule.roleDetails.push({
          roleName: roleName,
          permissions: permissions,
        });

        return acc;
      }, []);

      return helper.success(res, variables.Success, "All Data Fetched Successfully!", transformedData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getSpecificRolePermissions = async (roleId, moduleName, companyId) => {
    try {
      const roleModuleData = await rolePermission.findOne({
        where: { roleId: roleId, modules: moduleName, company_id: companyId },
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });

      if (!roleModuleData) {
        return {
          success: false,
          message: "Module Permission Not Available!",
          data: null,
        };
      }

      return {
        success: true,
        message: "Module permissions fetched successfully",
        data: roleModuleData,
      };
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  };

  addRolePermissions = async (module, roleId, routeMethod, company_id, transaction) => {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const isApproved = await helper.checkRolePermission(roleId, "permissions", routeMethod, company_id);
    if (!isApproved) throw new Error("Not Permitted for this request");
    // ___________-------- Role Permisisons Exists or not ---------________________

    try {
      if (isNaN(roleId)) throw new Error("Role Id must be in number");
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

      await rolePermission.create(permissionData, { transaction });
      return true;
    } catch (error) {
      console.error("Error adding role permissions:", error);
      throw new Error("Error adding role permissions");
    }
  };

  addSuperAdminPermissions = async (module, roleId, company_id, transaction) => {
    try {
      if (isNaN(roleId)) throw new Error("Role Id must be in number");
      const permissionData = {
        roleId,
        modules: module.name,
        company_id: company_id,
        permissions: {
          POST: true,
          GET: true,
          PUT: true,
          DELETE: true,
        },
      };

      await rolePermission.create(permissionData, { transaction });
      return true;
    } catch (error) {
      console.error("Error adding role permissions:", error);
      throw new Error("Error adding role permissions");
    }
  };

  // updateSingleRolePermission = async (req, res) => {
  //   const dbTransaction = await sequelize.transaction();
  //   try {
  //     const { roleName, moduleName, permissions } = req.body;
  //     if (!roleName || typeof roleName !== "string") return helper.failed(res, variables.NotFound, "Role Name is required!");
  //     if (!moduleName || typeof moduleName !== "string") return helper.failed(res, variables.NotFound, "Module name is required!");
  //     if (!permissions || typeof permissions == "undefined") return helper.failed(res, variables.NotFound, "Permissions are required!");

  //     if (typeof permissions !== "object" || permissions === null || Array.isArray(permissions)) {
  //       return helper.failed(res, variables.BadRequest, "Permissions must be a valid object.");
  //     }

  //     const requiredKeys = ["GET", "POST", "PUT", "DELETE"];

  //     for (const key of requiredKeys) {
  //       if (!(key in permissions)) {
  //         return helper.failed(res, variables.BadRequest, `Permissions must include this Exact key: ${key}`);
  //       }
  //       if (typeof permissions[key] !== "boolean") {
  //         return helper.failed(res, variables.BadRequest, `The value for ${key} in permissions must be true or false.`);
  //       }
  //     }

  //     for (const [key, value] of Object.entries(permissions)) {
  //       if (value !== true && value !== false) {
  //         return helper.failed(res, variables.BadRequest, `Invalid value for permission "${key}". Only 'true' or 'false' are allowed.`);
  //       }
  //     }

  //     const existRole = await role.findOne({
  //       where: { name: roleName, company_id: req.user.company_id },
  //       attributes: ["id"],
  //       transaction: dbTransaction,
  //     });
  //     if (!existRole) return helper.failed(res, variables.ValidationError, "Role Name Does not exists in Roles!");

  //     const existingRolePermission = await rolePermission.findOne({
  //       where: { roleId: existRole.id, modules: moduleName, company_id: req.user.company_id },
  //       transaction: dbTransaction,
  //     });
  //     if (!existingRolePermission) return helper.failed(res, variables.ValidationError, "Role Permission does not exists!");

  //     // when there is actually something to update
  //     const updated = await rolePermission.update(
  //       {
  //         permissions: permissions,
  //       },
  //       {
  //         where: { roleId: existRole.id, modules: moduleName, company_id: req.user.company_id },
  //         transaction: dbTransaction,
  //       }
  //     );

  //     if (updated) {
  //       await dbTransaction.commit();
  //       return helper.success(res, variables.Success, "Role permissions Updated Successfully!");
  //     } else {
  //       if (dbTransaction) await dbTransaction.rollback();
  //       return helper.failed(res, variables.UnknownError, "Unable to update the role permissions!");
  //     }
  //   } catch (error) {
  //     if (dbTransaction) await dbTransaction.rollback();
  //     return helper.failed(res, variables.BadRequest, error.message);
  //   }
  // };

  updateMultipleRolePermission = async (req, res) => {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "permissions", routeMethod, req.user.company_id);
    if (!isApproved) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________

    const dbTransaction = await sequelize.transaction();
    try {
      const { rolesModulesPermissions } = req.body;

      if (!rolesModulesPermissions || !Array.isArray(rolesModulesPermissions)) {
        return helper.failed(res, variables.NotFound, "Roles and their module permissions are required and must be an array!");
      }

      // Loop through each role's module permissions
      for (const roleModules of rolesModulesPermissions) {
        const { roleName, modulesPermissions } = roleModules;

        if (!roleName || typeof roleName !== "string") {
          return helper.failed(res, variables.NotFound, "Role Name is required!");
        }

        if (!modulesPermissions || !Array.isArray(modulesPermissions)) {
          return helper.failed(res, variables.NotFound, "Modules and Permissions are required and must be an array!");
        }

        // Validate each module's permissions
        for (const module of modulesPermissions) {
          const { moduleName, permissions } = module;

          if (!moduleName || typeof moduleName !== "string") {
            return helper.failed(res, variables.NotFound, "Module name is required!");
          }

          if (!permissions || typeof permissions == "undefined") {
            return helper.failed(res, variables.NotFound, "Permissions are required!");
          }

          if (typeof permissions !== "object" || permissions === null || Array.isArray(permissions)) {
            return helper.failed(res, variables.BadRequest, "Permissions must be a valid object.");
          }

          // Validate required permission keys and boolean values
          const requiredKeys = ["GET", "POST", "PUT", "DELETE"];
          for (const key of requiredKeys) {
            if (!(key in permissions)) {
              return helper.failed(res, variables.BadRequest, `Permissions must include the key: ${key}`);
            }
            if (typeof permissions[key] !== "boolean") {
              return helper.failed(res, variables.BadRequest, `The value for ${key} in permissions must be true or false.`);
            }
          }

          // Validate individual permission values
          for (const [key, value] of Object.entries(permissions)) {
            if (value !== true && value !== false) {
              return helper.failed(res, variables.BadRequest, `Invalid value for permission "${key}". Only 'true' or 'false' are allowed.`);
            }
          }
        }

        // Check if the role exists
        const existRole = await role.findOne({
          where: { name: roleName, company_id: req.user.company_id },
          attributes: ["id"],
          transaction: dbTransaction,
        });
        if (!existRole) return helper.failed(res, variables.ValidationError, `Role ${roleName} does not exist!`);

        // Loop through each module and update the permissions for the role
        for (const module of modulesPermissions) {
          const { moduleName, permissions } = module;

          const existingRolePermission = await rolePermission.findOne({
            where: { roleId: existRole.id, modules: moduleName, company_id: req.user.company_id },
            transaction: dbTransaction,
          });
          if (!existingRolePermission) {
            return helper.failed(res, variables.ValidationError, `Role Permission does not exist for module: ${moduleName}`);
          }

          await rolePermission.update(
            {
              permissions: permissions,
            },
            {
              where: { roleId: existRole.id, modules: moduleName, company_id: req.user.company_id },
              transaction: dbTransaction,
            }
          );
        }
      }

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "Role permissions updated successfully!");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  updateMultipleRolePermissionOnce = async (req, res) => {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "permissions", routeMethod, req.user.company_id);
    if (!isApproved) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________
    
    const dbTransaction = await sequelize.transaction();
    try {
      const { roleName, allTrue } = req.body;
      if (!roleName || typeof roleName !== "string") return helper.failed(res, variables.NotFound, "Role Name is required!");
      if (!allTrue || isNaN(allTrue)) return helper.failed(res, variables.NotFound, "Check is Required and in numbers!");

      if (!["0", "1"].includes(String(allTrue))) {
        return helper.failed(res, variables.ValidationError, "Invalid allTrue check. Only values 0 and 1 are allowed");
      }

      const moduleNames = await app_modules.findAll({
        attributes: ["name"],
      });

      const existRole = await role.findOne({
        where: { name: roleName, company_id: req.user.company_id },
        attributes: ["id"],
        transaction: dbTransaction,
      });
      if (!existRole) return helper.failed(res, variables.ValidationError, "Role Name Does not exists in Roles!");

      let updated;

      for (const moduleName of moduleNames) {
        const existingRolePermission = await rolePermission.findOne({
          where: {
            roleId: existRole.id,
            modules: moduleName.name,
            company_id: req.user.company_id,
          },
          transaction: dbTransaction,
        });

        if (!existingRolePermission) {
          return helper.failed(res, variables.ValidationError, `Role Permission does not exist for module ${moduleName.name}!`);
        }

        if (allTrue) {
          await rolePermission.update(
            {
              permissions: {
                POST: true,
                GET: true,
                PUT: true,
                DELETE: true,
              },
            },
            {
              where: { roleId: existRole.id, modules: moduleName.name, company_id: req.user.company_id },
              transaction: dbTransaction,
            }
          );
        } else {
          await rolePermission.update(
            {
              permissions: {
                POST: false,
                GET: false,
                PUT: false,
                DELETE: false,
              },
            },
            {
              where: { roleId: existRole.id, modules: moduleName.name, company_id: req.user.company_id },
              transaction: dbTransaction,
            }
          );
        }
      }

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "Role permissions Updated Successfully!");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default rolePermissionController;
