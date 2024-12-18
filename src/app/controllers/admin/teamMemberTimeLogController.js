import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import TimeLog from "../../../database/models/timeLogsModel.js";
import shift from "../../../database/models/shiftModel.js";
import User from "../../../database/models/userModel.js";
import { Op, Sequelize, QueryTypes } from "sequelize";
import AppHistoryEntry from "../../../database/models/AppHistoryEntry.js";
import { ProductiveApp } from "../../../database/models/ProductiveApp.js";

class teamMemberTimeLogController {
  getAllTeamMemberLog = async (req, res) => {
    try {
      // ___________---------- Search, Limit, Pagination ----------_______________
      let { searchParam, limit, page, date } = req.query;
      let searchable = ["$user.fullname$"];
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      let logWhere = await helper.searchCondition(searchParam, searchable);
      // ___________---------- Search, Limit, Pagination ----------_______________

      let startOfDay;
      let endOfDay;

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        logWhere.updatedAt = { [Op.between]: [startOfDay, endOfDay] };
      } else {
        startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        logWhere.updatedAt = { [Op.between]: [startOfDay, endOfDay] };
      }

      logWhere.company_id = req.user.company_id;
      const alldata = await TimeLog.findAndCountAll({
        where: logWhere,
        offset,
        limit,
        attributes: ["id", "active_time", "logged_in_time", "logged_out_time", "late_coming", "early_going"],
        include: [
          {
            model: User,
            as: "user",
            required: true,
            attributes: ["id", "fullname", "currentStatus"],
          },
          {
            model: shift,
            as: "shift", // Alias for the associated `department` model
            attributes: ["start_time", "end_time"], // Select specific fields
          },
        ],
        order: [["createdAt", "DESC"]], // Sort by creation date (most recent first)
      });
      if (!alldata) return helper.failed(res, variables.NotFound, "No Data is available!");

      return helper.success(res, variables.Success, "All Data fetched Successfully!", alldata);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getTeamMemberLogFiltered = async (req, res) => {
    try {
      // ___________---------- Search, Limit, Pagination ----------_______________
      let { searchParam, limit, page, date, tab } = req.query;
      // let searchable = ["$user.fullname$"];
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      // let logWhere = await helper.searchCondition(searchParam, searchable);
      let userWhere = {};
      let logWhere = {};
      // ___________---------- Search, Limit, Pagination ----------_______________

      let startOfDay;
      let endOfDay;

      if (date) {
        startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        logWhere.createdAt = { [Op.between]: [startOfDay, endOfDay] };
      } else {
        startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        logWhere.createdAt = { [Op.between]: [startOfDay, endOfDay] };
      }

      logWhere.company_id = req.user.company_id;

      const alldata = await TimeLog.findAndCountAll({
        where: logWhere,
        offset: offset,
        limit: limit,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "fullname", "currentStatus"],
            include: [
              {
                model: AppHistoryEntry,
                as: "productivity",
                required: false,
              },
            ],
          },
          {
            model: shift,
            as: "shift",
            attributes: ["start_time", "end_time"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      if (!alldata) return helper.failed(res, variables.NotFound, "No Data is available!");

      let result = this.createResponse(alldata.rows);

      if (searchParam) {
        const regex = new RegExp(searchParam, "i");
        result = result.filter((item) => regex.test(item.user.fullname));
      }

      if (tab) {
        if (tab.toLowerCase() === "working") {
          result = result.filter((item) => item.logged_out_time === null && item.user.currentStatus === true);
        } else if (tab.toLowerCase() === "absent") {
          result = result.filter((item) => item.user.currentStatus === false);
        } else if (tab.toLowerCase() === "late") {
          result = result.filter((item) => item.late_coming === true);
        } else if (tab.toLowerCase() === "slacking") {
          result = result.filter((item) => item.user.is_slacking === true);
        } else if (tab.toLowerCase() === "productive") {
          result = result.filter((item) => item.user.is_productive === true && item.user.productiveTime != 0 && item.user.nonProductiveTime != 0);
        } else if (tab.toLowerCase() === "nonProductive") {
          result = result.filter((item) => item.user.is_productive === false && item.user.nonProductiveTime != 0 && item.user.productiveTime != 0);
        }
      }

      const count = result.length;

      return helper.success(res, variables.Success, "All Data fetched Successfully!", { count: count, rows: result });
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getFilterCount = async (req, res) => {
    try {
      let { date } = req.query;
      let logWhere = {};
      let userWhere = {};
      let startOfDay;
      let endOfDay;

      if (date) {
        startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        logWhere.updatedAt = { [Op.between]: [startOfDay, endOfDay] };
      } else {
        startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        logWhere.updatedAt = { [Op.between]: [startOfDay, endOfDay] };
      }

      userWhere.currentStatus = 1;

      const employeeCount = await User.count({
        where: {
          company_id: req.user.company_id,
        },
      });

      const workingCount = await TimeLog.count({
        where: {
          company_id: req.user.company_id,
          logged_out_time: null,
          createdAt: { [Op.between]: [startOfDay, endOfDay] },
        },
        include: [
          {
            model: User,
            as: "user",
            required: true,
            where: { currentStatus: 1 },
          },
        ],
      });

      const absentCount = await TimeLog.count({
        where: {
          company_id: req.user.company_id,
          createdAt: { [Op.between]: [startOfDay, endOfDay] },
        },
        include: [
          {
            model: User,
            as: "user",
            required: true,
            where: { currentStatus: 0 },
          },
        ],
      });

      const slackingCount = await TimeLog.count({
        where: {
          company_id: req.user.company_id,
          createdAt: { [Op.between]: [startOfDay, endOfDay] },
          idle_time: {
            [Op.gt]: Sequelize.literal("(0.4 * (active_time + spare_time + idle_time))"),
          },
        },
      });

      const lateCount = await TimeLog.count({
        where: {
          company_id: req.user.company_id,
          createdAt: { [Op.between]: [startOfDay, endOfDay] },
          late_coming: 1,
        },
      });

      console.log({ startOfDay });
      let date_string = new Date(startOfDay).toISOString().split("T")[0];

      const [productiveResult] = await sequelize.query(
        `
        SELECT COUNT(*) AS count
        FROM (
          SELECT 
            timelogs.id, 
            timelogs.user_id, 
            (timelogs.idle_time + timelogs.active_time + timelogs.spare_time) AS totalTimeLog,
            SUM(TIMESTAMPDIFF(MINUTE, appHistory.startTime, appHistory.endTime)) AS totalTimeSpent
          FROM timelogs
          INNER JOIN app_histories AS appHistory
            ON timelogs.user_id = appHistory.userId
          WHERE 
            timelogs.company_id = :company_id
            AND timelogs.createdAt like "%${date_string}%" AND appHistory.is_productive = 1
          GROUP BY timelogs.user_id
          HAVING totalTimeSpent >= 0.6 * totalTimeLog
        ) AS productiveEntries;`,
        {
          replacements: {
            company_id: req.user.company_id,
          },
          type: QueryTypes.SELECT,
        }
      );

      const productiveCount = productiveResult.count;

      const [nonProductiveResult] = await sequelize.query(
        `
        SELECT COUNT(*) AS count
        FROM (
          SELECT 
            timelogs.id, 
            timelogs.user_id, 
            (timelogs.idle_time + timelogs.active_time + timelogs.spare_time) AS totalTimeLog,
            SUM(TIMESTAMPDIFF(MINUTE, appHistory.startTime, appHistory.endTime)) AS totalTimeSpent
          FROM timelogs
          INNER JOIN app_histories AS appHistory
            ON timelogs.user_id = appHistory.userId
          WHERE 
            timelogs.company_id = :company_id
            AND timelogs.createdAt like "%${date_string}%" AND appHistory.is_productive = 1
          GROUP BY timelogs.user_id
          HAVING totalTimeSpent <= 0.6 * totalTimeLog
        ) AS productiveEntries;`,
        {
          replacements: {
            company_id: req.user.company_id,
          },
          type: QueryTypes.SELECT,
        }
      );

      const nonProductiveCount = nonProductiveResult.count;

      const countsData = [
        { count: employeeCount, name: "employee" },
        { count: workingCount, name: "working" },
        { count: absentCount, name: "absent" },
        { count: lateCount, name: "late" },
        { count: slackingCount, name: "slacking" },
        { count: productiveCount, name: "productive" },
        { count: nonProductiveCount, name: "unproductive" },
      ];

      return helper.success(res, variables.Success, "All Data fetched Successfully!", countsData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  // used to map response in a certain response
  createResponse = (inputData) => {
    return inputData.map((data) => {
      let productiveTime, totalTime, totalProductiveTime, nonProductiveTime, totalNonProductiveTime, activeTimeThreshold, idleTimeThreshold, isProductive, isSlacking;

      if (data.user.productivity.length != 0) {
        totalTime = data.user.productivity.reduce(
          (totals, item) => {
            const timeSpent = this.calculateTimeInSeconds(item.startTime, item.endTime).toString();
            const seconds = parseInt(timeSpent, 10);

            if (!isNaN(seconds)) {
              if (item.is_productive) {
                totals.productiveTime += seconds; // Add to productive total
              } else {
                totals.nonProductiveTime += seconds; // Add to non-productive total
              }
            }
            return totals;
          },
          { productiveTime: 0, nonProductiveTime: 0 } // Initial values for both totals
        );

        totalProductiveTime = totalTime.productiveTime;
        totalNonProductiveTime = totalTime.nonProductiveTime;

        const prodresult = this.convertSecondsToHMS(totalProductiveTime);
        const nonProdresult = this.convertSecondsToHMS(totalNonProductiveTime);

        let prodhours, prodminutes, prodseconds;
        let nonProdhours, nonProdminutes, nonProdseconds;

        //Productive
        if (prodresult == 0) {
          productiveTime = 0;
        } else {
          prodhours = prodresult.hours;
          prodminutes = prodresult.minutes;
          prodseconds = prodresult.seconds;

          productiveTime = `${prodhours}h ${prodminutes}m ${prodseconds}s`;
        }

        //Non productive
        if (nonProdresult == 0) {
          nonProductiveTime = 0;
        } else {
          nonProdhours = nonProdresult.hours;
          nonProdminutes = nonProdresult.minutes;
          nonProdseconds = nonProdresult.seconds;

          nonProductiveTime = `${nonProdhours}h ${nonProdminutes}m ${nonProdseconds}s`;
        }

        activeTimeThreshold = Math.floor((data.active_time + data.spare_time + data.idle_time) * 60 * 0.6);
        idleTimeThreshold = Math.floor((data.active_time + data.spare_time + data.idle_time) * 0.4);
        isProductive = totalProductiveTime >= activeTimeThreshold;
        isSlacking = data.idle_time >= idleTimeThreshold;
      } else {
        totalProductiveTime = 0;
        totalNonProductiveTime = 0;
        productiveTime = 0;
        nonProductiveTime = 0;

        activeTimeThreshold = Math.floor((data.active_time + data.spare_time + data.idle_time) * 60 * 0.6);
        idleTimeThreshold = Math.floor((data.active_time + data.spare_time + data.idle_time) * 0.4);
        isProductive = totalProductiveTime >= activeTimeThreshold;
        isSlacking = data.idle_time >= idleTimeThreshold;
      }

      const outputData = {
        // id: data.id,
        user_id: data.user_id,
        shift_id: data.shift_id,
        company_id: data.company_id,
        logged_in_time: data.logged_in_time,
        active_time: data.active_time,
        // late_coming_duration: data.late_coming_duration,
        logged_out_time: data.logged_out_time,
        early_going: data.early_going,
        late_coming: data.late_coming,
        // spare_time: data.spare_time,
        // idle_time: data.idle_time,
        // date: data.date,
        user: {
          id: data.user.id,
          fullname: data.user.fullname,
          currentStatus: data.user.currentStatus,
          productiveTime: productiveTime,
          nonProductiveTime: nonProductiveTime,
          is_productive: isProductive,
          is_slacking: isSlacking,
        },
        shift: data.shift,
      };

      return outputData;
    });
  };

  calculateTimeInSeconds = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.floor((end - start) / 1000); // Convert milliseconds to seconds
  };

  convertSecondsToHMS = (totalSeconds) => {
    let hours, minutes, seconds;
    if (totalSeconds) {
      hours = Math.floor(totalSeconds / 3600);
      minutes = Math.floor((totalSeconds % 3600) / 60);
      seconds = totalSeconds % 60;
    } else {
      return 0;
    }

    return { hours, minutes, seconds };
  };
}

export default teamMemberTimeLogController;
