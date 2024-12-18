import { Sequelize } from "sequelize";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import exportReports from "../../../database/models/exportReportsModel.js";
import department from "../../../database/models/departmentModel.js";
import TimeLog from "../../../database/models/timeLogsModel.js";
import User from "../../../database/models/userModel.js";
import AppHistoryEntry from "../../../database/models/AppHistoryEntry.js";
import commonfuncitons from "../../../utils/services/commonfuncitons.js";
class exportReportController {
  getReportsDataSet = async (req, res) => {
    try {
      const alldata = await exportReports.findAll();
      if (!alldata) return helper.failed(res, variables.NotFound, "No Report Data Found in Table");

      return helper.success(res, variables.Success, "Reports Data Retrieved Successfully", alldata);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getReportsHistory = async (req, res) => {
    try {
      return helper.success(res, variables.Success, "Reports Data Retrieved Successfully", alldata);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getAllReports = async (req, res) => {
    const dbTransaction = await Sequelize.transaction();
    try {
      const { fromTime, toTime } = req.body;

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "User Updated Successfully");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getProductiveReport = async (req, res) => {
    try {
      let { fromTime, toTime, definedPeriod, teamId, userId, format, allRequest } = req.body;
      /**
       * Employee name | Department | Date | login time | Logout time | Total active hours | Idle time | time on productive apps | Time on non productive apps | Productive websites | Non productive websites | Average productivity % | Most used productive app
       */
      if (allRequest) {
      } else if (definedPeriod && [1, 2, 3].includes(definedPeriod)) {
        const alldata = await TimeLog.findAndCountAll({
          // where: logWhere, // add the definedPeriod Condition here
          include: [
            {
              model: User,
              as: "user",
              required: true,
              where: { teamId: teamId },
              attributes: ["id", "fullname"],
              include: [
                {
                  model: AppHistoryEntry,
                  as: "productivity",
                  required: false,
                },
                {
                  model: department,
                  as: "department",
                  attributes: ["name"],
                },
              ],
            },
          ],
          order: [["createdAt", "DESC"]],
        });
        if(!alldata) return helper.failed(res, variables.BadRequest, "Unable to retrieve the data");

        let result = commonfuncitons.createResponse(alldata.rows)

        // await dbTransaction.commit();
        return helper.success(res, variables.Success, "User Updated Successfully", result);
      }
    } catch (error) {
      // if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getAttendanceReport = async (req, res) => {
    const dbTransaction = await Sequelize.transaction();
    try {
      const { fromTime, toTime, definedPeriod, teamId, userId, format, deptRequest } = req.body;

      /**
       * Employee name | Team | Date | Day | Attendance status | Shift time in | Time in | Shift Time out | Time out | Report(?)
       */

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "User Updated Successfully");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getBrowserActivityReport = async (req, res) => {
    const dbTransaction = await Sequelize.transaction();
    try {
      const { fromTime, toTime, definedPeriod, teamId, userId, format, deptRequest } = req.body;

      /**
       * Name | Dept. | URL | Productive/Non-productive | Time spent
       */

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "User Updated Successfully");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getApplicationUsageReport = async (req, res) => {
    const dbTransaction = await Sequelize.transaction();
    try {
      const { fromTime, toTime, definedPeriod, teamId, userId, format, deptRequest } = req.body;

      /**
       * Name | Dept. | Application | Productive/Non-Productive |
       */

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "User Updated Successfully");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getDeptPerformReport = async (req, res) => {
    const dbTransaction = await Sequelize.transaction();
    try {
      const { fromTime, toTime, definedPeriod, teamId, userId, format, deptRequest } = req.body;

      /**
       * Department | TL | Total employees | Avg Attendance rate | Avg Login time| Avg productive time (browser)| Avg non productive time (browser)| Avg productive time(app) | Avg non productive time (app) | Most non productive website | Most non productive app | Most productive (app) | Most non productive app
       */

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "User Updated Successfully");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getUnauthorizedWebReport = async (req, res) => {
    const dbTransaction = await Sequelize.transaction();
    try {
      const { fromTime, toTime, definedPeriod, teamId, userId, format, deptRequest } = req.body;

      /**
       * Name | Dept. | URL | time
       */
      await dbTransaction.commit();
      return helper.success(res, variables.Success, "User Updated Successfully");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default exportReportController;
