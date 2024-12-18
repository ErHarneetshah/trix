import { Sequelize } from "sequelize";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";

class exportReportController {
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
      const { fromTime, toTime, definedPeriod, teamId, userId } = req.body;

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
      const { fromTime, toTime } = req.body;

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
      const { fromTime, toTime } = req.body;

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
      const { fromTime, toTime } = req.body;

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
      const { fromTime, toTime } = req.body;

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
      const { fromTime, toTime } = req.body;

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "User Updated Successfully");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default exportReportController;
