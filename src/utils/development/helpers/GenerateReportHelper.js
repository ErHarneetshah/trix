import moment from "moment";
import { Op, fn, col, Sequelize, literal } from "sequelize";
import department from "../../../database/models/departmentModel.js";
import TimeLog from "../../../database/models/timeLogsModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import User from "../../../database/models/userModel.js";
import team from "../../../database/models/teamModel.js";
import shift from "../../../database/models/shiftModel.js";


// Helper function to get the working days of a department's users
const getWorkingDays = async (dateRange, userIds, companyId) => {
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
                companyId: companyId,
                userIds: userIds,
                startDate: `${startDate}T00:00:00`,
                endDate: `${endDate}T23:59:59`
            },
            type: sequelize.QueryTypes.SELECT,
            logging:console.log
        });
        return results ? results.count : 0;


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

        return results ? results.distinctCount : 0;

    } catch (error) {
        console.log(`getTotalPersentDays ${error.message}`);
        return 0;
    }
};
export default {

    getWorkingDays, getTotalPersentDays,

    // Helper function to get the date range based on the option
    getDateRange: async (option, customStart, customEnd) => {
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
    },

    // Helper function to get the total employees in a specific department
    getTotalEmployeeDepartmentWise: async (deptId, dateRange, type = "count") => {
        try {
            const { startDate, endDate } = dateRange;
            if (type === "count") {
                const totalEmployees = await User.count({
                    where: {
                        departmentId: deptId,
                        status: 1,
                        createdAt: {
                            // [Op.gte]: new Date(`${startDate}T00:00:00`),
                            [Op.lte]: new Date(`${endDate}T23:59:59`)
                        }
                    },
                });
                return totalEmployees;
            } else {
                const totalEmployees = await User.findAll({
                    where: {
                        departmentId: deptId,
                        status: 1,
                        createdAt: {
                            // [Op.gte]: new Date(`${startDate}T00:00:00`),
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
    },

    // Helper function to get the total employees in a specific department
    getTotalEmployeeTeamWise: async (teams, dateRange, type = "count") => {
        try {
            const { startDate, endDate } = dateRange;
            if (type === "count") {
                const totalEmployees = await User.count({
                    where: {
                        teamId: {
                            [Op.in]: Array.isArray(teams) ? teams : [teams]
                        },
                        status: 1,
                        createdAt: {
                            // [Op.gte]: new Date(`${startDate}T00:00:00`),
                            [Op.lte]: new Date(`${endDate}T23:59:59`)
                        }
                    },
                });
                return totalEmployees;
            } else {
                const totalEmployees = await User.findAll({
                    where: {
                        teamId: {
                            [Op.in]: Array.isArray(teams) ? teams : [teams]
                        },
                        status: 1,
                        createdAt: {
                            // [Op.gte]: new Date(`${startDate}T00:00:00`),
                            [Op.lte]: new Date(`${endDate}T23:59:59`)
                        }
                    },
                    attributes: ['id']
                });
                return totalEmployees.map(item => item.id);
            }
        } catch (error) {
            console.log(`getTotalEmployeeTeamWise ${error.message}`);
            return 0;
        }
    },


    getAvgLoggedInTime: async (dateRange, userIds) => {
        try {
            let { startDate, endDate } = dateRange;


            const results = await TimeLog.findOne({
                attributes: [
                    [sequelize.fn('AVG', sequelize.literal('active_time / 60')), 'average_active_time']
                ],
                where: {
                    user_id: {
                        [Op.in]: userIds
                    },
                    createdAt: {
                        [Op.gte]: new Date(`${startDate}T00:00:00`),
                        [Op.lte]: new Date(`${endDate}T23:59:59`)
                    }
                },
            });

            return results ? results.get('average_active_time') : 0;

        } catch (error) {
            console.log(`getAvgLoggedInTime ${error.message}`);
            return 0;
        }
    }
    ,

    // Helper function to get the attendance average for a department
    getAttendanceAvg: async (dateRange, userIds, companyId) => {
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
                if (startDate < formattedJoiningDate) {
                    startDate = formattedJoiningDate;
                }
                const allWorkingDays = await getWorkingDays({ startDate, endDate }, userIds, companyId);
                const userWorkingDays = await getTotalPersentDays({ startDate, endDate }, user.id);
                if (parseInt(allWorkingDays) > 0) {
                    avgUser = parseInt(userWorkingDays) / parseInt(allWorkingDays) * 100;
                }
                avg.push({ user_id: user.id, avg: avgUser });
            }

            const totalAvg = avg.length > 0
                ? avg.reduce((acc, obj) => acc + obj.avg, 0) / avg.length
                : 0;
            return totalAvg;

        } catch (error) {
            console.log(`getAttendanceAvg ${error.message}`);
            return 0;
        }
    },



    getAvgProductiveAppTime: async (dateRange, userIds, companyId) => {
        try {
            let { startDate, endDate } = dateRange;



            const query = `
    SELECT 
    COALESCE(AVG(user_total_time),0) AS average_time_minutes
    FROM (
        SELECT 
            ah.userId,
            COALESCE(SUM(TIMESTAMPDIFF(MINUTE, ah.startTime, ah.endTime)), 0) AS user_total_time
        FROM 
            app_histories AS ah
        INNER JOIN 
            productive_apps AS ap 
        ON 
            ap.app_name = ah.appName AND ap.company_id = :companyId
        WHERE 
            ah.company_id = :companyId
            AND ah.createdAt BETWEEN :startDate AND :endDate
            AND ah.userId IN (:userIds)
        GROUP BY 
            ah.userId
    ) AS user_totals;
`;

            const replacements = {
                companyId: companyId,
                startDate,
                endDate,
                userIds
            };

            const [results] = await sequelize.query(query, {
                type: Sequelize.QueryTypes.SELECT,
                replacements,
            },
            );

            console.log(results);
            return results ? results.average_time_minutes : 0;

        } catch (error) {
            return 0;
        }
    },


    getAvgNonProductiveAppTime: async (dateRange, userIds, companyId) => {
        try {
            let { startDate, endDate } = dateRange;

            const query = `
    SELECT 
        COALESCE(AVG(user_total_time), 0) AS average_time_minutes
    FROM (
        SELECT 
            ah.userId,
            COALESCE(SUM(TIMESTAMPDIFF(MINUTE, ah.startTime, ah.endTime)), 0) AS user_total_time
        FROM 
            app_histories AS ah
        WHERE 
            ah.appName NOT IN (
                SELECT app_name 
                FROM productive_apps 
                WHERE company_id = :companyId AND app_name IS NOT NULL
            )
            AND ah.company_id = :companyId
            AND ah.createdAt BETWEEN :startDate AND :endDate
            AND ah.userId IN (:userIds)
        GROUP BY 
            ah.userId
    ) AS user_totals;
`;

            const replacements = {
                companyId,
                startDate,
                endDate,
                userIds,
            };

            const [results] = await sequelize.query(query, {
                type: Sequelize.QueryTypes.SELECT,
                replacements,
            });

            return results ? results.average_time_minutes : 0;

        } catch (error) {
            return 0;
        }
    },


    mostUnproductiveWebsiteName: async (dateRange, userIds, companyId) => {
        try {
            const { startDate, endDate } = dateRange;
            const query = `
                SELECT 
                    COUNT(uh.id) AS total_counts,
                    uh.website_name AS website_name 
                FROM 
                    user_histories AS uh 
                WHERE 
                    uh.website_name NOT IN (
                        SELECT website_name 
                        FROM productive_websites 
                        WHERE company_id = :companyId AND website_name IS NOT NULL
                    ) 
                    AND uh.company_id = :companyId 
                    AND uh.createdAt BETWEEN :startDate AND :endDate 
                    AND uh.userId IN (:userIds)
                GROUP BY 
                    uh.website_name 
                ORDER BY 
                    total_counts DESC 
                LIMIT 1;
            `;

            // Ensure userIds is not empty
            if (!userIds || userIds.length === 0) {
                throw new Error("userIds array is empty or undefined.");
            }

            const replacements = {
                companyId,
                startDate,
                endDate,
                userIds,
            };

            const [results] = await sequelize.query(query, {
                type: Sequelize.QueryTypes.SELECT,
                replacements,
            });

            return results ? results.website_name : 'N/A';

        } catch (error) {
            console.error(`Error in mostUnproductiveWebsiteName: ${error.message}`);
            return "N/A";
        }
    }
    ,
    mostProductiveWebsiteName: async (dateRange, userIds, companyId) => {
        try {
            const { startDate, endDate } = dateRange;
            const query = `
                SELECT 
                    COUNT(uh.id) AS total_counts,
                    uh.website_name AS website_name 
                FROM 
                    user_histories AS uh 
                WHERE 
                    uh.website_name  IN (
                        SELECT website_name 
                        FROM productive_websites 
                        WHERE company_id = :companyId AND website_name IS NOT NULL
                    ) 
                    AND uh.company_id = :companyId 
                    AND uh.createdAt BETWEEN :startDate AND :endDate 
                    AND uh.userId IN (:userIds)
                GROUP BY 
                    uh.website_name 
                ORDER BY 
                    total_counts DESC 
                LIMIT 1;
            `;

            // Ensure userIds is not empty
            if (!userIds || userIds.length === 0) {
                throw new Error("userIds array is empty or undefined.");
            }

            const replacements = {
                companyId,
                startDate,
                endDate,
                userIds,
            };

            const [results] = await sequelize.query(query, {
                type: Sequelize.QueryTypes.SELECT,
                replacements,
            });

            return results ? results.website_name : 'N/A';

        } catch (error) {
            console.error(`Error in mostproductiveWebsiteName: ${error.message}`);
            return "N/A";
        }
    },


    mostUnproductiveAppName: async (dateRange, userIds, companyId) => {
        try {
            const { startDate, endDate } = dateRange;
            
            if (!userIds || userIds.length === 0) {
                throw new Error("userIds array is empty or undefined.");
            }
    
            const query = `
                SELECT 
                    ah.appName, 
                    COALESCE(SUM(TIMESTAMPDIFF(MINUTE, ah.startTime, ah.endTime)), 0) AS total_time_minutes
                FROM 
                    app_histories AS ah
                WHERE 
                    ah.appName NOT IN (
                        SELECT app_name 
                        FROM productive_apps 
                        WHERE company_id = :companyId AND app_name IS NOT NULL
                    ) 
                    AND ah.company_id = :companyId
                    AND ah.createdAt BETWEEN :startDate AND :endDate
                    AND ah.userId IN (:userIds)
                GROUP BY 
                    ah.appName
                ORDER BY 
                    total_time_minutes DESC
                LIMIT 1;
            `;
    
            const replacements = {
                companyId,
                startDate,
                endDate,
                userIds,
            };
    
            const [results] = await sequelize.query(query, {
                type: Sequelize.QueryTypes.SELECT,
                replacements,
            });
    
            // Return appName if results are found, otherwise return 'N/A'
            return results  ? results.appName : 'N/A';
    
        } catch (error) {
            console.error(`Error in mostUnproductiveAppName: ${error.message}`);
            return "N/A";
        }
    }
    
    ,
    mostproductiveAppName: async (dateRange, userIds, companyId) => {
        try {
            const { startDate, endDate } = dateRange;
            
            if (!userIds || userIds.length === 0) {
                throw new Error("userIds array is empty or undefined.");
            }
    
            const query = `
                SELECT 
                    ah.appName, 
                    COALESCE(SUM(TIMESTAMPDIFF(MINUTE, ah.startTime, ah.endTime)), 0) AS total_time_minutes
                FROM 
                    app_histories AS ah
                WHERE 
                    ah.appName IN (
                        SELECT app_name 
                        FROM productive_apps 
                        WHERE company_id = :companyId AND app_name IS NOT NULL
                    ) 
                    AND ah.company_id = :companyId
                    AND ah.createdAt BETWEEN :startDate AND :endDate
                    AND ah.userId IN (:userIds)
                GROUP BY 
                    ah.appName
                ORDER BY 
                    total_time_minutes DESC
                LIMIT 1;
            `;
    
            const replacements = {
                companyId,
                startDate,
                endDate,
                userIds,
            };
    
            const [results] = await sequelize.query(query, {
                type: Sequelize.QueryTypes.SELECT,
                replacements,
            });
    
            // Return appName if results are found, otherwise return 'N/A'
            return results  ? results.appName : 'N/A';
    
        } catch (error) {
            console.error(`Error in mostproductiveAppName: ${error.message}`);
            return "N/A";
        }
    }
}