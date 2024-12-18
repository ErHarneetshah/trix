import { Sequelize } from "sequelize";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import exportReports from "../../../database/models/exportReportsModel.js";

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
    const dbTransaction = await Sequelize.transaction();
    try {
      const { fromTime, toTime, definedPeriod, teamId, userId, format, deptRequest } = req.body;

      /** 
       * Employee name | Department | Date | login time | Logout time | Total active hours | Idle time | time on productive apps | Time on non productive apps | Productive websites | Non productive websites | Average productivity % | Most used productive app 
      */


      await dbTransaction.commit();
      return helper.success(res, variables.Success, "User Updated Successfully");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
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
