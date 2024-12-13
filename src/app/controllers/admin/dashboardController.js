// import department from "../../../database/models/departmentModel.js";
// import sequelize from "../../../database/queries/dbConnection.js";
// import variables from "../../config/variableConfig.js";
// import helper from "../../../utils/services/helper.js";
// import { Op } from "sequelize";
// import User from "../../../database/models/userModel.js";
// import team from "../../../database/models/teamModel.js";
// import { BlockedWebsites } from "../../../database/models/BlockedWebsite.js";
// import { ProductiveApp } from "../../../database/models/ProductiveApp.js";

// class dashboardController {
//   getDashboardData = async (req, res) => {
//     try {
//       let users = await User.findAll({
//         where: { company_id: req.user.company_id, isAdmin: 0 },
//       });
//       let totalUsers = users.length;
//       let activeUsers = users.filter((user) => user.currentStatus == 1).length;
//       let inactiveUsers = users.filter(
//         (user) => user.currentStatus == 0
//       ).length;

//       let absent_user = users.filter((user) => user.currentStatus == 0)
      
//       let dashboard = {
//         totalUsers,
//         activeUsers,
//         inactiveUsers,
//         absent_user
//       };
//       return helper.success(
//         res,
//         variables.Success,
//         "Dashboard Data Fetched Successfully!!!",
//         dashboard
//       );
//     } catch (error) {
//       console.log({ error });
//       return helper.failed(
//         res,
//         variables.BadRequest,
//         "Error in getting getDashboard Data"
//       );
//     }
//   };
// }

// export default dashboardController;
