import variables from "../config/variableConfig.js";
import helper from "../../utils/services/helper.js";
import rolePermissionController from "../controllers/admin/rolePermissionController.js";

const rolePermissionMiddleware = async (req, res, next) => {
  const permissionInstance = new rolePermissionController();
  try {
    const authUser = req.user;
    const reqMethod = req.method;
    const routeUrl = req.originalUrl;
    const moduleName = routeUrl.split("/")[2]; // Extracts 'dept'
    const customModule = "department";
    const customRoleID = 30;

    const getPermission = await permissionInstance.getSpecificRolePermissions(customRoleID, customModule);
    const permissions = getPermission.dataValues.permissions;
    console.log(permissions);
    console.log(typeof permissions);
   

    return true;
    // return helper.failed(res, variables.Unauthorized, "You are not allowed to access it.");
    next();
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      return helper.failed(res, variables.Unauthorized, "You are not allowed to access it.");
    }
    return helper.failed(res, variables.Unauthorized, e.message);
  }
};

export default rolePermissionMiddleware;
