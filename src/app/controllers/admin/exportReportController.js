import { Op, Sequelize } from "sequelize";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import exportReports from "../../../database/models/exportReportsModel.js";
import team from "../../../database/models/teamModel.js";
import User from "../../../database/models/userModel.js";
import { UserHistory } from "../../../database/models/UserHistory.js";

class exportReportController {
  getReportsDataSet = async (req, res) => {
    try {
      const alldata = await exportReports.findAll();
      if (!alldata)
        return helper.failed(
          res,
          variables.NotFound,
          "No Report Data Found in Table"
        );

      return helper.success(
        res,
        variables.Success,
        "Reports Data Retrieved Successfully",
        alldata
      );
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getReportsHistory = async (req, res) => {
    try {
      return helper.success(
        res,
        variables.Success,
        "Reports Data Retrieved Successfully",
        alldata
      );
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getAllReports = async (req, res) => {
    const dbTransaction = await Sequelize.transaction();
    try {
      const { fromTime, toTime } = req.body;

      await dbTransaction.commit();
      return helper.success(
        res,
        variables.Success,
        "User Updated Successfully"
      );
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getProductiveReport = async (req, res) => {
    const dbTransaction = await Sequelize.transaction();
    try {
      const {
        fromTime,
        toTime,
        definedPeriod,
        teamId,
        userId,
        format,
        deptRequest,
      } = req.body;

      /**
       * Employee name | Department | Date | login time | Logout time | Total active hours | Idle time | time on productive apps | Time on non productive apps | Productive websites | Non productive websites | Average productivity % | Most used productive app
       */

      await dbTransaction.commit();
      return helper.success(
        res,
        variables.Success,
        "User Updated Successfully"
      );
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getAttendanceReport = async (req, res) => {
    const dbTransaction = await Sequelize.transaction();
    try {
      const {
        fromTime,
        toTime,
        definedPeriod,
        teamId,
        userId,
        format,
        deptRequest,
      } = req.body;

      /**
       * Employee name | Team | Date | Day | Attendance status | Shift time in | Time in | Shift Time out | Time out | Report(?)
       */

      await dbTransaction.commit();
      return helper.success(
        res,
        variables.Success,
        "User Updated Successfully"
      );
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getBrowserActivityReport = async (req, res) => {
    const dbTransaction = await Sequelize.transaction();
    try {
      const {
        fromTime,
        toTime,
        definedPeriod,
        teamId,
        userId,
        format,
        deptRequest,
      } = req.body;

      /**
       * Name | Dept. | URL | Productive/Non-productive | Time spent
       */

      await dbTransaction.commit();
      return helper.success(
        res,
        variables.Success,
        "User Updated Successfully"
      );
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getApplicationUsageReport = async (req, res) => {
    const dbTransaction = await Sequelize.transaction();
    try {
      const {
        fromTime,
        toTime,
        definedPeriod,
        teamId,
        userId,
        format,
        deptRequest,
      } = req.body;

      /**
       * Name | Dept. | Application | Productive/Non-Productive |
       */

      await dbTransaction.commit();
      return helper.success(
        res,
        variables.Success,
        "User Updated Successfully"
      );
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getDeptPerformReport = async (req, res) => {
    const dbTransaction = await Sequelize.transaction();
    try {
      const {
        fromTime,
        toTime,
        definedPeriod,
        teamId,
        userId,
        format,
        deptRequest,
      } = req.body;

      /**
       * Department | TL | Total employees | Avg Attendance rate | Avg Login time| Avg productive time (browser)| Avg non productive time (browser)| Avg productive time(app) | Avg non productive time (app) | Most non productive website | Most non productive app | Most productive (app) | Most non productive app
       */

      await dbTransaction.commit();
      return helper.success(
        res,
        variables.Success,
        "User Updated Successfully"
      );
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getUnauthorizedWebReport = async (req, res) => {
    const dbTransaction = await Sequelize.transaction();
    try {
      const {
        fromTime,
        toTime,
        definedPeriod,
        teamId,
        userId,
        format,
        deptRequest,
      } = req.body;

      /**
       * Name | Dept. | URL | time
       */
      await dbTransaction.commit();
      return helper.success(
        res,
        variables.Success,
        "User Updated Successfully"
      );
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getTeamList = async (req, res) => {
    try {
      const teamList = await team.findAll({
        where: {
          company_id: req.user.company_id,
        },
        attributes: ["id", "name"],
      });
      return helper.success(res, variables.Success, teamList);
    } catch (error) {
      console.log("Error while getting team list for report:", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getMemberList = async (req, res) => {
    try {
      const teamList = await User.findAll({
        where: {
          company_id: req.user.company_id,
          isAdmin: 0,
        },
        attributes: ["id", "fullname"],
      });
      return helper.success(res, variables.Success, teamList);
    } catch (error) {
      console.log("Error while getting team list for report:", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getBrowserHistoryReport = async (req, res) => {
    try {
      let data = req.body;
      if (!data.member_id) {
        return helper.failed(
          res,
          variables.BadRequest,
          "Please select team and member"
        );
      }
   
      const validOptions = [
        "custom_range",
        "yesterday",
        "previous_week",
        "previous_month",
      ];

      if (!data.option || !validOptions.includes(data.option)) {
        return helper.failed(
          res,
          variables.BadRequest,
          "Please select a valid date option"
        );
      }

      let date;
      if (data.option) {
        if (data.option == "custom_range") {
          if (!data.customStart || !data.customEnd) {
            return helper.failed(
              res,
              variables.BadRequest,
              "Please select start and end date"
            );
          }
          date = await helper.getDateRange(data.option, data.customStart, data.customEnd);
        } else {
          date = await helper.getDateRange(data.option);
        }
      }
      if (date && date.status == 0) {
        return helper.failed(res, variables.BadRequest, date.message);
      }

      if (data.team_id && data.member_id) {
        const team = await User.findOne({
          where: {
            teamId: data.team_id,
            id: data.member_id,
            company_id: req.user.company_id,
            createdAt: {
              [Op.between]: [date.startDate, date.endDate],
            },
          },
        });
        if (!team) {
          return helper.failed(res, variables.BadRequest, "User not found!!!");
        }
        const browserHistroy = await UserHistory.findAll({
          where: {
            userId: data.member_id,
            createdAt: {
              [Op.between]: [date.startDate, date.endDate],
            },
          },
        });
        return helper.success(
          res,
          variables.Success,
          "Browser Data Fetched successfully",
          browserHistroy
        );
      } else {
        const team = await User.findOne({
          where: {
            id: data.member_id,
            company_id: req.user.company_id,
          },
        });
        if (!team) {
          return helper.failed(res, variables.BadRequest, "User not found!!!");
        }
        const browserHistroy = await UserHistory.findAll({
          where: {
            userId: data.member_id,
          },
        });
        return helper.success(
          res,
          variables.Success,
          "Browser Data Fetched successfully",
          browserHistroy
        );
      }
    } catch (error) {
      console.log("Error while generating browser history report:", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default exportReportController;
