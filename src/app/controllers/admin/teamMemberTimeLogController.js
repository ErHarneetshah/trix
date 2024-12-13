import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import TimeLog from "../../../database/models/timeLogsModel.js";
import { group } from "console";
import shift from "../../../database/models/shiftModel.js";
import User from "../../../database/models/userModel.js";
import { Op } from "sequelize";

class teamMemberTimeLogController {
  getAllTeamMemberLog = async (req, res) => {
    try {
      // Search Parameter filters and pagination code >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      let { searchParam, limit, page, date } = req.query;
      let searchable = ["$user.fullname$"];
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      let logWhere = await helper.searchCondition(searchParam, searchable);

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
        where: logWhere, // Filters for `workReports`
        offset,
        limit,
        attributes: ["id", "total_active_duration", "logged_in_time", "logged_out_time", "late_coming", "early_going"],
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
      // Search Parameter filters and pagination code >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      let { searchParam, limit, page, date, tab } = req.query;
      let searchable = ["$user.fullname$"];
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      let logWhere = await helper.searchCondition(searchParam, searchable);

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

      if (tab) {
        if (tab.toLowerCase() === "working") {
          userWhere.currentStatus = 1;
          // logWhere.
        } else if (tab.toLowerCase() === "absent") {
          userWhere.currentStatus = 0;
        } else if (tab.toLowerCase() === "late") {
          logWhere.late_coming = true;
        }
      }
      logWhere.company_id = req.user.company_id;

      const alldata = await TimeLog.findAndCountAll({
        where: logWhere, // Filters for `workReports`
        offset,
        limit,
        attributes: ["id", "total_active_duration", "logged_in_time", "logged_out_time", "late_coming", "early_going"],
        include: [
          {
            model: User,
            as: "user",
            required: true,
            attributes: ["id", "fullname"],
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

  getFilterCount = async (req, res) => {
    try {
      let logWhere = {};
      let userWhere = {};
      let startOfDay;
      let endOfDay;

      startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      logWhere.updatedAt = { [Op.between]: [startOfDay, endOfDay] };

      userWhere.currentStatus = 1;


      const employeeCount = await User.count({
        where: {
          company_id: req.user.company_id, // Filters by `currentStatus` equals 1
          updatedAt: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      const workingCount = await User.count({
        where: {
          company_id: req.user.company_id,
          currentStatus: 1, // Filters by `currentStatus` equals 1
          updatedAt: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      const absentCount = await User.count({
        where: {
          company_id: req.user.company_id,
          currentStatus: 0, // Filters by `currentStatus` equals 1
          updatedAt: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      const lateCount = await TimeLog.count({
        distinct: true, 
        col: "user_id",
        where: {
          late_coming: true, // Filters by `currentStatus` equals 1
          createdAt: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      return helper.success(res, variables.Success, "All Data fetched Successfully!", { employeeCount: employeeCount, workingCount: workingCount, absentCount: absentCount, lateCount: lateCount });
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default teamMemberTimeLogController;
