import User from "../models/userModel.js";
import department from "../models/departmentModel.js";
import designation from "../models/designationModel.js";
import role from "../models/roleModel.js";
import team from "../models/teamModel.js";

// User Relationships here
User.hasMany(department, { as: "department", foreignKey: "departmentId" });
User.hasMany(designation, { as: "designation", foreignKey: "designationId" });
User.hasMany(role, { as: "role", foreignKey: "roleId" });
User.hasMany(team, { as: "team", foreignKey: "teamId" });

// Department relationships here
department.belongsTo(User, { as: "reportingManager", foreignKey: "reportingManagerId" });

export default {}