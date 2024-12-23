import { Sequelize, QueryTypes } from "sequelize";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import exportReports from "../../../database/models/exportReportsModel.js";
import department from "../../../database/models/departmentModel.js";
import TimeLog from "../../../database/models/timeLogsModel.js";
import User from "../../../database/models/userModel.js";
import AppHistoryEntry from "../../../database/models/AppHistoryEntry.js";
import commonfuncitons from "../../../utils/services/commonfuncitons.js";
import validate from "../../../utils/CustomValidation.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

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
      let { fromTime, toTime, definedPeriod, teamId, userId, format, allRequest } = req.body;
      /**
       * Employee name | Department | Date | login time | Logout time | Total active hours | Idle time | time on productive apps | Time on non productive apps | Productive websites | Non productive websites | Average productivity % | Most used productive app
       */
      if (allRequest) {
      } else if (definedPeriod && [1, 2, 3].includes(definedPeriod)) {
        const alldata = await TimeLog.findAndCountAll({
          // where: logWhere, // add the definedPeriod Condition here
          include: [
            {
              model: User,
              as: "user",
              required: true,
              where: { teamId: teamId },
              attributes: ["id", "fullname"],
              include: [
                {
                  model: AppHistoryEntry,
                  as: "productivity",
                  required: false,
                },
                {
                  model: department,
                  as: "department",
                  attributes: ["name"],
                },
              ],
            },
          ],
          order: [["createdAt", "DESC"]],
        });
        if(!alldata) return helper.failed(res, variables.BadRequest, "Unable to retrieve the data");

        let result = commonfuncitons.createResponse(alldata.rows)

        // await dbTransaction.commit();
        return helper.success(res, variables.Success, "User Updated Successfully", result);
      }
    } catch (error) {
      // if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  downloadFile = async (req, res, attendanceReport) => {
    try {
      const { format } = req.body; 
  
      if (format === "xls") {
        // Generate Excel file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Attendance Report");
  
        // Add headers
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
  
        // Add data rows
        worksheet.addRows(attendanceReport);
  
        // Set headers for the response
        const fileName = `Attendance_Report_${Date.now()}.xlsx`;
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  
        await workbook.xlsx.write(res);
        res.end();
      } else {
        // Generate PDF file (default)
        const doc = new PDFDocument();
        const fileName = `Attendance_Report_${Date.now()}.pdf`;
  
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
        doc.pipe(res);
  
        // Add title
        doc.fontSize(18).text("Attendance Report", { align: "center" });
        doc.moveDown();
  
        // Add headers
        doc.fontSize(12).text(
          "Employee Name | Team | Date | Day | Attendance Status | Shift Time In | Time In | Shift Time Out | Time Out",
          { underline: true }
        );
        doc.moveDown();
  
        // Add data rows
        attendanceReport.forEach((row) => {
          doc
            .fontSize(10)
            .text(
              `${row.employee_name} | ${row.team} | ${row.date} | ${row.day} | ${row.attendance_status} | ${row.shift_time_in} | ${row.time_in} | ${row.shift_time_out} | ${row.time_out}`
            );
        });
  
        doc.end();
      }
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  };

  getAttendanceReport = async (req, res) => {
    // const dbTransaction = await Sequelize.transaction();
    try {
      /**
       * Employee name | Team | Date | Day | Attendance status | Shift time in | Time in | Shift Time out | Time out | Report(?)
       */
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
        JOIN users AS u ON timelog.user_id = u.id
        JOIN teams AS team ON u.teamId = team.id
        JOIN shifts AS shifts ON timelog.shift_id = shifts.id
        WHERE timelog.date BETWEEN :startDate AND :endDate
        ${teamId ? "AND team.id = :teamId" : ""}
        ${userId ? "AND u.id = :userId" : ""}
        ORDER BY timelog.date DESC
        LIMIT :limit OFFSET :offset`,
        {
          replacements: {
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

      await this.downloadFile(req, res, attendanceReport);
      // await dbTransaction.commit();
      // return helper.success(res, variables.Success, attendanceReport);
    } catch (error) {
      // if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };



  getBrowserActivityReport = async (req, res) => {
    const dbTransaction = await Sequelize.transaction();
    try {
      const { fromTime, toTime, definedPeriod, teamId, userId, format, deptRequest } = req.body;

      /**
       * Name | Dept. | URL | Productive/Non-productive | Time spent
       */

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "User Updated Successfully");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getApplicationUsageReport = async (req, res) => {
    const dbTransaction = await Sequelize.transaction();
    try {
      const { fromTime, toTime, definedPeriod, teamId, userId, format, deptRequest } = req.body;

      /**
       * Name | Dept. | Application | Productive/Non-Productive |
       */

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "User Updated Successfully");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getDeptPerformReport = async (req, res) => {
    const dbTransaction = await Sequelize.transaction();
    try {
      const { fromTime, toTime, definedPeriod, teamId, userId, format, deptRequest } = req.body;

      /**
       * Department | TL | Total employees | Avg Attendance rate | Avg Login time| Avg productive time (browser)| Avg non productive time (browser)| Avg productive time(app) | Avg non productive time (app) | Most non productive website | Most non productive app | Most productive (app) | Most non productive app
       */

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "User Updated Successfully");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getUnauthorizedWebReport = async (req, res) => {
    const dbTransaction = await Sequelize.transaction();
    try {
      const { fromTime, toTime, definedPeriod, teamId, userId, format, deptRequest } = req.body;

      /**
       * Name | Dept. | URL | time
       */
      await dbTransaction.commit();
      return helper.success(res, variables.Success, "User Updated Successfully");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default exportReportController;
