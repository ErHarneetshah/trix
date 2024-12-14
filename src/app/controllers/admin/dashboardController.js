import department from "../../../database/models/departmentModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";
const { Op, fn, col, where, literal } = require('sequelize');
import User from "../../../database/models/userModel.js";
import team from "../../../database/models/teamModel.js";
import { BlockedWebsites } from "../../../database/models/BlockedWebsite.js";
import { ProductiveApp } from "../../../database/models/ProductiveApp.js";

class dashboardController {
  // getDashboardData = async (req, res) => {
  //   try {
  //     let users = await User.findAll({
  //       where: { company_id: req.user.company_id, isAdmin: 0 },
  //     });
  //     let totalUsers = users.length;
  //     let activeUsers = users.filter((user) => user.currentStatus == 1).length;
  //     let inactiveUsers = users.filter(
  //       (user) => user.currentStatus == 0
  //     ).length;

  //     let absent_user = users.filter((user) => user.currentStatus == 0)

  //     let dashboard = {
  //       totalUsers,
  //       activeUsers,
  //       inactiveUsers,
  //       absent_user
  //     };
  //     return helper.success(
  //       res,
  //       variables.Success,
  //       "Dashboard Data Fetched Successfully!!!",
  //       dashboard
  //     );
  //   } catch (error) {
  //     console.log({ error });
  //     return helper.failed(
  //       res,
  //       variables.BadRequest,
  //       "Error in getting getDashboard Data"
  //     );
  //   }
  // };

  getCompanyStats = async (companyId) => {
    try {
      const currentDate = new Date();

      const totalEmployees = await User.count({
        where: { company_id: companyId },
      });

      const totalWorkingEmployees = await Timelog.count({
        where: {
          company_id: companyId,
          logged_out_time: null,
          createdAt: { [Op.gte]: fn('DATE', fn('NOW')) },
        },
      });

      const totalNotWorkingEmployees = await Timelog.count({
        where: {
          company_id: companyId,
          logged_out_time: { [Op.ne]: null },
          createdAt: { [Op.gte]: fn('DATE', fn('NOW')) },
        },
      });

      const absentUsers = await User.count({
        where: {
          company_id: companyId,
          id: {
            [Op.notIn]: literal(`(
              SELECT user_id FROM timelogs 
              WHERE DATE(createdAt) = CURDATE() AND company_id = ${companyId}
            )`),
          },
        },
      });

      const totalLateUsers = await Timelog.count({
        where: {
          company_id: companyId,
          late_coming_duration: { [Op.gt]: 0 },
          createdAt: { [Op.gte]: fn('DATE', fn('NOW')) },
        },
      });

      const totalActivated = await User.count({
        where: { company_id: companyId },
      });

      const totalSlackingEmployees = await Timelog.count({
        where: {
          company_id: companyId,
          idle_time: { [Op.gt]: 0 },
          createdAt: { [Op.gte]: fn('DATE', fn('NOW')) },
        },
      });

      const totalDectivated = await User.count({
        where: { company_id: companyId, status: 0 },
      });

      return {
        total_employees: totalEmployees,
        total_working_employee: totalWorkingEmployees,
        total_not_working_employee: totalNotWorkingEmployees,
        absent_users: absentUsers,
        total_late_users: totalLateUsers,
        total_activated_users: totalActivated,
        total_deactivated: totalDectivated,
        total_slacking_users: totalSlackingEmployees,
      };
    } catch (error) {
      console.error('Error fetching company stats:', error);
      return {
        total_employees: 0,
        total_working_employee: 0,
        total_not_working_employee: 0,
        absent_users: 0,
        total_late_users: 0,
        total_activated_users: 0,
        total_deactivated: 0,
        total_slacking_users: 0,
      };
    }
  };

  getDashbaordData = async (req, res, next) => {

    try {
      const companyStats = await getCompanyStats();
      return helper.success(res, variables.Success, "Data Fetched Successfully", companyStats);

    } catch (error) {
      return helper.failed(res, 400, "Invalid data format", []);

    }
  }


}

export default dashboardController;
