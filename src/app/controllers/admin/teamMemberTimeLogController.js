import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import TimeLog from "../../../database/models/teamLogsModel.js";
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


      // Add date range filter to `reportWhere`
      // if (startDate && endDate) {
      //   logWhere.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      // } else if (startDate) {
      //   logWhere.createdAt = { [Op.gte]: new Date(startDate) };
      // } else if (endDate) {
      //   logWhere.createdAt = { [Op.lte]: new Date(endDate) };
      // }

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
      
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
      
        logWhere.createdAt = { [Op.between]: [startOfDay, endOfDay] };
      }

      // if (startDate && endDate) {
      //   logWhere.logged_in_time = { [Op.gte]: new Date(startDate) }; // Greater than or equal to startDate
      //   logWhere.logged_out_time = { [Op.lte]: new Date(endDate) }; // Less than or equal to endDate
      // } else if (startDate) {
      //   logWhere.logged_in_time = { [Op.gte]: new Date(startDate) }; // Only filter by startDate
      // } else if (endDate) {
      //   logWhere.logged_out_time = { [Op.lte]: new Date(endDate) }; // Only filter by endDate
      // }

      logWhere.company_id = req.user.company_id;
      const alldata = await TimeLog.findAndCountAll({
        where: logWhere, // Filters for `workReports`
        offset,
        limit,
        // group: ["user_id"],
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

      
      const workingEmpCount = await User.count({
        where: {
          // Your conditions go here, for example:
          currentStatus: 1,
          shift_id: 1, // Example condition
        },
      });

      

      return helper.success(res, variables.Success, "All Data fetched Successfully!", alldata);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getTeamMemberLogFiltered = async (req, res) => {
    try {
      // Search Parameter filters and pagination code >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      let { searchParam, limit, page,date,tab } = req.query;
      let searchable = ["$user.fullname$"];
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      let logWhere = await helper.searchCondition(searchParam, searchable);

      // Add date range tab to `reportWhere`
      // if (startDate && endDate) {
      //   logWhere.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      // } else if (startDate) {
      //   logWhere.createdAt = { [Op.gte]: new Date(startDate) };
      // } else if (endDate) {
      //   logWhere.createdAt = { [Op.lte]: new Date(endDate) };
      // }

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
      
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
      
        logWhere.createdAt = { [Op.between]: [startOfDay, endOfDay] };
      }

      // if (startDate && endDate) {
      //   logWhere.logged_in_time = { [Op.gte]: new Date(startDate) }; // Greater than or equal to startDate
      //   logWhere.logged_out_time = { [Op.lte]: new Date(endDate) }; // Less than or equal to endDate
      // } else if (startDate) {
      //   logWhere.logged_in_time = { [Op.gte]: new Date(startDate) }; // Only tab by startDate
      // } else if (endDate) {
      //   logWhere.logged_out_time = { [Op.lte]: new Date(endDate) }; // Only tab by endDate
      // }
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
        where: logWhere, // Filters for `workReports`
        offset,
        limit,
        // group: ["user_id"],
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
}

export default teamMemberTimeLogController;
