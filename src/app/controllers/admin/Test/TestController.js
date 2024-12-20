import department from "../../../../database/models/departmentModel.js";
import TimeLog from "../../../../database/models/timeLogsModel.js";
import User from "../../../../database/models/userModel.js";
import moment from "moment";
import { Op, fn, col, Sequelize, literal } from "sequelize";
import sequelize from "../../../../database/queries/dbConnection.js";

// Main function to get the department report with performance-wise
const departmentPerformanceReport = async (req, res, next) => {
    try {
        const { company_id } = req.user;
        const { option, startDate, endDate } = req.query;
        const dateRange = getDateRange(option, startDate, endDate);

        // Get all active departments for the company
        const allDepartments = await department.findAll({
            where: { company_id: company_id, status: 1 }
        });

        const performanceArray = [];

        // Use a for...of loop to handle async operations correctly
        for (const element of allDepartments) {
            // Get employee IDs in the department
            const totalEmployeesDepartmentWise = await getTotalEmployeeDepartmentWise(element.id, dateRange, 'user_ids');
            const justAverage = await getAttendanceAvg(dateRange, totalEmployeesDepartmentWise);

            // Prepare the report object for each department
            const obj = {
                department_name: element.name,
                total_employee: totalEmployeesDepartmentWise.length,
                attendance_avg: justAverage
            };

            // Push the department performance object into the array
            performanceArray.push(obj);
        }

        return res.json(performanceArray);

    } catch (error) {
        console.log(`departmentPerformanceReport ${error.message}`);
        return res.status(500).json({ error: error.message });
    }
};

// Helper function to get the total employees in a specific department
const getTotalEmployeeDepartmentWise = async (deptId, dateRange, type = "count") => {
    try {
        const { startDate, endDate } = dateRange;
        if (type === "count") {
            // Count total employees
            const totalEmployees = await User.count({
                where: {
                    departmentId: deptId,
                    status: 1,
                    createdAt: {
                        [Op.gte]: new Date(`${startDate}T00:00:00`),
                        [Op.lte]: new Date(`${endDate}T23:59:59`)
                    }
                },
            });
            return totalEmployees;
        } else {
            // Fetch all employee IDs
            const totalEmployees = await User.findAll({
                where: {
                    departmentId: deptId,
                    status: 1,
                    createdAt: {
                        [Op.gte]: new Date(`${startDate}T00:00:00`),
                        [Op.lte]: new Date(`${endDate}T23:59:59`)
                    }
                },
                attributes: ['id']
            });
            return totalEmployees.map(item => item.id);
        }
    } catch (error) {
        console.log(`getTotalEmployeeDepartmentWise ${error.message}`);
        return 0;
    }
};

// Helper function to get the date range based on the option
const getDateRange = (option, customStart, customEnd) => {
    const today = moment();
    let startDate, endDate;

    switch (option) {
        case 'yesterday':
            startDate = endDate = today.clone().subtract(1, 'days').format('YYYY-MM-DD');
            break;

        case 'previous_week':
            endDate = today.clone().startOf('week').subtract(1, 'days').format('YYYY-MM-DD');
            startDate = moment(endDate).subtract(6, 'days').format('YYYY-MM-DD');
            break;

        case 'previous_month':
            const firstDayOfThisMonth = today.clone().startOf('month');
            const lastDayOfPreviousMonth = firstDayOfThisMonth.clone().subtract(1, 'days');
            startDate = lastDayOfPreviousMonth.clone().startOf('month').format('YYYY-MM-DD');
            endDate = lastDayOfPreviousMonth.format('YYYY-MM-DD');
            break;

        case 'custom_range':
            if (!customStart || !customEnd) {
                throw new Error("Both customStart and customEnd must be provided for 'custom range'.");
            }
            startDate = moment(customStart).format('YYYY-MM-DD');
            endDate = moment(customEnd).format('YYYY-MM-DD');
            break;

        default:
            throw new Error("Invalid option. Valid options are 'yesterday', 'previous week', 'previous month', or 'custom range'.");
    }

    return { startDate, endDate };
};

// Helper function to get the attendance average for a department
const getAttendanceAvg = async (dateRange, userIds) => {
    try {
        let { startDate, endDate } = dateRange;
        const totalEmployeesWithinRange = await User.findAll({
            where: {
                id: {
                    [Op.in]: userIds
                }
            }
        });

        const avg = [];
        for (const user of totalEmployeesWithinRange) {
            let avgUser = 0;
            const userJoiningDate = user.createdAt;
            const formattedJoiningDate = new Date(userJoiningDate).toISOString().split('T')[0];
            if (startDate > formattedJoiningDate) {
                startDate = formattedJoiningDate;
            }
            const allWorkingDays = await getWorkingDays({ startDate, endDate }, userIds);
            const userWorkingDays = await getTotalPersentDays({ startDate, endDate }, user.id);
            if (parseInt(allWorkingDays) > 0) {
                avgUser = parseInt(userWorkingDays) / parseInt(allWorkingDays);
            }
            avg.push({ user_id: user.id, avg: avgUser });
        }

        // Calculate the average attendance across users in the department
        const totalAvg = avg.reduce((acc, obj) => acc + obj.avg, 0) / avg.length;
        return totalAvg;

    } catch (error) {
        console.log(`getAttendanceAvg ${error.message}`);
        return 0;
    }
};

// Helper function to get the working days of a department's users
const getWorkingDays = async (dateRange, userIds) => {
    try {
        const { startDate, endDate } = dateRange;
        const [results] = await sequelize.query(`
            SELECT user_id, COUNT(DISTINCT DATE(createdAt)) AS count
            FROM timelogs
            WHERE company_id = :companyId
            AND user_id IN (:userIds)
            AND createdAt >= :startDate
            AND createdAt <= :endDate
            GROUP BY user_id
            ORDER BY count DESC
        `, {
            replacements: {
                companyId: 1,
                userIds: userIds,
                startDate: `${startDate}T00:00:00`,
                endDate: `${endDate}T23:59:59`
            },
            type: sequelize.QueryTypes.SELECT
        });

        return results[0] ? results[0].count : 0;


    } catch (error) {
        console.log(`getWorkingDays ${error.message}`);
        return 0;
    }
};

// Helper function to get total present days of a user within the date range
const getTotalPersentDays = async (dateRange, user_id) => {
    try {
        const { startDate, endDate } = dateRange;
        const [results] = await sequelize.query(`
            SELECT count(DISTINCT createdAt) AS distinctCount
            FROM timelogs
            WHERE createdAt >= :startDate
            AND createdAt <= :endDate
            AND user_id = :userId
        `, {
            replacements: {
                startDate: new Date(`${startDate}T00:00:00`),
                endDate: new Date(`${endDate}T23:59:59`),
                userId: user_id
            },
            type: sequelize.QueryTypes.SELECT
        });

        return results[0] ? results[0].distinctCount : 0;

    } catch (error) {
        console.log(`getTotalPersentDays ${error.message}`);
        return 0;
    }
};

export default { departmentPerformanceReport }
