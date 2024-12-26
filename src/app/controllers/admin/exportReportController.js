import { Op, Sequelize, QueryTypes, literal, fn, col } from "sequelize";
import fs from "fs";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import exportReports from "../../../database/models/exportReportsModel.js";
import validate from "../../../utils/CustomValidation.js";
import team from "../../../database/models/teamModel.js";
import User from "../../../database/models/userModel.js";
import TimeLog from "../../../database/models/timeLogsModel.js";
import { UserHistory } from "../../../database/models/UserHistory.js";
import exportHistories from "../../../database/models/exportHistoryModel.js";
import department from "../../../database/models/departmentModel.js";
import GenerateReportHelper from "../../../utils/services/GenerateReportHelper.js";
import { endOfDay } from "date-fns";
import moment from "moment";

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

  getExportHistoryReport = async (req, res) => {
    try {
      // ___________---------- Search, Limit, Pagination ----------_______________
      let { searchParam, limit, page, date } = req.query;
      limit = parseInt(limit) || 10;
      let searchable = ["reportName"];
      let where = await helper.searchCondition(searchParam, searchable);
      where.company_id = req.user.company_id;
      let offset = (page - 1) * limit || 0;
      let startOfDay, endOfDay;

      if (date) {
        startOfDay = moment.tz(date, "Asia/Kolkata").startOf("day").format("YYYY-MM-DD HH:mm:ss");
        endOfDay = moment.tz(date, "Asia/Kolkata").endOf("day").format("YYYY-MM-DD HH:mm:ss");
      } else {
        startOfDay = moment.tz(moment(), "Asia/Kolkata").startOf("day").format("YYYY-MM-DD HH:mm:ss");
        endOfDay = moment.tz(moment(), "Asia/Kolkata").endOf("day").format("YYYY-MM-DD HH:mm:ss");
      }
      where.createdAt = { [Op.between]: [startOfDay, endOfDay] };
      // ___________---------- Search, Limit, Pagination ----------_______________

      const getStatus = await exportHistories.findAndCountAll({
        where: where,
        limit: limit,
        offset: offset,
        attributes: ["reportName", "reportExtension", "periodFrom", "periodTo", "filePath", [Sequelize.fn("DATE", Sequelize.col("createdAt")), "createdAt"]],
        order: [["createdAt", "DESC"]],
      });

      if (getStatus.count === 0) {
        return helper.success(res, variables.Success, "No Export Histories Found.", getStatus);
      }

      return helper.success(res, variables.Success, "Reports Data Retrieved Successfully", getStatus);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getProductiveReport = async (req, res) => {
    try {
      let { fromDate, toDate, definedPeriod, teamId, userId, format } = req.body;
      let startDate, endDate;

      const validOptions = [1, 2, 3, 4];

      if (!definedPeriod || !validOptions.includes(definedPeriod)) {
        return helper.failed(res, variables.BadRequest, "Please select a valid date option");
      }

      let date;

      if (definedPeriod) {
        if (definedPeriod == 4) {
          if (!fromDate || !toDate) {
            return helper.failed(res, variables.BadRequest, "Please select start and end date");
          }
          date = await helper.getDateRange(definedPeriod, fromDate, toDate);
        } else {
          date = await helper.getDateRange(definedPeriod);
        }
      }

      const users = await GenerateReportHelper.getUserInCompany(req.user.company_id);
      let userIds = [];
      for (const user of users.data) {
        if (user.id) {
          userIds.push(user.id);
        }
      }

      let ProdWebCount = await GenerateReportHelper.getProdWebCount(userIds, date.startDate, date.endDate);
      let ProdAppAnalysis = await GenerateReportHelper.getProdAppDetails(userIds, date.startDate, date.endDate);
      let TimeLogsDetails = await GenerateReportHelper.getProdAppDetails(userIds, date.startDate, date.endDate);

      // let finalJson = await GenerateReportHelper.combineJson(users, ProdWebCount)

      let data = [];
      let headers = [
        "Employee Name",
        "Department",
        "Date",
        "Total Active Hours",
        "Idle time",
        "Time on Productive Apps",
        "Time on Non Productive Apps",
        "Productive Websites",
        "Non Productive Websites",
        "Average Productive %",
        "Most Used Productive App",
      ];

      const result = await GenerateReportHelper.downloadFileDynamically(res, date.startDate, date.endDate, format, "Productive Report", req.user.company_id, data, headers);

      if (result.status) {
        return helper.success(res, variables.Success, "Productivity Report Generated Successfully", data);
      } else {
        return helper.success(res, variables.Success, "Productivity Report Generation Failed");
      }
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  // getAttendanceReport = async (req, res) => {
  //   try {
  //     let { fromDate, toDate, definedPeriod, format, teamId, userId, limit, offset } = req.body;
  //     if (!format) format = "xls";
  //     if (format && !["xls", "pdf"].includes(format)) {
  //       return helper.failed(res, variables.BadRequest, 'Invalid format. Only xls or pdf are allowed');
  //     }
  //     if (!teamId) return helper.failed(res, variables.ValidationError, "Team Id is required");

  //     const validOptions = [1, 2, 3, 4];

  //     if (!definedPeriod || !validOptions.includes(definedPeriod)) {
  //       return helper.failed(res, variables.BadRequest, "Please select a valid date option");
  //     }

  //     let date;

  //     if (definedPeriod) {
  //       if (definedPeriod == 4) {
  //         if (!fromDate || !toDate) {
  //           return helper.failed(res, variables.BadRequest, "Please select start and end date");
  //         }
  //         date = await helper.getDateRange(definedPeriod, fromDate, toDate);
  //       } else {
  //         date = await helper.getDateRange(definedPeriod);
  //       }
  //     }

  //     // Fetch attendance report
  //     const attendanceReport = await TimeLog.sequelize.query(
  //       `SELECT
  //         u.fullname AS employee_name,
  //         team.name AS team,
  //         timelog.date AS date,
  //         DAYNAME(timelog.date) AS day,
  //         CASE
  //           WHEN timelog.logged_in_time IS NOT NULL THEN 'Present'
  //           ELSE 'Absent'
  //         END AS attendance_status,
  //         shifts.start_time AS shift_time_in,
  //         timelog.logged_in_time AS time_in,
  //         shifts.end_time AS shift_time_out,
  //         timelog.logged_out_time AS time_out
  //       FROM timelogs AS timelog
  //       LEFT JOIN users AS u ON timelog.user_id = u.id
  //       JOIN teams AS team ON u.teamId = team.id
  //       JOIN shifts AS shifts ON timelog.shift_id = shifts.id
  //       WHERE timelog.date BETWEEN :startDate AND :endDate AND u.company_id = :company_id AND u.isAdmin = 0
  //       ${teamId ? "AND team.id = :teamId" : ""}
  //       ${userId ? "AND u.id = :userId" : ""}
  //       ORDER BY timelog.date DESC
  //       `,
  //       {
  //         replacements: {
  //           company_id: req.user.company_id,
  //           startDate: date.startDate,
  //           endDate: date.endDate,
  //           teamId,
  //           userId,
  //           limit: limit || 10,
  //           offset: offset || 0,
  //         },
  //         type: QueryTypes.SELECT,
  //       }
  //     );

  //     let headers = ["Employee Name", "Team", "Date", "Day", "Attendance Status", "Shift Time In", "Shift Time Out", "Time Out"];

  //     const result = await GenerateReportHelper.downloadFileDynamically(res, date.startDate, date.endDate, format, "Attendance Report", req.user.company_id, attendanceReport, headers);
  //     if (result.status) {
  //       return helper.success(res, variables.Success, "Attendance Report Generated Successfully");
  //     } else {
  //       return helper.success(res, variables.Success, "Attendance Report Generation Failed");
  //     }
  //   } catch (error) {
  //     return helper.failed(res, variables.BadRequest, error.message);
  //   }
  // };

  getAttendanceReport = async (req, res) => {
    try {
      const { fromDate, toDate, definedPeriod, format, teamId, userId, limit, offset } = req.body;
      if (!format) format = "xls";
      if (format && !["xls", "pdf"].includes(format)) {
        throw new Error('Invalid format. Only "xls" or "pdf" are allowed.');
      }
      if (!teamId) return helper.failed(res, variables.ValidationError, "Team Id is required");

      const validOptions = [1, 2, 3, 4];

      if (!definedPeriod || !validOptions.includes(definedPeriod)) {
        return helper.failed(res, variables.BadRequest, "Please select a valid date option");
      }

      let date;

      if (definedPeriod) {
        if (definedPeriod == 4) {
          if (!fromDate || !toDate) {
            return helper.failed(res, variables.BadRequest, "Please select start and end date");
          }
          date = await helper.getDateRange(definedPeriod, fromDate, toDate);
        } else {
          date = await helper.getDateRange(definedPeriod);
        }
      }

      const attendanceReport = [];
      const presentUsersReport = await TimeLog.sequelize.query(
        `SELECT u.fullname AS employee_name, team.name AS team, timelog.date AS date, DAYNAME(timelog.date) AS day, CASE WHEN timelog.logged_in_time IS NOT NULL THEN 'Present' ELSE 'Absent' END AS attendance_status, shifts.start_time AS shift_time_in, timelog.logged_in_time AS time_in, shifts.end_time AS shift_time_out, timelog.logged_out_time AS time_out
        FROM timelogs AS timelog LEFT JOIN users AS u ON timelog.user_id = u.id JOIN teams AS team ON u.teamId = team.id JOIN shifts AS shifts ON timelog.shift_id = shifts.id WHERE timelog.date BETWEEN :startDate AND :endOfDay AND u.company_id = :company_id AND u.isAdmin = 0
        ${teamId ? "AND team.id = :teamId" : ""}
        ${userId ? "AND u.id = :userId" : ""}
        AND u.createdAt <= :endOfDay
        ORDER BY timelog.date DESC`,
        {
          replacements: {
            company_id: req.user.company_id,
            startDate: date.startDate,
            endOfDay: date.endDate,
            teamId,
            userId,
            limit: limit || 10,
            offset: offset || 0,
          },
          type: QueryTypes.SELECT,
        }
      );

      const presentUsers = await TimeLog.findAll({
        attributes: ["user_id"],
        include: [
          {
            model: User,
            as: "user",
            attributes: [],
            where: {
              isAdmin: 0,
            },
          },
        ],
        where: {
          company_id: req.user.company_id,
          date: {
            [Op.between]: [date.startDate, date.endDate],
          },
        },
        group: ["user_id"],
      });

      const absentUsersReport = await TimeLog.sequelize.query(
        `SELECT u.fullname AS employee_name, team.name AS team, 'N/A' AS date, 'N/A' AS day, 'Absent' AS attendance_status, shifts.start_time AS shift_time_in, 'N/A' AS time_in, shifts.end_time AS shift_time_out, 'N/A' AS time_out
         FROM users AS u
    
         LEFT JOIN teams AS team
         ON u.teamId = team.id
        LEFT JOIN shifts AS shifts
         ON team.shiftId = shifts.id
         WHERE u.company_id = :company_id
         AND u.isAdmin = 0
         ${teamId ? "AND team.id = :teamId" : ""}
        ${userId ? "AND u.id = :userId" : ""}
        AND u.createdAt <= :endOfDay
         AND u.id NOT IN (:presentUserIds)
         ORDER BY u.fullname ASC`,
        {
          replacements: {
            company_id: req.user.company_id,
            endOfDay: date.endDate,
            teamId,
            userId,
            presentUserIds: presentUsers.length > 0 ? presentUsers.map((user) => user.user_id) : [-1],
          },
          type: QueryTypes.SELECT,
        }
      );

      attendanceReport.push(...absentUsersReport);
      attendanceReport.push(...presentUsersReport);

      let headers = ["Employee Name", "Team", "Date", "Day", "Attendance Status", "Shift Time In", "Time in", "Shift Time Out", "Time Out"];

      const result = await GenerateReportHelper.downloadFileDynamically(res, date.startDate, date.endDate, format, "Attendance Report", req.user.company_id, attendanceReport, headers);
      if (result.status) {
        return helper.success(res, variables.Success, "Attendance Report Generated Successfully");
      } else {
        return helper.success(res, variables.Success, "Attendance Report Generation Failed");
      }
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getApplicationUsageReport = async (req, res) => {
    try {
      let { fromDate, toDate, definedPeriod, teamId, userId, format } = req.body;
      if (!format) format = "xls";
      if (format && !["xls", "pdf"].includes(format)) {
        return helper.failed(res, variables.BadRequest, 'Invalid format. Only "xls" or "pdf" are allowed.');
      }

      if (!teamId) return helper.failed(res, variables.BadRequest, "Team must be selected");

      const validOptions = [1, 2, 3, 4];

      if (!definedPeriod || !validOptions.includes(definedPeriod)) {
        return helper.failed(res, variables.BadRequest, "Please select a valid date option");
      }

      let date;
      const companyId = req.user.company_id;

      if (definedPeriod) {
        if (definedPeriod == 4) {
          if (!fromDate || !toDate) {
            return helper.failed(res, variables.BadRequest, "Please select start and end date");
          }
          date = await helper.getDateRange(definedPeriod, fromDate, toDate);
        } else {
          date = await helper.getDateRange(definedPeriod);
        }
      }

      const applicationUsage = await UserHistory.sequelize.query(
        `
                            WITH AppUsageData AS (
                      SELECT 
                          u.fullname,
                          u.departmentId,
                          ah.appName,
                          ah.is_productive AS productivity_status,
                          TIMESTAMPDIFF(MINUTE, ah.startTime, ah.endTime) AS time_spent_minutes
                      FROM app_histories AS ah
                      INNER JOIN users AS u ON ah.userId = u.id AND ah.company_id = u.company_id
                      LEFT JOIN teams AS team ON u.teamId = team.id
                      WHERE 
                          ah.company_id = :companyId
                          AND ah.createdAt BETWEEN :startDate AND :endDate
                          ${userId ? "AND u.id = :userId" : ""}
                          ${teamId ? "AND team.id = :teamId" : ""}
                          AND u.isAdmin = 0 -- Exclude admin users
                  )

                  SELECT 
                      aud.appName,
                      aud.productivity_status,
                      SUM(aud.time_spent_minutes) AS total_time_minutes,
                      d.name AS department_name
                  FROM AppUsageData aud
                  LEFT JOIN departments d ON aud.departmentId = d.id -- Join to get department name
                  GROUP BY aud.appName, aud.productivity_status, d.name;
                  `,
        {
          type: QueryTypes.SELECT,
          replacements: {
            companyId,
            startDate: date.startDate,
            endDate: date.endDate,
            teamId,
            userId,
          },
        }
      );

      let headers = ["Name", "Department", "Application", "Productive/Non Producitve"];

      const result = await GenerateReportHelper.downloadFileDynamically(res, date.startDate, date.endDate, format, "Application Usage Report", req.user.company_id, applicationUsage, headers);
      if (result.status) {
        return helper.success(res, variables.Success, "Application Usage Report Generated Successfully");
      } else {
        return helper.success(res, variables.Success, "Application Usage Report Generation Failed");
      }
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getDeptPerformReport = async (req, res) => {
    try {
      let { company_id } = req.user;
      let { definedPeriod, fromDate, toDate, format, teamId } = req.body;
      if (!format) format = "xls";
      if (format && !["xls", "pdf"].includes(format)) {
        return helper.failed(res, variables.BadRequest, 'Invalid format. Only "xls" or "pdf" are allowed.');
      }

      // if (!teamId) return helper.failed(res, variables.BadRequest, "Team must be selected");

      let dateRange;

      if (definedPeriod) {
        if (definedPeriod == 4) {
          if (!fromDate || !toDate) {
            return helper.failed(res, variables.BadRequest, "Please select start and end date");
          }
          dateRange = await helper.getDateRange(definedPeriod, fromDate, toDate);
        } else {
          dateRange = await helper.getDateRange(definedPeriod);
        }
      }
      const allDepartments = await department.findAll({
        where: { company_id: req.user.company_id, status: 1 },
      });

      const performanceArray = [];
      for (const element of allDepartments) {
        const totalEmployeesDepartmentWise = await GenerateReportHelper.getTotalEmployeeDepartmentWise(element.id, dateRange, "user_ids");
        console.log(totalEmployeesDepartmentWise);
        //getting attendance average
        const avgAttendence = await GenerateReportHelper.getAttendanceAvg(dateRange, totalEmployeesDepartmentWise, company_id);
        //getting logged in time average
        const avgLoggedInTime = await GenerateReportHelper.getAvgLoggedInTime(dateRange, totalEmployeesDepartmentWise);
        const avgProductiveAppTime = await GenerateReportHelper.getAvgProductiveAppTime(dateRange, totalEmployeesDepartmentWise, company_id);
        const avgNonProductiveAppTime = await GenerateReportHelper.getAvgNonProductiveAppTime(dateRange, totalEmployeesDepartmentWise, company_id);
        const mostUnproductiveWebsiteName = await GenerateReportHelper.mostUnproductiveWebsiteName(dateRange, totalEmployeesDepartmentWise, company_id);
        const mostproductiveWebsiteName = await GenerateReportHelper.mostProductiveWebsiteName(dateRange, totalEmployeesDepartmentWise, company_id);
        const mostUnproductiveAppName = await GenerateReportHelper.mostUnproductiveAppName(dateRange, totalEmployeesDepartmentWise, company_id);
        const mostproductiveAppName = await GenerateReportHelper.mostproductiveAppName(dateRange, totalEmployeesDepartmentWise, company_id);

        const obj = {
          department_name: element.name,
          total_employee: totalEmployeesDepartmentWise.length,
          attendance_avg: avgAttendence,
          loggedin_time_avg: avgLoggedInTime,
          productive_app_time: avgProductiveAppTime,
          non_productive_app_time: avgNonProductiveAppTime,
          most_non_productive_website: mostUnproductiveWebsiteName,
          most_productive_website: mostproductiveWebsiteName,
          most_non_productive_app_name: mostUnproductiveAppName,
          most_productive_app: mostproductiveAppName,
        };

        performanceArray.push(obj);
      }

      let headers = [
        "Department",
        "Total Employees",
        "Average Attendance Rate",
        "Average Login Time",
        "Average Productive Time (App)",
        "Average Non Productive Time (App)",
        "Most Non Productive Website",
        "Most Productive Website",
        "Most Non Productive App",
        "Most Productive App",
      ];

      const result = await GenerateReportHelper.downloadFileDynamically(
        res,
        dateRange.startDate,
        dateRange.endDate,
        format,
        "Department Performance Report",
        req.user.company_id,
        performanceArray,
        headers
      );
      if (result.status) {
        return helper.success(res, variables.Success, "Department Performance Report Generated Successfully");
      } else {
        return helper.success(res, variables.Success, "Department Performance Report Generation Failed");
      }
    } catch (error) {
      console.log(`departmentPerformanceReport ${error.message}`);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getUnauthorizedWebReport = async (req, res) => {
    try {
      let companyId = req.user.company_id;
      let { fromDate, toDate, definedPeriod, teamId, userId, format } = req.body;
      if (!format) format = "xls";
      if (format && !["xls", "pdf"].includes(format)) {
        return helper.failed(res, variables.BadRequest, 'Invalid format. Only "xls" or "pdf" are allowed.');
      }

      const validOptions = [1, 2, 3, 4];

      if (!teamId) return helper.failed(res, variables.BadRequest, "Team must be selected");

      if (!definedPeriod || !validOptions.includes(definedPeriod)) {
        return helper.failed(res, variables.BadRequest, "Please select a valid date option");
      }

      let date;
      if (definedPeriod) {
        if (definedPeriod == 4) {
          if (!fromDate || !toDate) {
            return helper.failed(res, variables.BadRequest, "Please select start and end date");
          }
          date = await helper.getDateRange(definedPeriod, fromDate, toDate);
        } else {
          date = await helper.getDateRange(definedPeriod);
        }
      }

      // Query to fetch unauthorized access
      const unauthorizedAccessReport = await UserHistory.sequelize.query(
        `SELECT u.fullname AS name,departments.name AS department, uh.url AS url,TIME(uh.visitTime) AS time
        FROM  user_histories As uh
        INNER JOIN users As u ON uh.userId = u.id
        INNER JOIN departments ON u.departmentId = departments.id
        WHERE uh.website_name not in(select website_name from productive_websites where company_id=:companyId) and uh.company_id = :companyId
            AND uh.date BETWEEN :startDate AND :endDate   ${teamId ? "AND u.teamId = :teamId" : ""} AND u.isAdmin = 0
        ${userId ? "AND u.id = :userId" : ""}
        ORDER BY uh.visitTime DESC`,
        {
          type: QueryTypes.SELECT,
          replacements: {
            companyId,
            startDate: date.startDate,
            endDate: date.endDate,
            teamId,
            userId,
          },
        }
      );

      let headers = ["Name", "Department", "Url", "Time"];

      const result = await GenerateReportHelper.downloadFileDynamically(res, date.startDate, date.endDate, format, "Unauthorized Web Report", req.user.company_id, unauthorizedAccessReport, headers);
      if (result.status) {
        return helper.success(res, variables.Success, "Unauthorized Web Report Generated Successfully");
      } else {
        return helper.success(res, variables.Success, "Unauthorized Web Report Generation Failed");
      }
    } catch (error) {
      console.error("Error fetching unauthorized access report:", error);
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
      let { fromDate, toDate, definedPeriod, format, teamId, userId } = req.body;
      if (!format) format = "xls";
      if (format && !["xls", "pdf"].includes(format)) {
        return helper.failed(res, variables.BadRequest, 'Invalid format. Only "xls" or "pdf" are allowed.');
      }

      if (!teamId) {
        return helper.failed(res, variables.BadRequest, "Please select the team");
      }

      const validOptions = [1, 2, 3, 4];

      if (!definedPeriod || !validOptions.includes(definedPeriod)) {
        return helper.failed(res, variables.BadRequest, "Please select a valid date option");
      }

      let date;
      if (definedPeriod) {
        if (definedPeriod == 4) {
          if (!fromDate || !toDate) {
            return helper.failed(res, variables.BadRequest, "Please select start and end date");
          }
          date = await helper.getDateRange(definedPeriod, fromDate, toDate);
        } else {
          date = await helper.getDateRange(definedPeriod);
        }
      }
      if (date && date.status == 0) {
        return helper.failed(res, variables.BadRequest, date.message);
      }

      let browserHistroy;

      if (teamId && userId) {
        const team = await User.findOne({
          where: {
            teamId: teamId,
            id: userId,
            company_id: req.user.company_id,
          },
        });
        if (!team) {
          return helper.failed(res, variables.BadRequest, "User not found!!!");
        }
        browserHistroy = await UserHistory.findAll({
          where: {
            userId: userId,
            createdAt: {
              [Op.between]: [date.startDate, date.endDate],
            },
          },
          attributes: ["id", "userId", "company_id", "website_name", "url", "title", "visitTime"],
        });
      } else {
        const team = await User.findAll({
          where: {
            teamId: teamId,
            company_id: req.user.company_id,
          },
          attributes: ["id"],
        });
        if (!team || team.length === 0) {
          return helper.failed(res, variables.BadRequest, "User not found!!!");
        }
        const userIds = team.map((user) => user.id);

        browserHistroy = await UserHistory.findAll({
          where: {
            userId: {
              [Op.in]: userIds,
            },
            createdAt: {
              [Op.between]: [date.startDate, date.endDate],
            },
          },
          attributes: ["id", "userId", "company_id", "website_name", "url", "title", "visitTime"],
        });
      }
      let headers = ["Name", "Department", "Url", "Productive/Non-Productivity", "Time Spent"];

      const result = await GenerateReportHelper.downloadFileDynamically(res, date.startDate, date.endDate, format, "Browser History Report", req.user.company_id, browserHistroy, headers);
      if (result.status) {
        return helper.success(res, variables.Success, "Browser History Report Generated Successfully");
      } else {
        return helper.success(res, variables.Success, "Browser History Report Generation Failed");
      }
    } catch (error) {
      console.log("Error while generating browser history report:", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  downloadExportReport = async (req, res) => {
    let { filePath } = req.body;

    if (typeof filePath !== "string" || !filePath.trim()) {
      return helper.failed(res, variables.BadRequest, "Invalid file path provided");
    }
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error("File not found:", err);
        return helper.failed(res, variables.BadRequest, "File not found");
      }

      return res.download(filePath, (err) => {
        if (err) {
          console.error("Error sending XLS file:", err);
          return helper.failed(res, variables.BadRequest, "File download failed");
        }
      });
    });
  };
}

export default exportReportController;
