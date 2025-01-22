import helper from "../../../../utils/services/helper.js";
import sequelize from "../../../../database/queries/dbConnection.js";
import { Sequelize, Op, fn, col, where, literal } from "sequelize";
import variables from "../../../config/variableConfig.js";
import User from "../../../../database/models/userModel.js";
import TimeLog from "../../../../database/models/timeLogsModel.js";

const topFiveProductiveAppsUsers = async (req, res, next) => {
  try {
    const { company_id } = req.user;
    const { date } = req.query;
    let formattedDate;
    if (!date) {
      formattedDate = new Date().toISOString().split("T")[0];
    }
    formattedDate = new Date(date).toISOString().split("T")[0];

    // Define the SQL query
    const query = `
    SELECT 
    u.fullname AS user_name,
    ah.userId AS user_id,
    u.designationId,
    d.name AS designation_name,
    t.name as team_name,
    SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)) AS total_time
FROM 
    app_histories AS ah
INNER JOIN 
    productive_apps AS ap 
    ON ap.app_name = ah.appName AND ap.company_id = :companyId
INNER JOIN 
    users AS u 
    ON ah.userId = u.id AND u.company_id = :companyId
LEFT JOIN 
    designations AS d 
    ON d.id = u.designationId LEFT JOIN teams as t on u.teamId=t.id
WHERE 
    ah.company_id = :companyId
    and ah.date = :date
GROUP BY 
    ah.userId, u.fullname, u.departmentId, d.name
HAVING 
    total_time > 0
ORDER BY 
    total_time DESC
LIMIT 5;
      `;

    const results = await sequelize.query(query, {
      replacements: { companyId: company_id, date: formattedDate },
      type: Sequelize.QueryTypes.SELECT,
      logging: false,
    });

    if (!results || results.length === 0) {
      return helper.success(res, variables.Success, "No data found", []);
    }

    return helper.success(res, variables.Success, "Top Productive Users Fetched Successfully", results);
  } catch (error) {
    console.error("Error in topFiveProductiveAppsUsers:", error);

    return helper.failed(res, 500, "Failed to fetch data");
  }
};

