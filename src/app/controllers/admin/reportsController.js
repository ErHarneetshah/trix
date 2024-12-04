import userReports from "../../../database/models/workReportsModel.js";
import User from "../../../database/models/userModel.js";
import responseUtils from "../../../utils/common/responseUtils.js";
import sequelize from "../../../database/queries/dbConnection.js";
import { Op } from "sequelize";
import validate from '../../../utils/CustomValidation.js';




const retrieveUserReport = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return responseUtils.errorResponse(res, "User not exists", 400);
        }
        const query = `SELECT  wr.id as id,wr.description, DATE_FORMAT(wr.createdAt, '%H:%i') AS submitted_time,DATE(wr.createdAt) AS submited_date, CONCAT(u.firstname, ' ', u.lastname) AS name FROM  work_reports AS wr JOIN users As u ON wr.user_id = u.id WHERE wr.user_id = :userId;`;
        const userReport = await userReports.sequelize.query(query, {
            replacements: { userId: req.params.id },
            type: userReports.sequelize.QueryTypes.SELECT
        }
        );

        return responseUtils.successResponse(res, { userReport, message: "Retrieved User Report Successfully." }, 200);
    } catch (error) {
        console.error('Error fetching reports:', error);
        return responseUtils.errorResponse(res, error.message, 400);
    }
};

const approveDisaproveReport = async (req, res) => {
    try {
        const { id,report_status,remarks } = req.body;
        const rules = {
            id: 'required|integer',
            report_status: 'required|integer|in:1,2'
        };
        if (report_status == '2') {
            rules.remarks = 'required|string';  
        }
        const { status, message } = await validate(req.body, rules);

        if (status === 0) {
            return responseUtils.errorResponse(res, message, 400);
        }

        const reportId = await userReports.findByPk(id);
        if (!reportId) {
            return responseUtils.errorResponse(res, "Id not exists.", 400);
        }
        await userReports.update( { status: report_status, remarks: remarks ?? null , date:new Date()},  
            { where: { id: id } }   );           
        if(report_status == 2){
            return responseUtils.successResponse(res, {  message: "Disapproved Report Successfully." }, 200);
        }
        return responseUtils.successResponse(res, {  message: "Approved Report Successfully." }, 200);

    } catch (error) {
        console.error('Error while updating the status of approved ordisapproved reports:', error);
        return responseUtils.errorResponse(res, error.message, 400);
    }
};

export default { retrieveUserReport ,approveDisaproveReport};


