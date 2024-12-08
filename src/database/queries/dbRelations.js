import User from "../models/userModel.js";
import department from "../models/departmentModel.js";
import designation from "../models/designationModel.js";
import role from "../models/roleModel.js";
import team from "../models/teamModel.js";
import workReports from "../models/workReportsModel.js";

// User Relationships here
User.belongsTo(department, { as: "department", foreignKey: "departmentId" });
User.belongsTo(designation, { as: "designation", foreignKey: "designationId" });
User.belongsTo(role, { as: "role", foreignKey: "roleId" });
User.belongsTo(team, { as: "team", foreignKey: "teamId" });

// Department relationships here
department.belongsTo(User, { as: "reportingManager", foreignKey: "reportingManagerId" });

// Work Reports relationships here
workReports.belongsTo(User, { as: "user", foreignKey: "user_id" });

export default {}