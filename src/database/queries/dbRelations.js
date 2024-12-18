import User from "../models/userModel.js";
import department from "../models/departmentModel.js";
import designation from "../models/designationModel.js";
import role from "../models/roleModel.js";
import team from "../models/teamModel.js";
import workReports from "../models/workReportsModel.js";
import TimeLog from "../models/timeLogsModel.js";
import shift from "../models/shiftModel.js";
import rolePermission from "../models/rolePermissionModel.js";
import {BlockedWebsites} from "../models/BlockedWebsite.js";
import { ProductiveApp }from "../models/ProductiveApp.js";
import { UserHistory } from "../models/UserHistory.js";
import AppHistoryEntry  from "../models/AppHistoryEntry.js";
import ProductiveWebsite from "../models/ProductiveWebsite.js";
import company from "../models/company.js";
import { Device } from "../models/device.js";
import languageSettings from "../models/languageSettingsModel.js";
import languageDropdown from "../models/languageModel.js";

// User Relationships here
// User.belongsTo(department, { as: "department", foreignKey: "departmentId" });
// User.hasOne(department , { as : "deptHead" , foreignKey:"reportingManagerId"  , sourceKey: "id"})
// User.belongsTo(designation, { as: "designation", foreignKey: "designationId" });
// User.belongsTo(role, { as: "role", foreignKey: "roleId" });
// User.belongsTo(team, { as: "team", foreignKey: "teamId" });
// User.hasMany(UserHistory, { foreignKey: "userId", as: "web" });
// User.hasMany(AppHistoryEntry, { foreignKey: "userId", as: "app" });

// // Department relationships here
// department.belongsTo(User, { as: "reportingManager", foreignKey: "reportingManagerId" });
// department.hasMany(team, { as: 'department', foreignKey: 'departmentId' });
// department.belongsTo(department, { as: "parentDept", foreignKey: "parentDeptId" });

// // Work Reports relationships here
// workReports.belongsTo(User, { as: "user", foreignKey: "user_id" });

// // Time Log relationships here
// TimeLog.belongsTo(User, { as: "user", foreignKey: "user_id" });
// TimeLog.belongsTo(shift, { as: "shift", foreignKey: "shift_id" });
// TimeLog.hasMany(AppHistoryEntry, { foreignKey: "userId", as: "appHistory" });


// // Role Permissions relationships here
// rolePermission.belongsTo(role, { as: "role", foreignKey: "roleId" });
// BlockedWebsites.belongsTo(department, { as: "department", foreignKey: "departmentId" });
// ProductiveApp.belongsTo(department, { as: "department", foreignKey: "department_id" });
// ProductiveWebsite.belongsTo(department, { as: "department", foreignKey: "department_id" });

// // Team Relations here
// team.belongsTo(department,{ as: 'department', foreignKey: 'departmentId' });
// team.belongsTo(shift, { as: 'shift', foreignKey: 'shiftId' });
// team.hasMany(User, { as: 'children', foreignKey: 'teamId' });

// Device.belongsTo(User, { foreignKey: "user_id" });  
// User.hasMany(Device, { foreignKey: "user_id" });


// User.belongsTo(department, { foreignKey: "departmentId" });
// User.belongsTo(designation, { foreignKey: "designationId" });

// User.hasMany(AppHistoryEntry, { foreignKey: "userId", as: "productivity" });
// languageSettings.belongsTo(languageDropdown, { as: "language", foreignKey: "language_id" });


export default {}