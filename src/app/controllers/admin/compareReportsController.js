import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import { Op, Sequelize } from "sequelize";
import sequelize from "../../../database/queries/dbConnection.js";
import chartController from "./Charts/chartController.js";
import TimeLog from "../../../database/models/timeLogsModel.js";


const getCompareReportsData = async (req, res, next) => {
    try {
        const { company_id, createdAt } = req.user;
        const { userId, date } = req.query;

        if (!date || isNaN(new Date(date)) || isNaN(new Date(createdAt))) {
            throw new Error('Invalid date or user joining date.');
        }

        const formattedDate = new Date(date).toISOString().split('T')[0];
        const joiningDate = new Date(createdAt).toISOString().split('T')[0];

        if (formattedDate < joiningDate) {
            throw new Error('User was not part of the organization on this date.');
        }

        const userLogging = await TimeLog.findOne({
            where: {
                user_id: userId,
                company_id: company_id,
                createdAt: {
                    [Op.eq]: formattedDate,
                },
            },
        });

        if (!userLogging) {
            throw new Error('User was absent on this date or the entered date is invalid.');
        }

        const replacements = {
            companyId: company_id,
            userId: userId,
            createdAt: formattedDate
        };

        const queries = [
            {
                query: `
                    SELECT ah.appName, 
                        SUM(TIMESTAMPDIFF(MINUTE, ah.startTime, ah.endTime)) AS total_time_minutes
                    FROM app_histories AS ah
                    INNER JOIN productive_apps AS ap ON ap.app_name = ah.appName
                    WHERE DATE(ah.createdAt) = :createdAt 
                    AND ah.company_id = :companyId 
                    AND ah.userId = :userId
                    GROUP BY ah.appName;
                `,
                key: 'productiveApps'
            },
            {
                query: `
                    SELECT ah.appName, 
                        SUM(TIMESTAMPDIFF(MINUTE, ah.startTime, ah.endTime)) AS total_time_minutes
                    FROM app_histories AS ah
                    WHERE ah.appName NOT IN (
                        SELECT app_name FROM productive_apps WHERE company_id = :companyId
                    )
                    AND ah.company_id = :companyId 
                    AND ah.userId = :userId 
                    AND DATE(ah.createdAt) = :createdAt
                    GROUP BY ah.appName;
                `,
                key: 'nonProductiveApps'
            },
            {
                query: `
                    SELECT COALESCE(COUNT(uh.id), 0) AS total_counts, uh.website_name 
                    FROM user_histories AS uh
                    INNER JOIN productive_websites AS pw 
                    ON uh.website_name = pw.website_name
                    WHERE uh.company_id = :companyId 
                    AND uh.userId = :userId 
                    AND DATE(uh.createdAt) = :createdAt
                    GROUP BY uh.website_name;
                `,
                key: 'productiveWebsites'
            },
            {
                query: `
                    SELECT COUNT(uh.id) AS total_counts, uh.website_name 
                    FROM user_histories AS uh
                    WHERE uh.website_name NOT IN (
                        SELECT website_name 
                        FROM productive_websites 
                        WHERE company_id = :companyId
                    )
                    AND uh.company_id = :companyId 
                    AND uh.userId = :userId 
                    AND DATE(uh.createdAt) = :createdAt
                    GROUP BY uh.website_name;
                `,
                key: 'nonProductiveWebsites'
            }
        ];

        const queryPromises = queries.map(({ query, key }) =>
            sequelize.query(query, { type: Sequelize.QueryTypes.SELECT, replacements })
                .then(result => ({ [key]: result }))
        );

        const results = await Promise.all(queryPromises);

        const combinedResult = results.reduce((acc, result) => {
            return { ...acc, ...result };
        }, {});

        const offlineTime = userLogging.idle_time;
        const loggedInTime = userLogging.logged_in_time;
        const timeAtWork = await getActiveTime(userLogging.id);

        combinedResult.offlineTime = offlineTime;
        combinedResult.loggedInTime = loggedInTime;
        combinedResult.timeAtWork = timeAtWork;


        combinedResult.effectiveness = calculateEffectiveness(timeAtWork, offlineTime);

        // return res.json(combinedResult);
        return helper.success(
            res,
            variables.Success,
            "Compare Report Data Fetched Successfully",
            combinedResult
        );

    } catch (error) {
        console.error(error.message);

        return helper.failed(
            res,
            500,
            error.message
        );

    }
};

// Placeholder function for effectiveness calculation
const calculateEffectiveness = (timeAtWork, offlineTime) => {
    const totalTime = timeAtWork + offlineTime;
    return totalTime ? (timeAtWork / totalTime) * 100 : 0; // Effectiveness as a percentage
};


const getActiveTime = async (timelogId) => {
    try {
        const userLogging = await TimeLog.findOne({
            where: {
                id: timelogId
            },
        });

        if (!userLogging) {
            return 0;
        }

        if (userLogging.active_time) {
            return userLogging.active_time;
        } else {
            const time1 = userLogging.logged_in_time;
            const time2 = userLogging.logged_out_time;

            if (!time1 || !time2) {
                return 0;
            }

            const toMinutes = (time) => {
                const [hours, minutes] = time.split(':').map(Number);
                return hours * 60 + minutes;
            };

            let diffMinutes = toMinutes(time2) - toMinutes(time1);

            if (diffMinutes < 0) {
                diffMinutes += 24 * 60;
            }

            return diffMinutes;
        }
    } catch (error) {
        console.error(error);
        return 0; // Return 0 in case of an error
    }
};


export default { getCompareReportsData };
