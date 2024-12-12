import workReports from "../../../database/models/workReportsModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import { Op } from "sequelize";
import validate from "../../../utils/CustomValidation.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import User from "../../../database/models/userModel.js";

const createReport_old = async (req, res) => {
  try {
    const { description } = req.body;
    const rules = {
      // user_id: 'required|integer',
      description: "required|string",
    };
    const { status, message } = await validate(req.body, rules);
    let companyId = req.user.company_id;

    if (status === 0) {
      return helper.failed(res, variables.ValidationError, message);
    }

    // const isUserExists = await User.findOne({
    //     where: { id: user_id, company_id: req.user.company_id },
    //  });

    //  if(!isUserExists){
    //     return helper.failed(res, variables.NotFound, "User is not exists in our records.");
    //  }
    const report = await workReports.create({ company_id: companyId, user_id: req.user.id, description: description });
    return helper.success(res, variables.Success, "Your report submitted successfully", report);
  } catch (error) {
    console.error("Error while creating the user report ", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const createReport = async (req, res) => {
  try {
    const { description } = req.body;

    const rules = {
      description: "required|string",
    };

    const { status, message } = await validate(req.body, rules);
    let companyId = req.user.company_id;
    if (status === 0) {
      return helper.failed(res, variables.ValidationError, message);
    }

    const isUserExists = await User.findOne({
      where: { id: req.user.id, company_id: req.user.company_id },
    });

    if (!isUserExists) {
      return helper.failed(res, variables.NotFound, "User does not exist in our records.");
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existingReport = await workReports.findOne({
      where: {
        company_id: companyId,
        user_id: req.user.id,
        createdAt: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
    });

    if (existingReport) {
      return helper.failed(res, variables.ValidationError, "You have already submitted a report for today.");
    }

    await workReports.create({
      company_id: companyId,
      user_id: req.user.id,
      description: description,
      date: new Date().toISOString().split("T")[0],
    });

    return helper.success(res, variables.Success, "Your report submitted successfully");
  } catch (error) {
    console.error("Error while creating the user report:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const getSelfReport = async (req, res) => {
  try {
    let id = req.user.id;

    let work_data = await workReports.findAll({
      where: { user_id: id },

      attributes: ["user_id", "description", "status", "remarks", "createdAt"],
    });

    return helper.success(res, variables.Success, "Retrieved User Report Successfully.", work_data);
  } catch (error) {
    console.error("Error fetching reports:", error);

    return helper.failed(res, variables.BadRequest, error.message);
  }
};

// const getSelfReport = async (req, res) => {
//   try {
//     const query = `SELECT wr.description, CASE  WHEN wr.status = 0 THEN 'Pending' WHEN wr.status = 1 THEN 'Approved' WHEN wr.status = 2 THEN 'Disapproved' ELSE 'Unknown' END AS status FROM work_reports As wr WHERE wr.user_id = ${req.user.id}`;

//     const selfReport = await workReports.sequelize.query(query, {
//       type: workReports.sequelize.QueryTypes.SELECT,
//     });
//     return helper.success(res, variables.Success, "Retrieved User Report Successfully.", selfReport);
//   } catch (error) {
//     console.error("Error fetching reports:", error);
//     return helper.failed(res, variables.BadRequest, error.message);
//   }
// };

export default { createReport, getSelfReport };
