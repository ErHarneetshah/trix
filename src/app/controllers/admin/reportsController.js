import User from "../../../database/models/userModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import { Op } from "sequelize";
import validate from "../../../utils/CustomValidation.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";
import workReports from "../../../database/models/workReportsModel.js";
import department from "../../../database/models/departmentModel.js";
import designation from "../../../database/models/designationModel.js";

const retrieveAllReport = async (req, res) => {
  try {
    const allReportData = await workReports.findAll();
    const userIds = allReportData.map((report) => report.user_id);
    let userDetails = [];
    for (const userId of userIds) {
      const userDetail = await User.findOne({
        where: { id: userId },
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
      });
      userDetails.push(userDetail); // Correctly push the fetched data into the array
    }

    const combinedData = allReportData.map((report) => {
        const userDetail = userDetails.find((user) => user.id === report.user_id);
        return {
          id: report.id, // ID from report
          date: report.createdAt, // Date from report
          status: report.status, // Status from report
          name: userDetail?.fullname || "N/A", // Name from userDetails
          designation: userDetail?.designation?.name || "N/A", // Designation from userDetails
          department: userDetail?.department?.name || "N/A", // Department from userDetails
        };
    });



    return helper.success(res, variables.Success, "Retrieved User Report Successfully", combinedData);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const retrieveUserReport = async (req, res) => {
  try {
    let { id } = req.query;
    const user = await User.findOne({
      where: { id },
    });
    if (!user) {
      return responseUtils.errorResponse(res, "User not exists", 400);
    }

    const query = `SELECT wr.id AS id, wr.description, wr.status, DATE_FORMAT(wr.createdAt, '%H:%i') AS submitted_time, DATE(wr.createdAt) AS submitted_date, u.fullname AS name FROM work_reports AS wr JOIN users AS u ON wr.user_id = u.id WHERE wr.user_id = ${id};`;
    const userReport = await workReports.sequelize.query(query, {
      // replacements: { userId: id },
      type: workReports.sequelize.QueryTypes.SELECT,
    });


    let data = userReport[0]

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
    // if (report_status == '2') {
    //     rules.remarks = 'required|string';
    // }
    const { status, message } = await validate(req.body, rules);

    if (status === 0) {
      return helper.failed(res, variables.ValidationError, message);
    }

    const reportId = await workReports.findByPk(id);
    if (!reportId) {
      return helper.failed(res, variables.NotFound, "Id not exists");
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
