import path from "path";
import fs from "fs";
import { Op, Sequelize, QueryTypes, literal, fn, col } from "sequelize";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import exportReports from "../../../database/models/exportReportsModel.js";
import validate from "../../../utils/CustomValidation.js";
import team from "../../../database/models/teamModel.js";
import User from "../../../database/models/userModel.js";
import TimeLog from "../../../database/models/timeLogsModel.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { UserHistory } from '../../../database/models/UserHistory.js';
import { fileURLToPath } from "url";
import exportHistories from '../../../database/models/exportHistoryModel.js';
import department from "../../../database/models/departmentModel.js";
import moment from "moment";
import sequelize from "../../../database/queries/dbConnection.js";
import GenerateReportHelper from "../../../utils/services/GenerateReportHelper.js";

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
    try {
      let { fromTime, toTime, definedPeriod, teamId, userId, format } = req.body;
      let startDate, endDate;

      const today = new Date();

      if (definedPeriod === 1) {
        startDate = new Date(today.setDate(today.getDate() - 1));
        endDate = new Date(startDate);
      } else if (definedPeriod === 2) {
        const lastSunday = new Date(today.setDate(today.getDate() - today.getDay() - 7));
        const lastSaturday = new Date(lastSunday);
        lastSaturday.setDate(lastSunday.getDate() + 6);
        startDate = lastSunday;
        endDate = lastSaturday;
      } else if (definedPeriod === 3) {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        startDate = lastMonth;
        endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
      } else if (definedPeriod === 4) {
        const rules = { fromTime: "required", toTime: "required" };
        const { status, message } = await validate(req.body, rules);
        if (status === 0) {
          return helper.failed(res, variables.ValidationError, message);
        }
        startDate = new Date(fromTime);
        endDate = new Date(toTime);
      } else {
        return helper.failed(res, variables.ValidationError, "Invalid definedPeriod provided.");
      }

      const users = await GenerateReportHelper.getUserInCompany(req.user.company_id);
      let userIds = [];
      for (const user of users.data) {
        if (user.id) {
          userIds.push(user.id);
        }
      }

      let ProdWebCount = await GenerateReportHelper.getProdWebCount(userIds, startDate, endDate);
      let ProdAppAnalysis = await GenerateReportHelper.getProdAppDetails(userIds, startDate, endDate);

      return helper.success(res, variables.Success, "User Updated Successfully", { users: users.data, productiveWebsites: ProdWebCount, productiveApps: ProdAppAnalysis });
    } catch (error) {
      // if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  downloadFile = async (req, res, company_id, reportData, format, reportDescription, fromTime, toTime) => {
    try {
      const fileName = `${reportDescription}_${company_id}_${Date.now()}.${format === "xls" ? "xlsx" : "pdf"}`;
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const filePath = path.resolve(__dirname, "../../../storage/files", fileName);
      if (format === "xls") {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(reportDescription);

        if (reportDescription == "Attendance Report") {
          worksheet.columns = [
            { header: "Employee Name", key: "employee_name", width: 20 },
            { header: "Team", key: "team", width: 15 },
            { header: "Date", key: "date", width: 15 },
            { header: "Day", key: "day", width: 10 },
            { header: "Attendance Status", key: "attendance_status", width: 20 },
            { header: "Shift Time In", key: "shift_time_in", width: 15 },
            { header: "Time In", key: "time_in", width: 15 },
            { header: "Shift Time Out", key: "shift_time_out", width: 15 },
            { header: "Time Out", key: "time_out", width: 15 },
          ];
        } else if (reportDescription == "Productivity Report") {
          worksheet.columns = [
            { header: "Employee Name", key: "employee_name", width: 20 },
            { header: "Department", key: "department", width: 15 },
            { header: "Date", key: "date", width: 15 },
            { header: "Total Active Hours", key: "total_active_hours", width: 10 },
            { header: "Idle Time", key: "idle_time", width: 20 },
            { header: "Time on Productive Apps", key: "productive_app_time", width: 15 },
            { header: "Time on Non Prodcutive Apps", key: "nonProductive_app_time", width: 15 },
            { header: "Productive Websites Count", key: "productive_website_count", width: 15 },
            { header: "Non Productive Websites Count", key: "productive_website_count", width: 15 },
            { header: "Average Productive Percentage", key: "average_productive", width: 15 },
            { header: "Most Used Productive App", key: "most_used_productive_app", width: 15 },
          ];
        } else if (reportDescription == "Application Usage Report") {
          worksheet.columns = [
            { header: "Name", key: "name", width: 20 },
            { header: "Department", key: "department", width: 15 },
            { header: "Application", key: "applicationName", width: 15 },
            { header: "Productive/NonProducitve", key: "isProductive", width: 10 },
          ];
        } else if (reportDescription == "Unauthorized Report") {
          worksheet.columns = [
            { header: "Name", key: "name", width: 20 },
            { header: "Department", key: "department", width: 15 },
            { header: "URL", key: "url", width: 15 },
            { header: "Time", key: "time", width: 10 },
          ];
        } else if (reportDescription == "Department Performance Report") {
          worksheet.columns = [
            { header: "Employee Name", key: "employee_name", width: 20 },
            { header: "Team", key: "team", width: 15 },
            { header: "Date", key: "date", width: 15 },
            { header: "Day", key: "day", width: 10 },
            { header: "Attendance Status", key: "attendance_status", width: 20 },
            { header: "Shift Time In", key: "shift_time_in", width: 15 },
            { header: "Time In", key: "time_in", width: 15 },
            { header: "Shift Time Out", key: "shift_time_out", width: 15 },
            { header: "Time Out", key: "time_out", width: 15 },
          ];
        } else if (reportDescription == "Browser Activity Report") {
          worksheet.columns = [
            { header: "Employee Name", key: "employee_name", width: 20 },
            { header: "Team", key: "team", width: 15 },
            { header: "Date", key: "date", width: 15 },
            { header: "Day", key: "day", width: 10 },
            { header: "Attendance Status", key: "attendance_status", width: 20 },
            { header: "Shift Time In", key: "shift_time_in", width: 15 },
            { header: "Time In", key: "time_in", width: 15 },
            { header: "Shift Time Out", key: "shift_time_out", width: 15 },
            { header: "Time Out", key: "time_out", width: 15 },
          ];
        }

        worksheet.addRows(reportData);

        await workbook.xlsx.writeFile(filePath);

        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
        res.download(filePath);

        const newAppInfo = await exportHistories.create({ reportName: reportDescription, filePath: filePath, reportExtension: format, periodFrom: fromTime, periodTo: toTime });
      } else {
        const generatePDF = () =>
          new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const writeStream = fs.createWriteStream(filePath);

            doc.pipe(writeStream);

            // Add title
            doc.fontSize(18).text(reportDescription, { align: "center" });
            doc.moveDown();

            // Add headers
            if (reportDescription == "Attendance Report") {
              doc.fontSize(12).text(
                "Employee Name | Team | Date | Day | Attendance Status | Shift Time In | Time In | Shift Time Out | Time Out",
                { underline: true }
              );
              doc.moveDown();

              reportData.forEach((row) => {
                doc
                  .fontSize(10)
                  .text(
                    `${row.employee_name} | ${row.team} | ${row.date} | ${row.day} | ${row.attendance_status} | ${row.shift_time_in} | ${row.time_in} | ${row.shift_time_out} | ${row.time_out}`
                  );
              });

            } else if (reportDescription == "Performance Report") {
              doc.fontSize(12).text(
                "Employee Name | Team | Date | Day | Attendance Status | Shift Time In | Time In | Shift Time Out | Time Out",
                { underline: true }
              );
              doc.moveDown();

              reportData.forEach((row) => {
                doc
                  .fontSize(10)
                  .text(
                    `${row.employee_name} | ${row.team} | ${row.date} | ${row.day} | ${row.attendance_status} | ${row.shift_time_in} | ${row.time_in} | ${row.shift_time_out} | ${row.time_out}`
                  );
              });
            } else if (reportDescription == "Application Report") {
              doc.fontSize(12).text(
                "Employee Name | Team | Date | Day | Attendance Status | Shift Time In | Time In | Shift Time Out | Time Out",
                { underline: true }
              );
              doc.moveDown();

              reportData.forEach((row) => {
                doc
                  .fontSize(10)
                  .text(
                    `${row.employee_name} | ${row.team} | ${row.date} | ${row.day} | ${row.attendance_status} | ${row.shift_time_in} | ${row.time_in} | ${row.shift_time_out} | ${row.time_out}`
                  );
              });
            } else if (reportDescription == "Unauthorized Report") {
              doc.fontSize(12).text(
                "Employee Name | Team | Date | Day | Attendance Status | Shift Time In | Time In | Shift Time Out | Time Out",
                { underline: true }
              );
              doc.moveDown();

              reportData.forEach((row) => {
                doc
                  .fontSize(10)
                  .text(
                    `${row.employee_name} | ${row.team} | ${row.date} | ${row.day} | ${row.attendance_status} | ${row.shift_time_in} | ${row.time_in} | ${row.shift_time_out} | ${row.time_out}`
                  );
              });
            } else if (reportDescription == "Department Performance Report") {
              doc.fontSize(12).text(
                "Employee Name | Team | Date | Day | Attendance Status | Shift Time In | Time In | Shift Time Out | Time Out",
                { underline: true }
              );
              doc.moveDown();

              reportData.forEach((row) => {
                doc
                  .fontSize(10)
                  .text(
                    `${row.employee_name} | ${row.team} | ${row.date} | ${row.day} | ${row.attendance_status} | ${row.shift_time_in} | ${row.time_in} | ${row.shift_time_out} | ${row.time_out}`
                  );
              });
            } else if (reportDescription == "Browser Activity Report") {
              doc.fontSize(12).text(
                "Employee Name | Team | Date | Day | Attendance Status | Shift Time In | Time In | Shift Time Out | Time Out",
                { underline: true }
              );
              doc.moveDown();

              reportData.forEach((row) => {
                doc
                  .fontSize(10)
                  .text(
                    `${row.employee_name} | ${row.team} | ${row.date} | ${row.day} | ${row.attendance_status} | ${row.shift_time_in} | ${row.time_in} | ${row.shift_time_out} | ${row.time_out}`
                  );
              });
            }

            doc.end();

            writeStream.on("finish", () => resolve());
            writeStream.on("error", (err) => reject(err));
          });

        await generatePDF();
        console.log(`File generated and sent to user: ${filePath}`);

        // Set headers for reading the file in the browser
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline; filename=" + fileName);

        // Send the file as a response
        res.download(filePath);

      }
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  };




  getAttendanceReport = async (req, res) => {
    try {
      const { fromDate, toDate, definedPeriod, format, teamId, userId, limit, offset } = req.body;
      console.log("test", req.query);
      if (!format) format = "xls";
      if (format && !['xls', 'pdf'].includes(format)) {
        throw new Error('Invalid format. Only "xls" or "pdf" are allowed.');
      }
      // if(!teamId) return helper.failed(res, variables.ValidationError, "Team Id is required");
      let startDate, endDate;

      // Determine date range based on definedPeriod
      const today = new Date();

      if (definedPeriod == 1) {
        // Previous Day
        startDate = new Date(today.setDate(today.getDate() - 1));
        endDate = new Date(startDate);
      } else if (definedPeriod == 2) {
        // Previous Week (Sunday to Saturday)
        const lastSunday = new Date(today.setDate(today.getDate() - today.getDay() - 7));
        const lastSaturday = new Date(lastSunday);
        lastSaturday.setDate(lastSunday.getDate() + 6);
        startDate = lastSunday;
        endDate = lastSaturday;
      } else if (definedPeriod == 3) {
        // Previous Month
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        startDate = lastMonth;
        endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
      } else if (definedPeriod == 4) {
        // Custom
        const rules = { fromDate: "required", toDate: "required" };
        const { status, message } = await validate(req.body, rules);
        if (status === 0) {
          return helper.failed(res, variables.ValidationError, message);
        }
        startDate = new Date(fromDate);
        endDate = new Date(toDate);
      } else {
        return helper.failed(res, variables.ValidationError, "Invalid definedPeriod provided.");
      }

      // Fetch attendance report
      const attendanceReport = await TimeLog.sequelize.query(
        `SELECT 
          u.fullname AS employee_name, 
          team.name AS team, 
          timelog.date AS date, 
          DAYNAME(timelog.date) AS day, 
          CASE 
            WHEN timelog.logged_in_time IS NOT NULL THEN 'Present' 
            ELSE 'Absent' 
          END AS attendance_status, 
          shifts.start_time AS shift_time_in, 
          timelog.logged_in_time AS time_in, 
          shifts.end_time AS shift_time_out, 
          timelog.logged_out_time AS time_out
        FROM timelogs AS timelog
        LEFT JOIN users AS u ON timelog.user_id = u.id
        JOIN teams AS team ON u.teamId = team.id
        JOIN shifts AS shifts ON timelog.shift_id = shifts.id
        WHERE timelog.date BETWEEN :startDate AND :endDate AND u.company_id = :company_id AND u.isAdmin = 0
        ${teamId ? "AND team.id = :teamId" : ""}
        ${userId ? "AND u.id = :userId" : ""}
        ORDER BY timelog.date DESC
        `,
        {
          replacements: {
            company_id: req.user.company_id,
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
            teamId,
            userId,
            limit: limit || 10,
            offset: offset || 0,
          },
          type: QueryTypes.SELECT,
        }
      );

      const presentUsers = await TimeLog.findAll({
        attributes: ['user_id'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: [],
            where: {
              isAdmin: 0,
            },
          },
        ],
        where: {
          company_id: req.user.company_id,
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
        group: ['user_id'],
      });
      console.log(presentUsers.map(user => user.user_id));


      let reportDescription = "Attendance Report";


      await this.downloadFile(req, res, req.user.company_id, attendanceReport, format, reportDescription, startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]);
      // await dbTransaction.commit();
      // return helper.success(res, variables.Success, attendanceReport);
    } catch (error) {
      // if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getApplicationUsageReport = async (req, res) => {
    const dbTransaction = await Sequelize.transaction();
    try {
      const { fromTime, toTime, definedPeriod, teamId, userId, format } = req.body;


      await dbTransaction.commit();
      return helper.success(res, variables.Success, "User Updated Successfully");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getDeptPerformReport = async (req, res) => {
    try {
      const { company_id } = req.user;
      const { definedPeriod, fromDate, toDate, format, teamId } = req.body;
      if (!format) format = "xls";
      if (format && !['xls', 'pdf'].includes(format)) {
        throw new Error('Invalid format. Only "xls" or "pdf" are allowed.');
      }
      const dateRange = await GenerateReportHelper.getDateRange(definedPeriod, fromDate, toDate);
      const allDepartments = await department.findAll({
        where: { company_id: company_id, status: 1 },
      });

      let startDate = dateRange.startDate;
      let endDate = dateRange.endDate;

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

      await this.downloadFile(req, res, company_id, performanceArray, format, "Department Performance Report", startDate, endDate);

      return helper.success(res, variables.Success, "Department Performance Report Generated Successfully", performanceArray);
    } catch (error) {
      console.log(`departmentPerformanceReport ${error.message}`);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getUnauthorizedWebReport = async (req, res) => {
    try {
      const today = new Date();
      let startDate, endDate;
      let companyId = req.user.company_id;
      const { fromDate, toDate, definedPeriod, teamId, userId } = req.body;

      // Define period logic
      if (definedPeriod === 1) {
        // Previous Day
        startDate = new Date(today.setDate(today.getDate() - 1));
        endDate = new Date(startDate);
      } else if (definedPeriod === 2) {
        // Previous Week (Sunday to Saturday)
        const lastSunday = new Date(today.setDate(today.getDate() - today.getDay() - 7));
        const lastSaturday = new Date(lastSunday);
        lastSaturday.setDate(lastSunday.getDate() + 6);
        startDate = lastSunday;
        endDate = lastSaturday;
      } else if (definedPeriod === 3) {
        // Previous Month
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        startDate = lastMonth;
        endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
      } else if (definedPeriod === 4) {
        // Custom
        const rules = { fromDate: "required", toDate: "required" };
        const { status, message } = await validate(req.body, rules);
        if (status === 0) {
          return helper.failed(res, variables.ValidationError, message);
        }
        startDate = new Date(fromDate);
        endDate = new Date(toDate);
      } else {
        return helper.failed(res, variables.ValidationError, "Invalid definedPeriod provided.");
      }

      // Query to fetch unauthorized access
      const unauthorizedAccessReport = await UserHistory.sequelize.query(
        `SELECT u.fullname AS name,departments.name AS department, uh.url AS url,TIME(uh.visitTime) AS time
        FROM  user_histories As uh
        INNER JOIN users As u ON uh.userId = u.id
        INNER JOIN departments ON u.departmentId = departments.id
        WHERE uh.website_name not in(select website_name from productive_websites where company_id=:companyId) and uh.company_id = :companyId
            AND uh.date BETWEEN :startDate AND :endDate   ${teamId ? "AND team.id = :teamId" : ""} AND u.isAdmin = 0
        ${userId ? "AND u.id = :userId" : ""}
        ORDER BY uh.visitTime DESC`,
        {
          type: QueryTypes.SELECT,
          replacements: {
            companyId,
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
            teamId,
            userId,
          },
        }
      );

      return res.status(200).json({ status: "success", data: unauthorizedAccessReport });
    } catch (error) {
      console.error("Error fetching unauthorized access report:", error);
      return res.status(500).json({ status: "error", message: error.message });
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
        return helper.failed(res, variables.BadRequest, "Please select team and member");
      }

      const validOptions = ["custom_range", "yesterday", "previous_week", "previous_month"];

      if (!data.option || !validOptions.includes(data.option)) {
        return helper.failed(res, variables.BadRequest, "Please select a valid date option");
      }

      let date;
      if (data.option) {
        if (data.option == "custom_range") {
          if (!data.customStart || !data.customEnd) {
            return helper.failed(res, variables.BadRequest, "Please select start and end date");
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
        return helper.success(res, variables.Success, "Browser Data Fetched successfully", browserHistroy);
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
        return helper.success(res, variables.Success, "Browser Data Fetched successfully", browserHistroy);
      }
    } catch (error) {
      console.log("Error while generating browser history report:", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default exportReportController;