const topFiveUnProductiveAppsUsers = async (req, res, next) => {
  try {
    const { company_id } = req.user;
    const { date } = req.query;
    let formattedDate;
    if (!date) {
      formattedDate = new Date().toISOString().split("T")[0];
    }
    formattedDate = new Date(date).toISOString().split("T")[0];

    const query = `
    SELECT 
    u.fullname AS user_name,
    ah.userId AS user_id,
    d.name AS designation_name,
    t.name as team_name,
    SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)) AS total_time
  FROM 
    app_histories AS ah
  INNER JOIN 
    users AS u 
  ON 
    u.id = ah.userId and u.company_id=:companyId
    LEFT JOIN 
designations AS d 
ON d.id = u.designationId LEFT JOIN teams as t on u.teamId=t.id
  WHERE 
    ah.appName NOT IN (SELECT app_name FROM productive_apps where company_id=:companyId) and ah.company_id=:companyId and ah.date = :date
  GROUP BY 
    ah.userId
    HAVING 
      total_time > 0
  ORDER BY 
    total_time DESC
  LIMIT 5;
      `;

    const results = await sequelize.query(query, {
      replacements: { companyId: company_id, date: formattedDate },
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

const topFiveEffectiveUsers = async (req, res, next) => {
  try {
    const { company_id } = req.user;
    const { date } = req.query;
    let formattedDate;
    if (!date) {
      formattedDate = new Date().toISOString().split("T")[0];
    }
    formattedDate = new Date(date).toISOString().split("T")[0];

    const query = `
    WITH 
    unproductive_time AS (
        SELECT 
            u.fullname, 
            ah.userId, 
            SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)) AS total_unproductive_time_seconds 
        FROM 
            app_histories AS ah 
        INNER JOIN 
            users AS u 
        ON 
            u.id = ah.userId and u.company_id=:companyId
        WHERE 
            appName NOT IN (SELECT app_name FROM productive_apps where company_id=:companyId)  and ah.company_id=:companyId and ah.date = :date
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
            ap.app_name = ah.appName and ap.company_id=:companyId
        LEFT JOIN 
            users AS u 
        ON 
            ah.userId = u.id and u.company_id=1 where ah.company_id=:companyId and ah.date = :date
        GROUP BY 
            ah.userId
    )
    
    
    SELECT 
        p.userId,
        p.fullname,
        p.total_productive_time_seconds,
        u.total_unproductive_time_seconds,
        d.name AS designation_name,
    t.name as team_name,
        (p.total_productive_time_seconds - u.total_unproductive_time_seconds) AS net_productivity_seconds
    FROM 
        productive_time AS p
    INNER JOIN 
        unproductive_time AS u 
    ON 
        p.userId = u.userId 
        
        INNER JOIN 
    users AS us 
  ON 
    u.userId = us.id and us.company_id=:companyId
    LEFT JOIN 
designations AS d 
ON d.id = us.designationId LEFT JOIN teams as t on us.teamId=t.id
    HAVING 
      net_productivity_seconds > 0
    ORDER BY 
        net_productivity_seconds DESC limit 5;
      `;

    const results = await sequelize.query(query, {
      replacements: { companyId: company_id, date: formattedDate },
      type: Sequelize.QueryTypes.SELECT,
      logging: false,
    });

    if (!results || results.length === 0) {
      return helper.success(res, variables.Success, "No data found", []);
    }

    return helper.success(res, variables.Success, "Top Effective Users Fetched Successfully", results);
  } catch (error) {
    console.error("Error in topFiveEffectiveUsers:", error);

    return helper.failed(res, 500, error.message);
  }
};

const topFiveAbsentUsers = async (req, res, next) => {
  try {
    const { company_id } = req.user;
    const { date } = req.query;
    let formattedDate;
    if (!date) {
      formattedDate = new Date().toISOString().split("T")[0];
    }
    formattedDate = new Date(date).toISOString().split("T")[0];

    const query = `
    SELECT 
    u.fullname, 
    COUNT(tl.user_id) AS total_present, 
    tl.user_id,d.name AS designation_name,
t.name as team_name
  FROM 
    timelogs AS tl 
  INNER JOIN 
    users AS u 
  ON 
    u.id = tl.user_id and u.company_id=:companyId and u.isAdmin=0 LEFT JOIN 
designations AS d 
ON d.id = u.designationId LEFT JOIN teams as t on u.teamId=t.id where tl.company_id=:companyId and tl.date = :date
  GROUP BY 
    tl.user_id 
  ORDER BY 
    total_present ASC 
  LIMIT 5
    `;

    const results = await sequelize.query(query, {
      replacements: { companyId: company_id, date: formattedDate },
      type: Sequelize.QueryTypes.SELECT,
      logging: false, // Disable logging for cleaner console output
    });

    // If no results are found, send an appropriate response
    if (!results || results.length === 0) {
      return helper.success(res, variables.Success, "No absent users found", []);
    }

    return helper.success(res, variables.Success, "Top 5 Absent Users Fetched Successfully", results);
  } catch (error) {
    console.error("Error in getTopFiveAbsentUsers:", error);

    return helper.failed(res, 500, "An error occurred while fetching top absent users.");
  }
};

const topFiveLateComingUsers = async (req, res, next) => {
  try {
    const { company_id } = req.user;
    const { date } = req.query;
    let formattedDate;
    if (!date) {
      formattedDate = new Date().toISOString().split("T")[0];
    }
    formattedDate = new Date(date).toISOString().split("T")[0];

    // SQL query to fetch the top 5 users with the highest total late-coming duration
    const query = `
    SELECT 
    u.fullname, 
    u.id AS user_id, 
    d.name AS designation_name,
t.name as team_name,
    SUM(tl.late_coming_duration) AS total_late_duration 
  FROM 
    timelogs AS tl 
  INNER JOIN 
    users AS u 
  ON 
    u.id = tl.user_id and u.company_id=:companyId LEFT JOIN 
designations AS d 
ON d.id = u.designationId LEFT JOIN teams as t on u.teamId=t.id where tl.company_id=:companyId and tl.date = :date
  GROUP BY 
    tl.user_id 
  HAVING 
    total_late_duration > 0 
  ORDER BY 
    total_late_duration DESC 
  LIMIT 5
    `;

    // Execute the query using Sequelize
    const results = await sequelize.query(query, {
      replacements: { companyId: company_id, date: formattedDate },
      type: Sequelize.QueryTypes.SELECT,
      logging: false, // Disable query logging for cleaner console output
    });

    // If no results are found, send an appropriate response
    if (!results || results.length === 0) {
      return helper.success(res, variables.Success, "No late-coming users found.", []);
    }

    // Return the results with a success response
    return helper.success(res, variables.Success, "Top 5 Late-Coming Users Fetched Successfully.", results);
  } catch (error) {
    // Log the error for debugging
    console.error("Error in getTopFiveLateComingUsers:", error);

    // Send an error response
    return helper.failed(res, 500, "An error occurred while fetching top late-coming users.");
  }
};

const getTopFiveOfflineLoggedUsers = async (req, res, next) => {
  try {
    // SQL query to fetch the top 5 users with the highest total offline idle time
    const { company_id } = req.user;
    const { date } = req.query;
    let formattedDate;
    if (!date) {
      formattedDate = new Date().toISOString().split("T")[0];
    }
    formattedDate = new Date(date).toISOString().split("T")[0];

    const query = `
    SELECT 
    u.fullname, 
    u.id AS user_id, 
    d.name AS designation_name,
t.name as team_name,
    SUM(tl.idle_time) AS total_idle_time 
  FROM 
    timelogs AS tl 
  INNER JOIN 
    users AS u 
  ON 
    u.id = tl.user_id and u.company_id=:companyId LEFT JOIN 
designations AS d 
ON d.id = u.designationId LEFT JOIN teams as t on u.teamId=t.id where tl.company_id=:companyId and tl.date = :date
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
      replacements: { companyId: company_id, date: formattedDate },
      type: Sequelize.QueryTypes.SELECT,
      logging: false, // Disable query logging for a cleaner console
    });

    // If no results are found, send an appropriate response
    if (!results || results.length === 0) {
      return helper.success(res, variables.Success, "No offline logged users found.", []);
    }

    // Return the results with a success response
    return helper.success(res, variables.Success, "Top 5 Offline Logged Users Fetched Successfully.", results);
  } catch (error) {
    // Log the error for debugging
    console.error("Error in getTopFiveOfflineLoggedUsers:", error);

    // Send an error response
    return helper.failed(res, 500, "An error occurred while fetching top offline logged users.");
  }
};

const getCompanyStats = async (companyId, date) => {
  try {
    const formattedDate = new Date(date).toISOString().split("T")[0];

    const totalEmployees = await User.count({
      where: {
        company_id: companyId,
        status: 1,
        isAdmin: 0,
        [Op.and]: Sequelize.literal(`DATE(createdAt) <= '${formattedDate}'`),
      },
    });
    const totalWorkingEmployees = await TimeLog.count({
      where: {
        company_id: companyId,
        logged_out_time: null,
        [Op.and]: Sequelize.literal(`DATE(createdAt) = '${formattedDate}'`),
      },
    });

    const totalNotWorkingEmployees = await TimeLog.count({
      where: {
        company_id: companyId,
        logged_out_time: { [Op.ne]: null },
        [Op.and]: Sequelize.literal(`DATE(createdAt) = '${formattedDate}'`),
      },
    });

    const absentUsers = await User.count({
      where: {
        company_id: companyId,
        isAdmin: 0,
        status: 1,
        [Op.and]: Sequelize.literal(`DATE(createdAt) = '${formattedDate}'`), // removed < sign from <=
        id: {
          [Op.notIn]: literal(`(
            SELECT user_id FROM timelogs 
            WHERE DATE(createdAt) = '${formattedDate}' AND company_id = ${companyId}
          )`),
        },
      },
    });

    const totalLateUsers = await TimeLog.count({
      where: {
        company_id: companyId,
        late_coming_duration: { [Op.gt]: 0 },
        [Op.and]: Sequelize.literal(`DATE(createdAt) = '${formattedDate}'`),
      },
    });

    const totalActivated = await User.count({
      where: {
        company_id: companyId,
        isAdmin: 0,
        [Op.and]: Sequelize.literal(`DATE(createdAt) <= '${formattedDate}'`),
      },
    });

    const totalSlackingEmployees = await TimeLog.count({
      where: {
        company_id: companyId,
        idle_time: { [Op.gt]: 0 },
        [Op.and]: Sequelize.literal(`DATE(createdAt) = '${formattedDate}'`), // removed < sign from <=
        idle_time: {
          [Op.gt]: Sequelize.literal("(0.4 * (active_time + spare_time + idle_time))"),
        },
      },
    });

    const totalDectivated = await User.count({
      where: {
        company_id: companyId,
        status: 0,
        [Op.and]: Sequelize.literal(`DATE(createdAt) <= '${formattedDate}'`),
      },
    });

    return {
      total_employees: totalEmployees,
      total_working_employee: totalWorkingEmployees,
      total_not_working_employee: totalNotWorkingEmployees,
      absent_users: absentUsers,
      total_late_users: totalLateUsers,
      total_activated_users: totalActivated,
      total_deactivated: totalDectivated,
      total_slacking_users: totalSlackingEmployees,
    };
  } catch (error) {
    console.error("Error fetching company stats:", error);
    return {
      total_employees: 0,
      total_working_employee: 0,
      total_not_working_employee: 0,
      absent_users: 0,
      total_late_users: 0,
      total_activated_users: 0,
      total_deactivated: 0,
      total_slacking_users: 0,
    };
  }
};

const getDashbaordData = async (req, res, next) => {
  try {
    const { company_id } = req.user;
    let { date } = req.query;

    // Check if the date is valid
    if (!date || isNaN(new Date(date).getTime())) {
      // return res.status(400).json({ error: "Invalid or missing date parameter." });
      date = new Date();
    }
    const companyStats = await getCompanyStats(company_id, date);
    return helper.success(res, variables.Success, "Data Fetched Successfully", companyStats);
  } catch (error) {
    return helper.failed(res, 400, error.message, []);
  }
};

export default { topFiveProductiveAppsUsers, topFiveUnProductiveAppsUsers, topFiveEffectiveUsers, topFiveAbsentUsers, topFiveLateComingUsers, getTopFiveOfflineLoggedUsers, getDashbaordData };
