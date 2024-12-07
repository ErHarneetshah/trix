import userReports from "../../../database/models/workReportsModel.js";
import User from "../../../database/models/userModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import { Op } from "sequelize";
import validate from '../../../utils/CustomValidation.js';
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";


const retrieveUserReport = async (req, res) => {
    try {
        let { id } = req.body;
        const user = await User.findOne({
            where: {id: id}
        });
        if (!user) {
            return responseUtils.errorResponse(res, "User not exists", 400);
        }
        const query = `SELECT wr.id AS id, wr.description, DATE_FORMAT(wr.createdAt, '%H:%i') AS submitted_time, DATE(wr.createdAt) AS submitted_date, u.fullname AS name FROM work_reports AS wr JOIN users AS u ON wr.user_id = u.id WHERE wr.user_id = ${id};`;
        const userReport = await userReports.sequelize.query(query, {
            // replacements: { userId: id },
            type: userReports.sequelize.QueryTypes.SELECT
        });

        return helper.success(res, variables.Success, "Retrieved User Report Successfully", userReport);
    } catch (error) {
        console.error('Error fetching reports:', error);
        return helper.failed(res, variables.BadRequest, error.message);        
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
            return helper.failed(res, variables.ValidationError, message);
        }

        const reportId = await userReports.findByPk(id);
        if (!reportId) {
            return helper.failed(res, variables.NotFound, "Id not exists");
        }
        await userReports.update( { status: report_status, remarks: remarks ?? null , date:new Date()},  
            { where: { id: id } }   );           
        if(report_status == 2){
            return helper.success(res, variables.Success, "Disapproved Report Successfully");
        }
        return helper.success(res, variables.Success, "Approved Report Successfully");

    } catch (error) {
        console.error('Error while updating the status of approved ordisapproved reports:', error);
        return helper.failed(res, variables.BadRequest, error.message);
    }
};

export default { retrieveUserReport ,approveDisaproveReport};


