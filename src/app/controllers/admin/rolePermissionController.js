import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";
import rolePermission from "../../../database/models/rolePermissionModel.js";
import role from "../../../database/models/roleModel.js";
import app_modules from "../../../database/models/moduleModel.js";
import company from "../../../database/models/company.js";

class rolePermissionController {
  getAllRolePermissions = async (req, res) => {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "Role Permissions", routeMethod, req.user.company_id);
    if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
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
      const transformedData = alldata.rows.reduce((accumulator, currentItem) => {
        const { id, modules, permissions, role } = currentItem;

        // Ensure role and role.name exist
        const roleName = role?.name;
        if (!roleName) {
          console.warn(`Role name is missing for module ${modules}`);
          return accumulator;
        }

        let existingModule = accumulator.find((data) => data.modules === modules);
        if (!existingModule) {
          existingModule = {
            id,
            modules,
            roleDetails: [],
          };
          accumulator.push(existingModule);
        }

        existingModule.roleDetails.push({
          roleName: roleName,
          permissions: permissions,
        });

        return accumulator;
      }, []);

      return helper.success(res, variables.Success, "All Data Fetched Successfully!", transformedData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getSpecificRolePermissions = async (roleId, moduleName, routeMethod, companyId) => {
    try {
      // // ___________-------- Role Permisisons Exists or not ---------________________
      // const isApproved = await helper.checkRolePermission(roleId, "Role Permissions", routeMethod, companyId);
      // if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
      // // ___________-------- Role Permisisons Exists or not ---------________________

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
    const isApproved = await helper.checkRolePermission(roleId, "Role Permissions", routeMethod, company_id);
    if (!isApproved.success) throw new Error("Not Permitted for this request");
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

  updateMultipleRolePermission = async (req, res) => {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "Role Permissions", routeMethod, req.user.company_id);
    if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
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

  resetRolePermissions = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      // Step 1: Fetch company_id and roleId from role_permissions
      const existingPermissions = await role.findAll({
        attributes: ["company_id", "id"],
      });

      // Step 2: Store existing permissions
      const permissionsBackup = existingPermissions.map((permission) => ({
        company_id: permission.company_id,
        roleId: permission.id,
      }));

      console.log("Existing Permissions Backup:", permissionsBackup);

      // Step 3: Truncate the role_permissions table
      await rolePermission.destroy({ truncate: true, cascade: false });

      // Step 4: Add new role permissions for each module
      const permissionInstance = new rolePermissionController();
      const createPermissionModules = await app_modules.findAll({
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });

      for (const permission of permissionsBackup) {
        for (const module of createPermissionModules) {
          const addedPermissions = await permissionInstance.addRolePermissions(
            module,
            permission.roleId, // Use roleId from permissionsBackup
            "PUT",
            permission.company_id, // Use company_id from permissionsBackup
            dbTransaction
          );

          if (!addedPermissions) {
            if (dbTransaction) await dbTransaction.rollback();
            return helper.sendResponse(res, variables.BadRequest, 0, {}, "Unable to Create Role Permission for this Company");
          }
        }
      }

      // Commit transaction
      await dbTransaction.commit();
      return helper.sendResponse(res, variables.Success, 1, {}, "Role Permissions Updated Successfully");
    } catch (error) {
      // Rollback transaction on error
      if (dbTransaction) await dbTransaction.rollback();
      console.error("Error updating role permissions:", error);
      return helper.sendResponse(res, variables.ServerError, 0, {}, "Internal Server Error");
    }
  };

  viewPermittedRoles = async (req, res) => {
    try {
      const allPermissions = await rolePermission.findAll({ where: { company_id: req.user.company_id, roleId: req.user.roleId } });
      const modulesAllowed = {};
      const reqMethod = ["GET", "PUT", "POST", "DELETE"];

      for (const permissionRecord of allPermissions) {
        let { permissions, modules } = permissionRecord.dataValues;

        if (typeof permissions === "string") {
          permissions = JSON.parse(permissions);
        }

        if (permissions) {
          const allowedMethods = [];
          for (const method of ["GET", "PUT", "POST", "DELETE"]) {
            if (permissions[method]) {
              allowedMethods.push(method);
            }
          }

          if (allowedMethods.length > 0) {
            modulesAllowed[modules] = allowedMethods;
          }
        }
      }

      return helper.success(res, variables.Success, "Permitted View Roles Fetched Successfully", modulesAllowed);
    } catch (error) {
      console.error("Error in viewPermittedRoles:", error);
      return helper.failed(res, variables.BadRequest, "View Permitted Roles Error");
    }
  };

  allowRolePermissions = async (company_id) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const adminRoleID = await role.findOne({
        where: {company_id: company_id, name: "Admin"}
      });

      await rolePermission.update({
        permissions: {
          POST: true,
          GET: true,
          PUT: true,
          DELETE: true,
        },
      },{
        where: {roleId: adminRoleID.id, company_id: company_id}
      })
      await dbTransaction.commit();
      return ({status: true, message: "Permissions updated"})
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      console.error("Error updating role permissions:", error);
      return ({status: false, message: "Internal Server Error"});
    }
  };

  notAllowRolePermissions = async (company_id) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const adminRoleID = await role.findOne({
        where: {company_id: company_id, name: "Admin"}
      });

      console.log(adminRoleID);

      await rolePermission.update({
        permissions: {
          POST: false,
          GET: false,
          PUT: false,
          DELETE: false,
        },
      },{
        where: {roleId: adminRoleID.id, company_id: company_id}
      })
      await dbTransaction.commit();
      return ({status: true, message: "Permissions updated"})
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      console.error("Error updating role permissions:", error);
      return ({status: false, message: "Internal Server Error"});

    }
  };

  
}

export default rolePermissionController;
