import helper from "../../../../utils/services/helper.js";
import sequelize from "../../../../database/queries/dbConnection.js";
import { Sequelize } from "sequelize";
import variables from "../../../config/variableConfig.js";

const topFiveProductiveAppsUsers = async (req, res, next) => {
    try {
        // Define the SQL query
        const query = `
        SELECT 
          u.fullname AS user_name,
          ah.userId AS user_id,
          SUM(TIMESTAMPDIFF(MINUTE, ah.startTime, ah.endTime)) AS total_time_minutes
        FROM 
          app_histories AS ah
        INNER JOIN 
          productive_apps AS ap 
        ON 
          ap.app_name = ah.appName
        LEFT JOIN 
          users AS u 
        ON 
          ah.userId = u.id
        GROUP BY 
          ah.userId
        ORDER BY 
          total_time_minutes DESC
        LIMIT 5;
      `;

        // Execute the query
        const results = await sequelize.query(query, {
            type: Sequelize.QueryTypes.SELECT,
            logging: false, // Set to `true` for debugging purposes
        });

        // Check if results exist
        if (!results || results.length === 0) {
            return helper.success(res, variables.Success, "No data found", []);
        }

        // Return the successful response
        return helper.success(
            res,
            variables.Success,
            "Top Application Chart Fetched Successfully",
            results
        );
    } catch (error) {
        // Log the error for debugging
        console.error("Error in topFiveProductiveAppsUsers:", error);

        // Return the error response
        return helper.failed(res, 500, "Failed to fetch data");
    }
};


const topFiveUnProductiveAppsUsers = async (req, res, next) => {
    try {
        // Define the SQL query
        const query = `
        SELECT 
          u.fullname AS user_name,
          ah.userId AS user_id,
          SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)) AS total_time_seconds
        FROM 
          app_histories AS ah
        LEFT JOIN 
          users AS u 
        ON 
          u.id = ah.userId
        WHERE 
          ah.appName NOT IN (SELECT app_name FROM productive_apps)
        GROUP BY 
          ah.userId
        ORDER BY 
          total_time_seconds DESC
        LIMIT 5;
      `;

        // Execute the query
        const results = await sequelize.query(query, {
            type: Sequelize.QueryTypes.SELECT,
            logging: false, // Set to `true` for debugging during development
        });

        // Check if results exist
        if (!results || results.length === 0) {
            return helper.success(res, variables.Success, "No data found", []);
        }

        // Return the successful response
        return helper.success(
            res,
            variables.Success,
            "Top Unproductive Application Chart Fetched Successfully",
            results
        );
    } catch (error) {
        // Log the error for debugging
        console.error("Error in topFiveUnProductiveAppsUsers:", error);

        // Return the error response
        return helper.failed(res, 500, "Failed to fetch data");
    }
};



export default { topFiveProductiveAppsUsers, topFiveUnProductiveAppsUsers }