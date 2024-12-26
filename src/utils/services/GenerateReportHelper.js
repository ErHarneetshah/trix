import moment from "moment";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { fileURLToPath } from "url";
import { Op, fn, col, Sequelize, literal } from "sequelize";
import department from "../../database/models/departmentModel.js";
import TimeLog from "../../database/models/timeLogsModel.js";
import sequelize from "../../database/queries/dbConnection.js";
import User from "../../database/models/userModel.js";
import helper from "./helper.js";
import exportHistories from "../../database/models/exportHistoryModel.js";
import variables from "../../app/config/variableConfig.js";
import { finished } from "stream";

// Helper function to get the working days of a department's users
const getWorkingDays = async (dateRange, userIds, companyId) => {
  try {
    const { startDate, endDate } = dateRange;
    const [results] = await sequelize.query(
      `
        SELECT user_id, COUNT(DISTINCT DATE(createdAt)) AS count
        FROM timelogs
        WHERE company_id = :companyId
        AND user_id IN (:userIds)
        AND createdAt >= :startDate
        AND createdAt <= :endDate
        GROUP BY user_id
        ORDER BY count DESC
    `,
      {
        replacements: {
          companyId: companyId,
          userIds: userIds,
          startDate: `${startDate}T00:00:00`,
          endDate: `${endDate}T23:59:59`,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );
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
    const [results] = await sequelize.query(
      `
        SELECT count(DISTINCT createdAt) AS distinctCount
        FROM timelogs
        WHERE createdAt >= :startDate
        AND createdAt <= :endDate
        AND user_id = :userId
    `,
      {
        replacements: {
          startDate: new Date(`${startDate}T00:00:00`),
          endDate: new Date(`${endDate}T23:59:59`),
          userId: user_id,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return results ? results.distinctCount : 0;
  } catch (error) {
    console.log(`getTotalPersentDays ${error.message}`);
    return 0;
  }
};
export default {
  getWorkingDays,
  getTotalPersentDays,

  // Helper function to get the total employees in a specific department
  getTotalEmployeeDepartmentWise: async (deptId, dateRange, type = "count") => {
    try {
      const { startDate, endDate } = dateRange;
      console.log(endDate);
      if (type === "count") {
        const totalEmployees = await User.count({
          where: {
            departmentId: deptId,
            status: 1,
            createdAt: {
              [Op.lte]: new Date(endDate), // Directly use the `endDate` value
            },
          },
        });
        return totalEmployees;
      } else {
        const totalEmployees = await User.findAll({
          where: {
            departmentId: deptId,
            status: 1,
            createdAt: {
              [Op.lte]: new Date(endDate),
            },
          },
          attributes: ["id"],
        });
        return totalEmployees.map((item) => item.id);
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
              [Op.in]: Array.isArray(teams) ? teams : [teams],
            },
            status: 1,
            createdAt: {
              // [Op.gte]: new Date(`${startDate}T00:00:00`),
              [Op.lte]: new Date(`${endDate}T23:59:59`),
            },
          },
        });
        return totalEmployees;
      } else {
        const totalEmployees = await User.findAll({
          where: {
            teamId: {
              [Op.in]: Array.isArray(teams) ? teams : [teams],
            },
            status: 1,
            createdAt: {
              // [Op.gte]: new Date(`${startDate}T00:00:00`),
              [Op.lte]: new Date(`${endDate}T23:59:59`),
            },
          },
          attributes: ["id"],
        });
        return totalEmployees.map((item) => item.id);
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
        attributes: [[sequelize.fn("AVG", sequelize.literal("active_time / 60")), "average_active_time"]],
        where: {
          user_id: {
            [Op.in]: userIds,
          },
          createdAt: {
            [Op.gte]: new Date(startDate),
            [Op.lte]: new Date(endDate),
          },
        },
      });

      return results ? results.get("average_active_time") : 0;
    } catch (error) {
      console.log(`getAvgLoggedInTime ${error.message}`);
      return 0;
    }
  },
  // Helper function to get the attendance average for a department
  getAttendanceAvg: async (dateRange, userIds, companyId) => {
    try {
      let { startDate, endDate } = dateRange;
      const totalEmployeesWithinRange = await User.findAll({
        where: {
          id: {
            [Op.in]: userIds,
          },
        },
      });

      const avg = [];
      for (const user of totalEmployeesWithinRange) {
        let avgUser = 0;
        const userJoiningDate = user.createdAt;
        const formattedJoiningDate = new Date(userJoiningDate).toISOString().split("T")[0];
        if (startDate < formattedJoiningDate) {
          startDate = formattedJoiningDate;
        }
        const allWorkingDays = await getWorkingDays({ startDate, endDate }, userIds, companyId);
        const userWorkingDays = await getTotalPersentDays({ startDate, endDate }, user.id);
        if (parseInt(allWorkingDays) > 0) {
          avgUser = (parseInt(userWorkingDays) / parseInt(allWorkingDays)) * 100;
        }
        avg.push({ user_id: user.id, avg: avgUser });
      }

      const totalAvg = avg.length > 0 ? avg.reduce((acc, obj) => acc + obj.avg, 0) / avg.length : 0;
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
        userIds,
      };

      const [results] = await sequelize.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements,
      });

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

      return results ? results.website_name : "N/A";
    } catch (error) {
      console.error(`Error in mostUnproductiveWebsiteName: ${error.message}`);
      return "N/A";
    }
  },
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

      return results ? results.website_name : "N/A";
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
      return results ? results.appName : "N/A";
    } catch (error) {
      console.error(`Error in mostUnproductiveAppName: ${error.message}`);
      return "N/A";
    }
  },

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
      return results ? results.appName : "N/A";
    } catch (error) {
      console.error(`Error in mostproductiveAppName: ${error.message}`);
      return "N/A";
    }
  },
  getUserInCompany: async (companyId) => {
    const users = await User.findAll({
      where: { company_id: companyId, isAdmin: 0 },
      attributes: ["id", "fullname"],
      include: [
        {
          model: department,
          as: "department",
          attributes: ["name"],
        },
      ],
    });

    if (!users) return { status: false, message: "No user data found in company" };

    return { status: true, message: "User's data retrived successfully", data: users };
  },

  getProdWebCount: async (userIds, startOfDay, endOfDay) => {
    //     const query = `
    //                SELECT
    //     u.id AS userId,
    //     COUNT(DISTINCT CASE WHEN pw.website_name IS NOT NULL THEN uh.website_name END) AS productive_count,
    //     COUNT(DISTINCT CASE WHEN pw.website_name IS NULL THEN uh.website_name END) AS non_productive_count,
    //     DATE(uh.createdAt) AS record_date  -- Extracting the date part of the createdAt field
    // FROM
    //     users u
    // LEFT JOIN
    //     user_histories uh ON u.id = uh.userId
    //     AND uh.createdAt BETWEEN :startOfDay AND :endOfDay
    // LEFT JOIN
    //     productive_websites pw ON uh.website_name = pw.website_name
    // WHERE
    //     u.id IN (:userIds)
    // GROUP BY
    //     u.id, record_date;  -- Group by user and record_date
    //             `;

    //? To get everything in a single query
    // `WITH RECURSIVE DateRange AS (
    //     SELECT :startOfDay AS record_date
    //     UNION ALL
    //     SELECT DATE_ADD(record_date, INTERVAL 1 DAY)
    //     FROM DateRange
    //     WHERE record_date < :endOfDay
    // )
    // SELECT
    //     u.id AS userId,
    //     dr.record_date,  -- Include all dates from DateRange

    //     -- Data from app_histories
    //     a.appName,
    //     a.is_productive,
    //     IFNULL(SUM(TIMESTAMPDIFF(SECOND, a.startTime, a.endTime)), 0) AS time_spent_seconds,
    //     IFNULL(COUNT(a.id), 0) AS session_count,
    //     (
    //         SELECT IFNULL(SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)), 0)
    //         FROM app_histories ah
    //         WHERE ah.userId = u.id
    //         AND ah.createdAt BETWEEN :startOfDay AND :endOfDay
    //     ) AS total_time_spent_seconds,
    //     IFNULL(MAX(TIMESTAMPDIFF(SECOND, a.startTime, a.endTime)), 0) AS max_time_spent_seconds,

    //     -- Data from user_histories
    //     COUNT(DISTINCT CASE WHEN pw.website_name IS NOT NULL THEN uh.website_name END) AS productive_count,
    //     COUNT(DISTINCT CASE WHEN pw.website_name IS NULL THEN uh.website_name END) AS non_productive_count

    // FROM
    //     users u
    // CROSS JOIN
    //     DateRange dr
    // LEFT JOIN
    //     app_histories a
    //     ON u.id = a.userId
    //     AND DATE(a.createdAt) = dr.record_date  -- Match specific date
    // LEFT JOIN
    //     user_histories uh
    //     ON u.id = uh.userId
    //     AND DATE(uh.createdAt) = dr.record_date  -- Match specific date
    // LEFT JOIN
    //     productive_websites pw
    //     ON uh.website_name = pw.website_name

    // WHERE
    //     u.id IN (:userIds)

    // GROUP BY
    //     u.id, dr.record_date, a.appName, a.is_productive;
    // `;

    const query = `WITH RECURSIVE DateRange AS (
                  SELECT :startOfDay AS record_date
                  UNION ALL
                  SELECT DATE_ADD(record_date, INTERVAL 1 DAY)
                  FROM DateRange
                  WHERE record_date < :endOfDay
              )
              SELECT 
                  u.id AS userId,
                  COUNT(DISTINCT CASE WHEN pw.website_name IS NOT NULL THEN uh.website_name END) AS productive_count,
                  COUNT(DISTINCT CASE WHEN pw.website_name IS NULL THEN uh.website_name END) AS non_productive_count,
                  dr.record_date  -- Include all dates from DateRange
              FROM 
                  users u
              CROSS JOIN 
                  DateRange dr
              LEFT JOIN 
                  user_histories uh 
                  ON u.id = uh.userId 
                  AND DATE(uh.createdAt) = dr.record_date  -- Match specific date
              LEFT JOIN 
                  productive_websites pw 
                  ON uh.website_name = pw.website_name
              WHERE 
                  u.id IN (:userIds)
              GROUP BY 
                  u.id, dr.record_date;  -- Group by user and each date
              `;

    const results = await sequelize.query(query, {
      replacements: {
        startOfDay,
        endOfDay,
        userIds,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    return results;
  },

  getProdAppDetails: async (userIds, startOfDay, endOfDay) => {
    //     const query = `SELECT
    //     userId,
    //     appName,
    //     is_productive,
    //     IFNULL(SUM(TIMESTAMPDIFF(SECOND, startTime, endTime)), 0) AS time_spent_seconds,
    //     IFNULL(COUNT(*), 0) AS session_count,
    //     (
    //         SELECT IFNULL(SUM(TIMESTAMPDIFF(SECOND, startTime, endTime)), 0)
    //         FROM app_histories ah
    //         WHERE ah.userId = a.userId
    //         AND ah.createdAt BETWEEN :startOfDay AND :endOfDay
    //     ) AS total_time_spent_seconds,
    //     IFNULL(MAX(TIMESTAMPDIFF(SECOND, startTime, endTime)), 0) AS max_time_spent_seconds,
    //     DATE(a.createdAt) AS record_date  -- Extracting the date part of the createdAt field
    // FROM
    //     app_histories a
    // WHERE
    //     a.userId IN (:userIds)
    // GROUP BY
    //     userId, appName, is_productive, record_date;
    // `;

    const query = `WITH RECURSIVE DateRange AS (
                      SELECT :startOfDay AS record_date
                      UNION ALL
                      SELECT DATE_ADD(record_date, INTERVAL 1 DAY)
                      FROM DateRange
                      WHERE record_date < :endOfDay
                  )
                  SELECT 
                      u.id AS userId,
                      IFNULL(SUM(TIMESTAMPDIFF(SECOND, a.startTime, a.endTime)), 0) AS time_spent_seconds,
                      IFNULL(COUNT(a.id), 0) AS session_count,
                      (
                          SELECT IFNULL(SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)), 0)
                          FROM app_histories ah
                          WHERE ah.userId = u.id
                          AND DATE(ah.createdAt) = dr.record_date
                          AND ah.is_productive = 1  -- Time spent on productive apps
                      ) AS total_time_spent_on_productive_apps,  -- Time spent on productive apps on this date
                      (
                          SELECT IFNULL(SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)), 0)
                          FROM app_histories ah
                          WHERE ah.userId = u.id
                          AND DATE(ah.createdAt) = dr.record_date
                          AND ah.is_productive = 0  -- Time spent on non-productive apps
                      ) AS total_time_spent_on_non_productive_apps,  -- Time spent on non-productive apps on this date
                      IFNULL(MAX(TIMESTAMPDIFF(SECOND, a.startTime, a.endTime)), 0) AS max_time_spent_seconds,
                      dr.record_date  -- Ensures all dates are included
                  FROM 
                      users u
                  CROSS JOIN 
                      DateRange dr
                  LEFT JOIN 
                      app_histories a 
                      ON u.id = a.userId 
                      AND DATE(a.createdAt) = dr.record_date  -- Match specific date
                  WHERE 
                      u.id IN (:userIds)
                  GROUP BY 
                      u.id, dr.record_date;
                  `;

    const results = await sequelize.query(query, {
      replacements: {
        startOfDay,
        endOfDay,
        userIds,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    return results;
  },

  getTimeLogDetails: async (userIds, startOfDay, endOfDay) => {
    const query = `WITH RECURSIVE DateRange AS (
                            SELECT :startDate AS record_date
                            UNION ALL
                            SELECT DATE_ADD(record_date, INTERVAL 1 DAY)
                            FROM DateRange
                            WHERE record_date < :endDate
                        )
                        SELECT 
                            u.id AS userId,
                            tl.id AS timelogId,
                            tl.time_spent,
                            tl.is_active,
                            tl.timestamp,
                            dr.record_date  -- Include all dates from DateRange
                        FROM 
                            users u
                        CROSS JOIN 
                            DateRange dr
                        LEFT JOIN 
                            timelogs tl 
                            ON u.id = tl.userId 
                            AND DATE(tl.timestamp) = dr.record_date  -- Match specific date
                        WHERE 
                            u.id IN (:userIds)
                        ORDER BY 
                            u.id, dr.record_date, tl.timestamp;  -- Order by user, date, and timelog timestamp
                            `;

    const results = await sequelize.query(query, {
      replacements: {
        startOfDay,
        endOfDay,
        userIds,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    return results;
  },

  //  downloadFile = async (req, res, company_id, reportData, format, reportDescription, fromTime, toTime) => {
  //   try {
  //     const fileName = `${reportDescription}_${company_id}_${Date.now()}.${format === "xls" ? "xlsx" : "pdf"}`;
  //     const __dirname = path.dirname(fileURLToPath(import.meta.url));
  //     const filePath = path.resolve(__dirname, "../../../storage/files", fileName);
  //     if (format === "xls") {
  //       const workbook = new ExcelJS.Workbook();
  //       const worksheet = workbook.addWorksheet(reportDescription);

  //       if (reportDescription == "Attendance Report") {
  //         worksheet.columns = [
  //           { header: "Employee Name", key: "employee_name", width: 20 },
  //           { header: "Team", key: "team", width: 15 },
  //           { header: "Date", key: "date", width: 15 },
  //           { header: "Day", key: "day", width: 10 },
  //           { header: "Attendance Status", key: "attendance_status", width: 20 },
  //           { header: "Shift Time In", key: "shift_time_in", width: 15 },
  //           { header: "Time In", key: "time_in", width: 15 },
  //           { header: "Shift Time Out", key: "shift_time_out", width: 15 },
  //           { header: "Time Out", key: "time_out", width: 15 },
  //         ];
  //       } else if (reportDescription == "Productivity Report") {
  //         worksheet.columns = [
  //           { header: "Employee Name", key: "employee_name", width: 20 },
  //           { header: "Department", key: "department", width: 15 },
  //           { header: "Date", key: "date", width: 15 },
  //           { header: "Total Active Hours", key: "total_active_hours", width: 10 },
  //           { header: "Idle Time", key: "idle_time", width: 20 },
  //           { header: "Time on Productive Apps", key: "productive_app_time", width: 15 },
  //           { header: "Time on Non Prodcutive Apps", key: "nonProductive_app_time", width: 15 },
  //           { header: "Productive Websites Count", key: "productive_website_count", width: 15 },
  //           { header: "Non Productive Websites Count", key: "productive_website_count", width: 15 },
  //           { header: "Average Productive Percentage", key: "average_productive", width: 15 },
  //           { header: "Most Used Productive App", key: "most_used_productive_app", width: 15 },
  //         ];
  //       } else if (reportDescription == "Application Usage Report") {
  //         worksheet.columns = [
  //           { header: "Name", key: "name", width: 20 },
  //           { header: "Department", key: "department", width: 15 },
  //           { header: "Application", key: "applicationName", width: 15 },
  //           { header: "Productive/NonProducitve", key: "isProductive", width: 10 },
  //         ];
  //       } else if (reportDescription == "Unauthorized Report") {
  //         worksheet.columns = [
  //           { header: "Name", key: "name", width: 20 },
  //           { header: "Department", key: "department", width: 15 },
  //           { header: "URL", key: "url", width: 15 },
  //           { header: "Time", key: "time", width: 10 },
  //         ];
  //       } else if (reportDescription == "Department Performance Report") {
  //         worksheet.columns = [
  //           { header: "Employee Name", key: "employee_name", width: 20 },
  //           { header: "Team", key: "team", width: 15 },
  //           { header: "Date", key: "date", width: 15 },
  //           { header: "Day", key: "day", width: 10 },
  //           { header: "Attendance Status", key: "attendance_status", width: 20 },
  //           { header: "Shift Time In", key: "shift_time_in", width: 15 },
  //           { header: "Time In", key: "time_in", width: 15 },
  //           { header: "Shift Time Out", key: "shift_time_out", width: 15 },
  //           { header: "Time Out", key: "time_out", width: 15 },
  //         ];
  //       } else if (reportDescription == "Browser Activity Report") {
  //         worksheet.columns = [
  //           { header: "Employee Name", key: "employee_name", width: 20 },
  //           { header: "Team", key: "team", width: 15 },
  //           { header: "Date", key: "date", width: 15 },
  //           { header: "Day", key: "day", width: 10 },
  //           { header: "Attendance Status", key: "attendance_status", width: 20 },
  //           { header: "Shift Time In", key: "shift_time_in", width: 15 },
  //           { header: "Time In", key: "time_in", width: 15 },
  //           { header: "Shift Time Out", key: "shift_time_out", width: 15 },
  //           { header: "Time Out", key: "time_out", width: 15 },
  //         ];
  //       }

  //       worksheet.addRows(reportData);

  //       await workbook.xlsx.writeFile(filePath);

  //       res.setHeader(
  //         "Content-Type",
  //         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  //       );
  //       res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  //       res.download(filePath);

  //       const newAppInfo = await exportHistories.create({ reportName: reportDescription, filePath: filePath, reportExtension: format, periodFrom: fromTime, periodTo: toTime });
  //     } else {
  //       const generatePDF = () =>
  //         new Promise((resolve, reject) => {
  //           const doc = new PDFDocument();
  //           const writeStream = fs.createWriteStream(filePath);

  //           doc.pipe(writeStream);

  //           // Add title
  //           doc.fontSize(18).text(reportDescription, { align: "center" });
  //           doc.moveDown();

  //           // Add headers
  //           if (reportDescription == "Attendance Report") {
  //             doc.fontSize(12).text(
  //               "Employee Name | Team | Date | Day | Attendance Status | Shift Time In | Time In | Shift Time Out | Time Out",
  //               { underline: true }
  //             );
  //             doc.moveDown();

  //             reportData.forEach((row) => {
  //               doc
  //                 .fontSize(10)
  //                 .text(
  //                   `${row.employee_name} | ${row.team} | ${row.date} | ${row.day} | ${row.attendance_status} | ${row.shift_time_in} | ${row.time_in} | ${row.shift_time_out} | ${row.time_out}`
  //                 );
  //             });

  //           } else if (reportDescription == "Performance Report") {
  //             doc.fontSize(12).text(
  //               "Employee Name | Team | Date | Day | Attendance Status | Shift Time In | Time In | Shift Time Out | Time Out",
  //               { underline: true }
  //             );
  //             doc.moveDown();

  //             reportData.forEach((row) => {
  //               doc
  //                 .fontSize(10)
  //                 .text(
  //                   `${row.employee_name} | ${row.team} | ${row.date} | ${row.day} | ${row.attendance_status} | ${row.shift_time_in} | ${row.time_in} | ${row.shift_time_out} | ${row.time_out}`
  //                 );
  //             });
  //           } else if (reportDescription == "Application Report") {
  //             doc.fontSize(12).text(
  //               "Employee Name | Team | Date | Day | Attendance Status | Shift Time In | Time In | Shift Time Out | Time Out",
  //               { underline: true }
  //             );
  //             doc.moveDown();

  //             reportData.forEach((row) => {
  //               doc
  //                 .fontSize(10)
  //                 .text(
  //                   `${row.employee_name} | ${row.team} | ${row.date} | ${row.day} | ${row.attendance_status} | ${row.shift_time_in} | ${row.time_in} | ${row.shift_time_out} | ${row.time_out}`
  //                 );
  //             });
  //           } else if (reportDescription == "Unauthorized Report") {
  //             doc.fontSize(12).text(
  //               "Employee Name | Team | Date | Day | Attendance Status | Shift Time In | Time In | Shift Time Out | Time Out",
  //               { underline: true }
  //             );
  //             doc.moveDown();

  //             reportData.forEach((row) => {
  //               doc
  //                 .fontSize(10)
  //                 .text(
  //                   `${row.employee_name} | ${row.team} | ${row.date} | ${row.day} | ${row.attendance_status} | ${row.shift_time_in} | ${row.time_in} | ${row.shift_time_out} | ${row.time_out}`
  //                 );
  //             });
  //           } else if (reportDescription == "Department Performance Report") {
  //             doc.fontSize(12).text(
  //               "Employee Name | Team | Date | Day | Attendance Status | Shift Time In | Time In | Shift Time Out | Time Out",
  //               { underline: true }
  //             );
  //             doc.moveDown();

  //             reportData.forEach((row) => {
  //               doc
  //                 .fontSize(10)
  //                 .text(
  //                   `${row.employee_name} | ${row.team} | ${row.date} | ${row.day} | ${row.attendance_status} | ${row.shift_time_in} | ${row.time_in} | ${row.shift_time_out} | ${row.time_out}`
  //                 );
  //             });
  //           } else if (reportDescription == "Browser Activity Report") {
  //             doc.fontSize(12).text(
  //               "Employee Name | Team | Date | Day | Attendance Status | Shift Time In | Time In | Shift Time Out | Time Out",
  //               { underline: true }
  //             );
  //             doc.moveDown();

  //             reportData.forEach((row) => {
  //               doc
  //                 .fontSize(10)
  //                 .text(
  //                   `${row.employee_name} | ${row.team} | ${row.date} | ${row.day} | ${row.attendance_status} | ${row.shift_time_in} | ${row.time_in} | ${row.shift_time_out} | ${row.time_out}`
  //                 );
  //             });
  //           }

  //           doc.end();

  //           writeStream.on("finish", () => resolve());
  //           writeStream.on("error", (err) => reject(err));
  //         });

  //       await generatePDF();
  //       console.log(`File generated and sent to user: ${filePath}`);

  //       // Set headers for reading the file in the browser
  //       res.setHeader("Content-Type", "application/pdf");
  //       res.setHeader("Content-Disposition", "inline; filename=" + fileName);

  //       // Send the file as a response
  //       res.download(filePath);

  //     }
  //   } catch (error) {
  //     res.status(500).json({ status: "error", message: error.message });
  //   }
  // };

  downloadFileDynamically: async (res, fromTime, toTime, format = "xls", reportName, company_id, reportData, headers) => {
    const dbTransaction = await sequelize.transaction();

    try {
      const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
      const fileName = `${reportName}_${company_id}_${timestamp}.${format}`;

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      // Print the __dirname to verify
      console.log(__dirname);

      // Define the directory path correctly
      const directoryPath = path.resolve(__dirname, "../../../storage/files");
      const filePath = path.join(directoryPath, fileName);

      // Ensure the directory exists
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }
      const keys = Object.keys(reportData[0]);
      if (format === "xls") {
        const csvContent = [
          headers.join(","),
          ...reportData.map((row) => keys.map((key, index) => row[key] || "").join(",")), // Map data to headers
        ].join("\n");

        fs.writeFileSync(filePath, csvContent);
        console.log("XLS file written successfully:", filePath);

        const newAppInfo = await exportHistories.create(
          { reportName: reportName, company_id: company_id, filePath: filePath, reportExtension: format, periodFrom: fromTime, periodTo: toTime },
          { transaction: dbTransaction }
        );

        if (newAppInfo) {
          await dbTransaction.commit();
          return { status: 1 };
        } else {
          await dbTransaction.rollback();
          return { status: 0 };
        }
      } else if (format === "pdf") {
        try {
          const doc = new PDFDocument({ compress: false });
          const fileStream = fs.createWriteStream(filePath);

          doc.pipe(fileStream);

          // Add content to the PDF
          doc.fontSize(18).text(reportName, { align: "center" }).moveDown();
          const headerText = headers.join(" | ");
          doc.fontSize(12).text(headerText, { underline: true }).moveDown();

          reportData.forEach((row) => {
            const rowText = keys.map((key) => row[key] || "").join(" | "); // Dynamically map data to headers
            doc.fontSize(10).text(rowText);
          });

          doc.end();

          // Await for the file writing to finish
          await new Promise((resolve, reject) => {
            fileStream.on("finish", resolve);
            fileStream.on("error", reject);
          });

          // Save details to the database
          const newAppInfo = await exportHistories.create({
            reportName,
            company_id,
            filePath,
            reportExtension: format,
            periodFrom: fromTime,
            periodTo: toTime,
          });

          if (newAppInfo) {
            await dbTransaction.commit();
            return { status: 1 };
          } else {
            await dbTransaction.rollback();
            return { status: 0 };
          }
        } catch (err) {
          console.error("Error generating PDF report:", err);
          await dbTransaction.rollback();
          return helper.failed(res, variables.BadRequest, "File generation failed");
        }
      } else {
        await dbTransaction.rollback();
        return helper.failed(res, variables.BadRequest, "Unsupported File Request");
      }
    } catch (error) {
      console.error("Error generating file:", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  },
};
