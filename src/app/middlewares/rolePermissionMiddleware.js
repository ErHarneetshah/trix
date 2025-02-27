import variables from "../config/variableConfig.js";
import helper from "../../utils/services/helper.js";
import rolePermissionController from "../controllers/admin/rolePermissionController.js";

const rolePermissionMiddleware = async (req, res, next) => {
  const permissionInstance = new rolePermissionController();
  try {
    const authUser = req.user;
    const reqMethod = req.method;
    const routeUrl = req.originalUrl;
    const parts = routeUrl.split("/");
    const moduleName = parts[parts.length - 2];
    // Testing variables
    // const customModule = "department";
    // const customRoleID = 30;

    const getPermission = await permissionInstance.getSpecificRolePermissions(authUser.roleId, moduleName, reqMethod, req.user.company_id );
    const permissions = getPermission.dataValues.permissions;
    if (reqMethod in permissions) {
      if (permissions[reqMethod]) {
        next();
      } else {
        return helper.failed(res, variables.BadRequest, "You Are Not Allowed to Access It");
      }
    } else {
      return helper.failed(res, variables.BadRequest, "Permission does not exists");
    }
  } catch (e) {
    //helper.logger(res, "Role Permissions Middleware -> rolePermissionMiddleware", e);
    if (e.name === "TokenExpiredError") {
      return helper.failed(res, variables.Unauthorized, "Token Expired. Please login again");
    }
    return helper.failed(res, variables.BadRequest, e.message);
  }
};

export default rolePermissionMiddleware;
