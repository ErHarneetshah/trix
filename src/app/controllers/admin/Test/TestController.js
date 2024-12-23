import department from "../../../../database/models/departmentModel.js";
import TimeLog from "../../../../database/models/timeLogsModel.js";
import User from "../../../../database/models/userModel.js";
import moment from "moment";
import { Op, fn, col, Sequelize, literal } from "sequelize";
import sequelize from "../../../../database/queries/dbConnection.js";
import GenerateReportHelper from "../../../../utils/development/helpers/GenerateReportHelper.js";

// Main function to get the department report with performance-wise
const departmentPerformanceReport = async (req, res, next) => {
    try {
        const { company_id } = req.user;
        const { option, startDate, endDate } = req.query;
        const dateRange = await GenerateReportHelper.getDateRange(option, startDate, endDate);
        const allDepartments = await department.findAll({
            where: { company_id: company_id, status: 1 }
        });

        const performanceArray = [];
        for (const element of allDepartments) {
            const totalEmployeesDepartmentWise = await GenerateReportHelper.getTotalEmployeeDepartmentWise(element.id, dateRange, 'user_ids');
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
                most_productive_app: mostproductiveAppName
            };

            performanceArray.push(obj);
        }

        return res.json(performanceArray);

    } catch (error) {
        console.log(`departmentPerformanceReport ${error.message}`);
        return res.status(500).json({ error: error.message });
    }
};



export default { departmentPerformanceReport }
