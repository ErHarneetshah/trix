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
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "Work Reports", routeMethod, req.user.company_id);
    if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________

    // ___________---------- Search, Limit, Pagination ----------_______________
    let { searchParam, limit, page, startDate, endDate } = req.query;
    const searchable = ["$user.fullname$", "$user.department.name$", "$user.designation.name$"];
    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;
    const offset = (page - 1) * limit;
    const reportWhere = (await helper.searchCondition(searchParam, searchable)) || {};
    reportWhere.company_id = req.user.company_id;
    // _____________----------------------------------------------________________

    // ___________---------- Adding Date Filter Range ----------_______________
    if (startDate && endDate) {
      reportWhere.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    } else if (startDate) {
      reportWhere.createdAt = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      reportWhere.createdAt = { [Op.lte]: new Date(endDate) };
    }
    // _____________----------------------------------------------________________

    const allReportData = await workReports.findAndCountAll({
      where: reportWhere,
      offset,
      limit,
      attributes: ["id", "user_id", "date", "status", "createdAt"],
      include: [
        {
          model: User,
          as: "user",
          required: true,
          attributes: ["id", "fullname"],
          include: [
            {
              model: department,
              as: "department",
              attributes: ["name"],
            },
            {
              model: designation,
              as: "designation",
              attributes: ["name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const results = allReportData.rows.map((report) => ({
      id: report.id,
      date: report.date,
      status: report.status,
      createdAt: report.createdAt,
      name: report.user?.fullname || "N/A",
      department: report.user?.department?.name || "N/A",
      designation: report.user?.designation?.name || "N/A",
    }));

    return helper.success(res, variables.Success, "Retrieved User Report Successfully", {
      count: allReportData.count,
      rows: results,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    //helper.logger(res, "Reports Controller -> retrieveAllReport", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const retrieveUserReport = async (req, res) => {
  try {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "Work Reports", routeMethod, req.user.company_id);
    if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________

    let { id } = req.query;

    if (!id || isNaN(id)) return helper.failed(res, variables.ValidationError, "Invalid or missing user ID.");

    const query = `SELECT wr.id AS id, wr.description, wr.status, DATE_FORMAT(wr.createdAt, '%H:%i') AS submitted_time, DATE(wr.createdAt) AS submitted_date, u.fullname AS name FROM work_reports AS wr JOIN users AS u ON wr.user_id = u.id WHERE wr.id = ${id} AND wr.company_id = ${req.user.company_id};`;
    const userReport = await workReports.sequelize.query(query, {
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
    //helper.logger(res, "Reports Controller -> retrieveUserReport", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const approveDisaproveReport = async (req, res) => {
  try {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "Work Reports", routeMethod, req.user.company_id);
    if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________

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
      where: { id: id },
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
    //helper.logger(res, "Reports Controller -> approveDisapproveReport", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

export default { retrieveAllReport, retrieveUserReport, approveDisaproveReport };
