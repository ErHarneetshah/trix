import User from "../../../database/models/userModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import { Op, where } from "sequelize";
import validate from "../../../utils/CustomValidation.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";
import workReports from "../../../database/models/workReportsModel.js";
import department from "../../../database/models/departmentModel.js";
import designation from "../../../database/models/designationModel.js";

const retrieveAllReport = async (req, res) => {
  try {
    let { searchParam, limit, page, startDate, endDate } = req.query;

    // Fields for searching in workReports and User models
    const searchable = ["$user.fullname$", "$user.department.name$", "$user.designation.name$"];

    // Pagination setup
    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;
    const offset = (page - 1) * limit;

    // Generate search conditions
    const reportWhere = (await helper.searchCondition(searchParam, searchable)) || {};

    // Add date range filter to `reportWhere`
    if (startDate && endDate) {
      reportWhere.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    } else if (startDate) {
      reportWhere.createdAt = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      reportWhere.createdAt = { [Op.lte]: new Date(endDate) };
    }

    reportWhere.company_id = req.user.company_id;

    // Query data using Sequelize
    const allReportData = await workReports.findAndCountAll({
      where: reportWhere, // Filters for `workReports`
      offset,
      limit,
      attributes: ["id", "user_id", "date", "status", "createdAt"], // Select necessary fields
      include: [
        {
          model: User,
          as: "user", // Alias for the associated `User` model
          required: true, // Ensures only records with matching `user_id` are included
          attributes: ["id", "fullname"], // Select necessary fields
          include: [
            {
              model: department,
              as: "department", // Alias for the associated `department` model
              attributes: ["name"], // Select specific fields
            },
            {
              model: designation,
              as: "designation", // Alias for the associated `designation` model
              attributes: ["name"], // Select specific fields
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]], // Sort by creation date (most recent first)
    });

    // Transform results into desired format
    const results = allReportData.rows.map((report) => ({
      id: report.id,
      date: report.date,
      status: report.status,
      createdAt: report.createdAt,
      name: report.user?.fullname || "N/A", // Fullname from `User`
      department: report.user?.department?.name || "N/A", // Department name
      designation: report.user?.designation?.name || "N/A", // Designation name
    }));

    // Respond with success and data
    return helper.success(res, variables.Success, "Retrieved User Report Successfully", {
      count: allReportData.count, // Total records matching the criteria
      rows: results, // Formatted result rows
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};


// const retrieveAllReport = async (req, res) => {
//   try {
//     let { searchParam, limit, page, startDate, endDate } = req.query;

//     // Set pagination and default values
//     limit = parseInt(limit) || 10;
//     page = parseInt(page) || 1;
//     const offset = (page - 1) * limit;

//     // Build the where conditions
//     const whereConditions = [
//       `work_reports.company_id = ${req.user.company_id}`
//     ];

//     if (startDate && endDate) {
//       whereConditions.push(`work_reports.createdAt BETWEEN '${new Date(startDate)}' AND '${new Date(endDate)}'`);
//     } else if (startDate) {
//       whereConditions.push(`work_reports.createdAt >= '${new Date(startDate)}'`);
//     } else if (endDate) {
//       whereConditions.push(`work_reports.createdAt <= '${new Date(endDate)}'`);
//     }

//     // Construct the raw SQL query
//     const query = `
//       SELECT 
//         work_reports.id,
//         work_reports.user_id,
//         work_reports.date,
//         work_reports.status,
//         work_reports.createdAt,
//         user.id AS user_id,
//         user.fullname AS user_fullname,
//         department.name AS department_name,
//         designation.name AS designation_name
//       FROM 
//         work_reports
//       INNER JOIN 
//         users AS user ON work_reports.user_id = user.id
//       LEFT JOIN 
//         departments AS department ON user.departmentId = department.id
//       LEFT JOIN 
//         designations AS designation ON user.designationId = designation.id
//       WHERE 
//         ${whereConditions.join(' AND ')}
//       ORDER BY 
//         work_reports.createdAt DESC
//       LIMIT ${offset}, ${limit};
//     `;

//     // Run the query using sequelize.query
//     const [results, metadata] = await sequelize.query(query);

//     // Respond with success and data
//     return helper.success(res, variables.Success, "Retrieved User Report Successfully", {
//       count: metadata.rowCount, // Count of total rows matching the criteria
//       rows: results, // Formatted result rows
//     });
//   } catch (error) {
//     console.error("Error fetching reports:", error);
//     return helper.failed(res, variables.BadRequest, error.message);
//   }
// };

const retrieveUserReport = async (req, res) => {
  try {
    let { id } = req.query;

    if (!id || isNaN(id)) {
      return helper.failed(res, variables.ValidationError, "Invalid or missing user ID.");
    }

    const user = await User.findOne({
      where: { id: id },
    });
    if (!user) {
      return helper.failed(res, variables.NotFound, "User does  not exists");
    }

    const query = `SELECT wr.id AS id, wr.description, wr.status, DATE_FORMAT(wr.createdAt, '%H:%i') AS submitted_time, DATE(wr.createdAt) AS submitted_date, u.fullname AS name FROM work_reports AS wr JOIN users AS u ON wr.user_id = u.id WHERE wr.user_id = ${id} AND wr.company_id = ${user.company_id};`;
    const userReport = await workReports.sequelize.query(query, {
      // replacements: { userId: id },
      type: workReports.sequelize.QueryTypes.SELECT,
    });

    if (!userReport || userReport.length === 0) {
      return helper.failed(res, variables.NotFound, "No work report data found.");
    }

    let data = userReport[0];
    if (!data || data == undefined) return helper.failed(res, variables.NotFound, "No Work Report Data Found", data);

    return helper.success(res, variables.Success, "Retrieved User Report Successfully", data);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const approveDisaproveReport = async (req, res) => {
  try {
    const { id, report_status, remarks } = req.body;
    const rules = {
      id: "required|integer",
      report_status: "required|integer|in:1,2",
    };

    if (!["1", "2"].includes(String(report_status))) {
      return helper.failed(res, variables.ValidationError, "Invalid report status. Only values 1 and 2 are allowed");
    }
  
    const { status, message } = await validate(req.body, rules);

    if (status === 0) {
      return helper.failed(res, variables.ValidationError, message);
    }

    const reportId = await workReports.findOne({
      where: {id: id}
    });
    if (!reportId) {
      return helper.failed(res, variables.NotFound, "Work Report does not exists");
    }
    await workReports.update({ status: report_status, remarks: remarks ?? null, date: new Date() }, { where: { id: id } });
    if (report_status == 2) {
      return helper.success(res, variables.Success, "Disapproved Report Successfully");
    }
    return helper.success(res, variables.Success, "Approved Report Successfully");
  } catch (error) {
    console.error("Error while updating the status of approved ordisapproved reports:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

export default { retrieveAllReport, retrieveUserReport, approveDisaproveReport };
