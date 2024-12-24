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
import { UserHistory } from "../../../database/models/UserHistory.js";
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

  downloadFile = async (req, res, attendanceReport) => {
    try {
      const { format } = req.body;
      const fileName = `Attendance_Report_${Date.now()}.pdf`;
      const __dirname = path.dirname(new URL(import.meta.url).pathname);
      const filePath = path.resolve(__dirname, "../../../storage/files", fileName);
      console.log(filePath);

      if (format === "xls") {
        return;
      }

      // Generate PDF
      const doc = new PDFDocument({ compress: false }); // Disable compression for debugging

      // Write to file
      const fileStream = fs.createWriteStream(filePath);
      doc.pipe(fileStream);

      // Add title and content
      doc.fontSize(18).text("Attendance Report", { align: "center" }).moveDown();

      // Add header
      const header = "Employee Name | Team | Date | Day | Attendance Status | Shift Time In | Time In | Shift Time Out | Time Out";
      console.log("Header:", header); // Debugging: Log header
      doc.fontSize(12).text(header, { underline: true }).moveDown();

      // Add attendance rows
      attendanceReport.forEach((row, index) => {
        const rowText = `${row.employee_name} | ${row.team} | ${row.date} | ${row.day} | ${row.attendance_status} | ${row.shift_time_in} | ${row.time_in} | ${row.shift_time_out} | ${row.time_out}`;
        console.log(`Row ${index + 1}:`, rowText); // Debugging: Log each row
        doc.fontSize(10).text(rowText);
      });

      // Finalize the document
      doc.end();

      // Debugging: Write raw attendance data to a text file for verification
      const debugFilePath = path.resolve(__dirname, "../../../storage/files", "debug_attendance.txt");
      fs.writeFileSync(
        debugFilePath,
        attendanceReport
          .map((row) => `${row.employee_name} | ${row.team} | ${row.date} | ${row.day} | ${row.attendance_status} | ${row.shift_time_in} | ${row.time_in} | ${row.shift_time_out} | ${row.time_out}`)
          .join("\n")
      );
      console.log("Debug file written to:", debugFilePath);

      fileStream.on("finish", () => {
        // Ensure the file exists before sending
        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (err) {
            console.error("File does not exist:", err);
            return res.status(500).json({ status: "error", message: "File generation failed." });
          }

          // Send file to client
          res.download(filePath, fileName, (err) => {
            if (err) {
              console.error("Error sending file:", err);
              return res.status(500).json({ status: "error", message: "File download failed." });
            }

            console.log("PDF generated and downloaded successfully.");
          });
        });
      });

      fileStream.on("error", (err) => {
        console.error("Error writing file:", err);
        res.status(500).json({ status: "error", message: "File generation failed." });
      });
    } catch (error) {
      console.error("Error generating file:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  };

  getAttendanceReport = async (req, res) => {
    try {
      const { fromDate, toDate, definedPeriod, teamId, userId, limit, offset } = req.body;
      let startDate, endDate;

      // Determine date range based on definedPeriod
      const today = new Date();

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
       LEFT JOIN teams AS team ON u.teamId = team.id
       LEFT JOIN shifts AS shifts ON timelog.shift_id = shifts.id
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

      console.log(attendanceReport);

      await this.downloadFile(req, res, attendanceReport);
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
      const { option, startDate, endDate } = req.query;
      const dateRange = await GenerateReportHelper.getDateRange(option, startDate, endDate);
      const allDepartments = await department.findAll({
        where: { company_id: company_id, status: 1 },
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
        `SELECT u.fullname AS Name,departments.name AS DeptName, uh.url AS URL,TIME(uh.visitTime) AS Time
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
