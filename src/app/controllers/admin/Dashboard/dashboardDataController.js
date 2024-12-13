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
          SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)) AS total_time
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
          total_time DESC
        LIMIT 5;
      `;

    const results = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
      logging: false,
    });

    if (!results || results.length === 0) {
      return helper.success(res, variables.Success, "No data found", []);
    }

    return helper.success(
      res,
      variables.Success,
      "Top Productive Users Fetched Successfully",
      results
    );
  } catch (error) {
    console.error("Error in topFiveProductiveAppsUsers:", error);

    return helper.failed(res, 500, "Failed to fetch data");
  }
};


const topFiveUnProductiveAppsUsers = async (req, res, next) => {
  try {
    const query = `
        SELECT 
          u.fullname AS user_name,
          ah.userId AS user_id,
          SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)) AS total_time
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
          total_time DESC
        LIMIT 5;
      `;

    const results = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
      logging: false, // Set to `true` for debugging during development
    });

    if (!results || results.length === 0) {
      return helper.success(res, variables.Success, "No data found", []);
    }

    return helper.success(
      res,
      variables.Success,
      "Top Non Productive Users Fetched Successfully",
      
      results
    );
  } catch (error) {
    console.error("Error in topFiveUnProductiveAppsUsers:", error);

    return helper.failed(res, 500, "Failed to fetch data");
  }
};

//function for top five most effective users


const topFiveEffectiveUsers = async (req, res, next) => {
  try {
    const query = `
    WITH 

    unproductive_time AS (
        SELECT 
            u.fullname, 
            ah.userId, 
            SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)) AS total_unproductive_time_seconds 
        FROM 
            app_histories AS ah 
        LEFT JOIN 
            users AS u 
        ON 
            u.id = ah.userId 
        WHERE 
            appName NOT IN (SELECT app_name FROM productive_apps) 
        GROUP BY 
            ah.userId
    ),
    
    
    productive_time AS (
        SELECT 
            u.fullname, 
            ah.userId, 
            SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)) AS total_productive_time_seconds 
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
    )
    
    
    SELECT 
        p.userId,
        p.fullname,
        p.total_productive_time_seconds,
        u.total_unproductive_time_seconds,
        (p.total_productive_time_seconds - u.total_unproductive_time_seconds) AS net_productivity_seconds
    FROM 
        productive_time AS p
    INNER JOIN 
        unproductive_time AS u 
    ON 
        p.userId = u.userId
    ORDER BY 
        net_productivity_seconds DESC limit 5;
      `;

    const results = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
      logging: false,
    });

    if (!results || results.length === 0) {
      return helper.success(res, variables.Success, "No data found", []);
    }

    return helper.success(
      res,
      variables.Success,
      "Top Effective Users Fetched Successfully",
      results
    );
  } catch (error) {
    console.error("Error in topFiveEffectiveUsers:", error);

    return helper.failed(res, 500, "Failed to fetch data");
  }
};



const topFiveAbsentUsers = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        u.fullname, 
        COUNT(tl.user_id) AS total_present, 
        tl.user_id 
      FROM 
        timelogs AS tl 
      LEFT JOIN 
        users AS u 
      ON 
        u.id = tl.user_id 
      GROUP BY 
        tl.user_id 
      ORDER BY 
        total_present ASC 
      LIMIT 5;
    `;

    const results = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
      logging: false, // Disable logging for cleaner console output
    });

    // If no results are found, send an appropriate response
    if (!results || results.length === 0) {
      return helper.success(
        res,
        variables.Success,
        "No absent users found",
        []
      );
    }

    return helper.success(
      res,
      variables.Success,
      "Top 5 Absent Users Fetched Successfully",
      results
    );
  } catch (error) {
    console.error("Error in getTopFiveAbsentUsers:", error);

    return helper.failed(
      res,
      500,
      "An error occurred while fetching top absent users."
    );
  }
};

const topFiveLateComingUsers = async (req, res, next) => {
  try {
    // SQL query to fetch the top 5 users with the highest total late-coming duration
    const query = `
      SELECT 
        u.fullname, 
        u.id AS user_id, 
        SUM(tl.late_coming_duration) AS total_late_duration 
      FROM 
        timelogs AS tl 
      LEFT JOIN 
        users AS u 
      ON 
        u.id = tl.user_id 
      GROUP BY 
        tl.user_id 
      HAVING 
        total_late_duration > 0 
      ORDER BY 
        total_late_duration DESC 
      LIMIT 5;
    `;

    // Execute the query using Sequelize
    const results = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
      logging: false, // Disable query logging for cleaner console output
    });

    // If no results are found, send an appropriate response
    if (!results || results.length === 0) {
      return helper.success(
        res,
        variables.Success,
        "No late-coming users found.",
        []
      );
    }

    // Return the results with a success response
    return helper.success(
      res,
      variables.Success,
      "Top 5 Late-Coming Users Fetched Successfully.",
      results
    );
  } catch (error) {
    // Log the error for debugging
    console.error("Error in getTopFiveLateComingUsers:", error);

    // Send an error response
    return helper.failed(
      res,
      500,
      "An error occurred while fetching top late-coming users."
    );
  }
};

const getTopFiveOfflineLoggedUsers = async (req, res, next) => {
  try {
    // SQL query to fetch the top 5 users with the highest total offline idle time
    const query = `
      SELECT 
        u.fullname, 
        u.id AS user_id, 
        SUM(tl.idle_time) AS total_idle_time 
      FROM 
        timelogs AS tl 
      LEFT JOIN 
        users AS u 
      ON 
        u.id = tl.user_id 
      GROUP BY 
        tl.user_id 
      HAVING 
        total_idle_time > 0 
      ORDER BY 
        total_idle_time DESC 
      LIMIT 5;
    `;

    // Execute the query using Sequelize
    const results = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
      logging: false, // Disable query logging for a cleaner console
    });

    // If no results are found, send an appropriate response
    if (!results || results.length === 0) {
      return helper.success(
        res,
        variables.Success,
        "No offline logged users found.",
        []
      );
    }

    // Return the results with a success response
    return helper.success(
      res,
      variables.Success,
      "Top 5 Offline Logged Users Fetched Successfully.",
      results
    );
  } catch (error) {
    // Log the error for debugging
    console.error("Error in getTopFiveOfflineLoggedUsers:", error);

    // Send an error response
    return helper.failed(
      res,
      500,
      "An error occurred while fetching top offline logged users."
    );
  }
};





export default { topFiveProductiveAppsUsers, topFiveUnProductiveAppsUsers, topFiveEffectiveUsers,topFiveAbsentUsers,topFiveLateComingUsers,getTopFiveOfflineLoggedUsers }