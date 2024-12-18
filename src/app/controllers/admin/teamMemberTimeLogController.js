import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import TimeLog from "../../../database/models/timeLogsModel.js";
import { group } from "console";
import shift from "../../../database/models/shiftModel.js";
import User from "../../../database/models/userModel.js";
import { Op, Sequelize } from "sequelize";
import AppHistoryEntry from "../../../database/models/AppHistoryEntry.js";

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
      let searchable = ["$user.fullname$"];
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      let logWhere = await helper.searchCondition(searchParam, searchable);
      let userWhere = {};
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

      if (tab) {
        if (tab.toLowerCase() === "working") {
          userWhere.currentStatus = 1;
        } else if (tab.toLowerCase() === "absent") {
          userWhere.currentStatus = 0;
        } else if (tab.toLowerCase() === "late") {
          logWhere.late_coming = true;
        }
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
            where: userWhere,
            attributes: ["id", "fullname"],
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

      const result = this.createResponse(alldata.count, alldata.rows);

      return helper.success(res, variables.Success, "All Data fetched Successfully!", { count: alldata.count, rows: result });
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

      const workingCount = await User.count({
        where: {
          company_id: req.user.company_id,
          currentStatus: 1,
          updatedAt: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      const absentCount = await User.count({
        where: {
          company_id: req.user.company_id,
          currentStatus: 0,
          updatedAt: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      const lateCount = await TimeLog.count({
        distinct: true,
        col: "user_id",
        where: {
          late_coming: true,
          createdAt: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      const countsData = [
        { count: employeeCount, name: "employee" },
        { count: workingCount, name: "working" },
        { count: absentCount, name: "absent" },
        { count: lateCount, name: "late" },
        { count: 0, name: "slacking" },
        { count: 0, name: "productive" },
        { count: 0, name: "unproductive" },
      ];

      return helper.success(res, variables.Success, "All Data fetched Successfully!", countsData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  // used to map response in a certain response
  createResponse = (inputData) => {
    return inputData.map((data) => {
      const totalSecondsSpent = data.user.productivity.reduce((total, item) => {
        const timeSpent = this.calculateTimeInSeconds(item.startTime, item.endTime).toString();
        const seconds = parseInt(timeSpent, 10);
        return isNaN(seconds) ? total : total + seconds; // Skip invalid values
      }, 0);

      const { hours, minutes, seconds } = this.convertSecondsToHMS(totalSecondsSpent);

      const formattedTime = `${hours}h ${minutes}m ${seconds}s`;

      const outputData = {
        id: data.id,
        user_id: data.user_id,
        shift_id: data.shift_id,
        company_id: data.company_id,
        logged_in_time: data.logged_in_time,
        active_time: data.active_time,
        late_coming_duration: data.late_coming_duration,
        logged_out_time: data.logged_out_time,
        early_going: data.early_going,
        late_coming: data.late_coming,
        spare_time: data.spare_time,
        idle_time: data.idle_time,
        date: data.date,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        user: {
          id: data.user.id,
          fullname: data.user.fullname,
          total_seconds_spent: formattedTime,
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
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds };
  };
}

export default teamMemberTimeLogController;
