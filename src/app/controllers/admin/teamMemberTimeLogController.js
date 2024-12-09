import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import TimeLog from "../../../database/models/teamLogsModel.js";
import { group } from "console";
import shift from "../../../database/models/shiftModel.js";
import User from "../../../database/models/userModel.js";

class teamMemberTimeLogController {
  getAllTeamMemberLog = async (req, res) => {
    try {
      // Search Parameter filters and pagination code >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      let { searchParam, limit, page, startDate, endDate } = req.query;
      let searchable = ["name", "status"];
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      // let where = await helper.searchCondition(searchParam, searchable);

      const logWhere = {};

      // Add date range filter to `reportWhere`
      // if (startDate && endDate) {
      //   logWhere.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      // } else if (startDate) {
      //   logWhere.createdAt = { [Op.gte]: new Date(startDate) };
      // } else if (endDate) {
      //   logWhere.createdAt = { [Op.lte]: new Date(endDate) };
      // }
      if (startDate && endDate) {
        logWhere.logged_in_time = { [Op.gte]: new Date(startDate) }; // Greater than or equal to startDate
        logWhere.logged_out_time = { [Op.lte]: new Date(endDate) }; // Less than or equal to endDate
      } else if (startDate) {
        logWhere.logged_in_time = { [Op.gte]: new Date(startDate) }; // Only filter by startDate
      } else if (endDate) {
        logWhere.logged_out_time = { [Op.lte]: new Date(endDate) }; // Only filter by endDate
      }

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

      return helper.success(res, variables.Success, "All Data fetched Successfully!", alldata);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getTeamMemberLogFiltered = async (req, res) => {
    try {
      // Search Parameter filters and pagination code >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      let { searchParam, limit, page, startDate, endDate, filter } = req.query;
      let searchable = ["name", "status"];
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      // let where = await helper.searchCondition(searchParam, searchable);

      const logWhere = {};
      const userWhere = {};

      console.log(filter);
      // Add date range filter to `reportWhere`
      // if (startDate && endDate) {
      //   logWhere.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      // } else if (startDate) {
      //   logWhere.createdAt = { [Op.gte]: new Date(startDate) };
      // } else if (endDate) {
      //   logWhere.createdAt = { [Op.lte]: new Date(endDate) };
      // }
      if (startDate && endDate) {
        logWhere.logged_in_time = { [Op.gte]: new Date(startDate) }; // Greater than or equal to startDate
        logWhere.logged_out_time = { [Op.lte]: new Date(endDate) }; // Less than or equal to endDate
      } else if (startDate) {
        logWhere.logged_in_time = { [Op.gte]: new Date(startDate) }; // Only filter by startDate
      } else if (endDate) {
        logWhere.logged_out_time = { [Op.lte]: new Date(endDate) }; // Only filter by endDate
      }
      if (filter) {
        if (filter.toLowerCase() === "working") {
          userWhere.currentStatus = 1;
        } else if (filter.toLowerCase() === "absent") {
          userWhere.currentStatus = 0;
        } else if (filter.toLowerCase() === "late") {
          logWhere.late_coming = true;
        }
      }

      console.log(userWhere);
      const alldata = await TimeLog.findAndCountAll({
        logWhere, // Filters for `workReports`
        offset,
        limit,
        // group: ["user_id"],
        attributes: ["id", "total_active_duration", "logged_in_time", "logged_out_time", "late_coming", "early_going"],
        include: [
          {
            model: User,
            as: "user",
            where: userWhere, // Use `where` instead of `userWhere`
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
}

export default teamMemberTimeLogController;
