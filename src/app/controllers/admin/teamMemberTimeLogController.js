import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import TimeLog from "../../../database/models/timeLogsModel.js";
import shift from "../../../database/models/shiftModel.js";
import User from "../../../database/models/userModel.js";
import { Op, Sequelize, QueryTypes, fn, col, where, literal } from "sequelize";
import AppHistoryEntry from "../../../database/models/AppHistoryEntry.js";
import { ProductiveApp } from "../../../database/models/ProductiveApp.js";
import commonfuncitons from "../../../utils/services/commonfuncitons.js";
import GenerateReportHelper from "../../../utils/services/GenerateReportHelper.js";
import moment from "moment";
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


  getTeamMemberLogFiltered2 = async (req, res) => {
    try {
      // ___________---------- Search, Limit, Pagination ----------_______________
      let { searchParam, limit, page, date, tab } = req.query;
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      let userWhere = {};
      let logWhere = {};
      // ___________---------- Search, Limit, Pagination ----------_______________

      let startOfDay;
      let endOfDay;
      let company_id = req.user.company_id;
      let userIds = [];

      if(date){
        startOfDay = moment.tz(date, "Asia/Kolkata").startOf("day").format("YYYY-MM-DD HH:mm:ss");
        endOfDay = moment.tz(date, "Asia/Kolkata").endOf("day").format("YYYY-MM-DD HH:mm:ss");
      }else{
        startOfDay = moment.tz(moment(), "Asia/Kolkata").startOf("day").format("YYYY-MM-DD HH:mm:ss");
        endOfDay = moment.tz(moment(), "Asia/Kolkata").endOf("day").format("YYYY-MM-DD HH:mm:ss");
      }
      logWhere.createdAt = { [Op.between]: [startOfDay, endOfDay] };

      logWhere.company_id = company_id;

      const alldata = await GenerateReportHelper.getUserInCompanyWithoutTeam(company_id);

      for (const user of alldata.data) {
        if (user.id) {
          userIds.push(user.id);
        }
      }
      
      const timeLogQuery2 = `SELECT
    u.id AS userId,
    u.fullname AS name,
    u.currentStatus AS currentStatus,
    s.start_time AS startTime,
    s.end_time AS endTime,
    t.logged_in_time AS logged_in_time,
    t.logged_out_time AS logged_out_time,
    t.early_going AS early_going,
    t.late_coming AS late_coming,
    IFNULL(SUM(t.active_time), 0) + IFNULL(SUM(t.spare_time), 0) + IFNULL(SUM(t.idle_time), 0) AS active_time,
    CASE 
        WHEN t.user_id IS NOT NULL THEN 'Present'
        ELSE 'Absent'
    END AS attendance,
    IFNULL(SUM(
        CASE 
            WHEN ah.is_productive = 1 THEN TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)
            ELSE 0
        END
    ), 0) AS total_productive_time_seconds, -- Calculate total productive time or return 0 if no data
    IFNULL(SUM(
        CASE 
            WHEN ah.is_productive = 0 THEN TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)
            ELSE 0
        END
    ), 0) AS total_non_productive_time_seconds -- Calculate total non-productive time or return 0 if no data
FROM 
    users u
LEFT JOIN 
    teams tm ON u.teamId = tm.id
LEFT JOIN 
    shifts s ON tm.shiftId = s.id
LEFT JOIN 
    timelogs t ON u.id = t.user_id
    AND t.createdAt BETWEEN :startOfDay AND :endOfDay
LEFT JOIN 
    app_histories ah ON u.id = ah.userId
    AND ah.startTime BETWEEN :startOfDay AND :endOfDay
WHERE 
    u.id IN (:userIds)
    AND u.createdAt <= :endOfDay
GROUP BY 
    u.id, u.fullname, s.id, t.logged_in_time, t.logged_out_time, t.early_going, t.late_coming, t.user_id;`
      const replacements = {
        startOfDay,
        endOfDay,
        userIds,
      };

      const results = await sequelize.query(timeLogQuery2, {
        type: Sequelize.QueryTypes.SELECT,
        replacements,
        logging: console.log
      });

      let updatedJson = commonfuncitons.createResponse2(results);

      if (searchParam) {
        const regex = new RegExp(searchParam, "i");
        updatedJson = updatedJson.filter((item) => regex.test(item.user.fullname));
      }

      if (tab) {
        if (tab.toLowerCase() === "working") {
          updatedJson = updatedJson.filter((item) => item.logged_out_time === null && item.logged_in_time !== null);
        } else if (tab.toLowerCase() === "absent") {
          updatedJson = updatedJson.filter((item) => item.logged_out_time === null && item.logged_in_time === null);
        } else if (tab.toLowerCase() === "late") {
          updatedJson = updatedJson.filter((item) => item.late_coming === 1);
        } else if (tab.toLowerCase() === "slacking") {
          updatedJson = updatedJson.filter((item) => item.user.is_slacking === true);
        } else if (tab.toLowerCase() === "productive") {
          updatedJson = updatedJson.filter((item) => item.user.is_productive === true && item.logged_in_time !== null && item.productiveTime !== "0h 0m 0s");
        } else if (tab.toLowerCase() === "nonproductive") {
          updatedJson = updatedJson.filter((item) => item.user.is_productive === false && item.logged_in_time !== null && item.productiveTime !== "0h 0m 0s" );
        }
      }

      const count = updatedJson.length;


      return helper.success(res, variables.Success, "All Data fetched Successfully!", { count: count, rows: updatedJson });
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
      let formattedDate;
      startOfDay = moment.tz(date, "Asia/Kolkata").startOf("day").format("YYYY-MM-DDTHH:mm:ssZ");

      // if (date) {
      //   startOfDay = new Date(date);
      //   startOfDay.setHours(0, 0, 0, 0);
      //   endOfDay = new Date(date);
      //   endOfDay.setHours(23, 59, 59, 999);
      //   formattedDate = new Date(date).toISOString().split('T')[0];

      //   logWhere.updatedAt = { [Op.between]: [startOfDay, endOfDay] };
      // } else {
      //   startOfDay = new Date();
      //   startOfDay.setHours(0, 0, 0, 0);
      //   endOfDay = new Date();
      //   endOfDay.setHours(23, 59, 59, 999);
      //   formattedDate = new Date().toISOString().split('T')[0];
      //   console.log(formattedDate);

      //   logWhere.updatedAt = { [Op.between]: [startOfDay, endOfDay] };
      // }
      if(date){
        startOfDay = moment.tz(date, "Asia/Kolkata").startOf("day").format("YYYY-MM-DD HH:mm:ss");
        endOfDay = moment.tz(date, "Asia/Kolkata").endOf("day").format("YYYY-MM-DD HH:mm:ss");
        formattedDate = new Date(date).toISOString().split('T')[0];
      }else{
        startOfDay = moment.tz(moment(), "Asia/Kolkata").startOf("day").format("YYYY-MM-DD HH:mm:ss");
        endOfDay = moment.tz(moment(), "Asia/Kolkata").endOf("day").format("YYYY-MM-DD HH:mm:ss");
        formattedDate = moment.tz(moment(), "Asia/Kolkata").endOf("day").format("YYYY-MM-DD HH:mm:ss");
      }
      logWhere.createdAt = { [Op.between]: [startOfDay, endOfDay] };

      console.log(startOfDay);
      console.log(endOfDay);
      console.log(formattedDate);


      userWhere.currentStatus = 1;
      let companyId = req.user.company_id;

      let employeeCount = await User.count({
        where: {
          company_id: companyId,
          status: 1,
          isAdmin:0,
          [Op.and]: Sequelize.literal(`DATE(createdAt) <= '${formattedDate}'`),
        },
      });
      if(!employeeCount) employeeCount = 0;

      let workingCount = await TimeLog.count({
        where: {
          company_id: companyId,
          logged_out_time: null,
          [Op.and]: Sequelize.literal(`DATE(createdAt) = '${formattedDate}'`),
        },
      });
      if(!workingCount) workingCount = 0;

      let absentCount = await User.count({
        where: {
          company_id: companyId,
          isAdmin:0,
          status: 1,
          [Op.and]: Sequelize.literal(`DATE(createdAt) <= '${formattedDate}'`),
          id: {
            [Op.notIn]: literal(`(
              SELECT user_id FROM timelogs 
              WHERE DATE(createdAt) = '${formattedDate}' AND company_id = ${companyId}
            )`),
          },
        },
      });
      if(!absentCount) absentCount = 0;


      let slackingCount = await TimeLog.count({
        where: {
          company_id: req.user.company_id,
          createdAt: { [Op.between]: [startOfDay, endOfDay] },
          idle_time: {
            [Op.gt]: Sequelize.literal("(0.4 * (active_time + spare_time + idle_time))"),
          },
        },
      });


      let lateCount = await TimeLog.count({
        where: {
          company_id: req.user.company_id,
          createdAt: { [Op.between]: [startOfDay, endOfDay] },
          late_coming: 1,
        },
      });
      if(!lateCount) lateCount = 0;


      //console.log({ startOfDay });
      console.log(startOfDay);
      let dateOnly = startOfDay.split(" ")[0];

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
            AND timelogs.date = :dateOnly AND appHistory.is_productive = 1
          GROUP BY timelogs.user_id
          HAVING totalTimeSpent >= 0.6 * totalTimeLog
        ) AS productiveEntries;`,
        {
          replacements: {
            company_id: req.user.company_id,
            dateOnly
          },
          type: QueryTypes.SELECT,
        }
      );

      let productiveCount = productiveResult.count;
      if(!productiveCount) productiveCount = 0;


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
            AND timelogs.date = :dateOnly AND appHistory.is_productive = 1
          GROUP BY timelogs.user_id
          HAVING totalTimeSpent <= 0.6 * totalTimeLog
        ) AS productiveEntries;`,
        {
          replacements: {
            company_id: req.user.company_id,
            dateOnly
          },
          type: QueryTypes.SELECT,
        }
      );

      let nonProductiveCount = nonProductiveResult.count;
      if(!nonProductiveCount) nonProductiveCount = 0;


      const countsData = [
        { count: employeeCount, name: "employee" },
        { count: workingCount, name: "working" },
        { count: absentCount, name: "absent" },
        { count: lateCount, name: "late" },
        { count: slackingCount, name: "slacking" },
        { count: productiveCount, name: "productive" },
        { count: nonProductiveCount, name: "nonproductive" },
      ];

      return helper.success(res, variables.Success, "All Data fetched Successfully!", { countsData: countsData, other: {} });
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default teamMemberTimeLogController;
