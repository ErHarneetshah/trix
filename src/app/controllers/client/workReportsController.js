import workReports from "../../../database/models/workReportsModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import { Op } from "sequelize";
import validate from '../../../utils/CustomValidation.js';
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import User from "../../../database/models/userModel.js";

const createReport = async (req, res) => {
    try {
        const { user_id, description } = req.body;
        const rules = {
            user_id: 'required|integer',
            description: 'required|string',
        };
        const { status, message } = await validate(req.body, rules);
        let company_id = 101;
        if (status === 0) {
            return helper.failed(res, variables.ValidationError, message);
        }

        const isUserExists = await User.findOne({
            where: { id: user_id },
          });

          if(!isUserExists){
            return helper.failed(res, variables.NotFound, "User is not exists in our records.");
          }
        const report = await workReports.create({ company_id, user_id, description });
        return helper.success(res, variables.Success, "Your report submitted successfully", report);
    } catch (error) {
        console.error('Error while creating the user report ', error);
        return helper.failed(res, variables.BadRequest, error.message);
    }
};

const getSelfReport = async (req, res) => {
    try {
        const query = `SELECT wr.description, CASE  WHEN wr.status = 0 THEN 'Pending' WHEN wr.status = 1 THEN 'Approved' WHEN wr.status = 2 THEN 'Disapproved' ELSE 'Unknown' END AS status FROM work_reports As wr WHERE wr.user_id = 1`;

        const selfReport = await workReports.sequelize.query(query, {
            type: workReports.sequelize.QueryTypes.SELECT
        }
        );
        return helper.success(res, variables.Success, "Retrieved User Report Successfully.", selfReport);

    } catch (error) {
        console.error('Error fetching reports:', error);
        return helper.failed(res, variables.BadRequest, error.message);

    }
};

export default { createReport, getSelfReport };


