import workReports from "../../../database/models/workReportsModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import { Op } from "sequelize";
import validate from '../../../utils/CustomValidation.js';


const createReport = async (req, res) => {
    try {
        const { user_id, description} = req.body;
        const rules = {
            user_id: 'required|integer',
            description: 'required|string',
        };

        const { status, message } = await validate(req.body, rules);

        if (status === 0) {
            return responseUtils.errorResponse(res, message, 400);
        }

        await workReports.create({ user_id, description });
        return responseUtils.successResponse(res, { message: "Your report submitted successfully." }, 200);

    } catch (error) {
        console.error('Error while creating the user report ', error);
        return responseUtils.errorResponse(res, "Error while creating the user report", 400);
    }
};

const getSelfReport = async (req, res) => {
    try {
        const query = `SELECT wr.description, CASE  WHEN wr.status = 0 THEN 'Pending' WHEN wr.status = 1 THEN 'Approved' WHEN wr.status = 2 THEN 'Disapproved' ELSE 'Unknown' END AS status FROM work_reports As wr WHERE wr.user_id = 2`;

        const selfReport = await workReports.sequelize.query(query, {
            type: userReports.sequelize.QueryTypes.SELECT}
        );

        return responseUtils.successResponse(res, { selfReport, message: "Retrieved User Report Successfully." }, 200);
    } catch (error) {
        console.error('Error fetching reports:', error);
        return responseUtils.errorResponse(res, error.message, 400);
    }
};

export default { createReport,getSelfReport };


