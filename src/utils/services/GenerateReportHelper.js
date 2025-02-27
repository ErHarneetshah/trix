import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import { Op, fn, col, Sequelize, literal } from "sequelize";
import department from "../../database/models/departmentModel.js";
import TimeLog from "../../database/models/timeLogsModel.js";
import sequelize from "../../database/queries/dbConnection.js";
import User from "../../database/models/userModel.js";
import helper from "./helper.js";
import exportHistories from "../../database/models/exportHistoryModel.js";
import variables from "../../app/config/variableConfig.js";

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
    //helper.logger(res, "Generate Report Helper -> getWorkingDays", error);
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
    //helper.logger(null, "Generate Report Helper -> getTotalPersentDays", error);
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
      //helper.logger(null, "Generate Report Helper -> getTotalEmployeeDepartmentWise", error);
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
      //helper.logger(null, "Generate Report Helper -> getTotalEmployeeTeamWise", error);
      return 0;
    }
  },

  getAvgLoggedInTime: async (dateRange, userIds) => {
    try {
      let { startDate, endDate } = dateRange;
      if (userIds.length == 0) {
        return 0;
      }
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
      //helper.logger(null, "Generate Report Helper -> getAvgLoggedInTime", error);
      return 0;
    }
  },
  // Helper function to get the attendance average for a department
  getAttendanceAvg: async (dateRange, userIds, companyId) => {
    try {
      let { startDate, endDate } = dateRange;
      if (userIds.length == 0) {
        return 0;
      }
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
      //helper.logger(null, "Generate Report Helper -> getAttendanceAvg", error);
      return 0;
    }
  },

  getAvgProductiveAppTime: async (dateRange, userIds, companyId) => {
    try {
      let { startDate, endDate } = dateRange;
      if (userIds.length == 0) {
        return 0;
      }

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

      return results ? results.average_time_minutes : 0;
    } catch (error) {
      //helper.logger(null, "Generate Report Helper -> getAvgProductiveAppTime", error);
      return 0;
    }
  },

  getAvgNonProductiveAppTime: async (dateRange, userIds, companyId) => {
    try {
      let { startDate, endDate } = dateRange;
      if (userIds.length == 0) {
        return 0;
      }
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
      //helper.logger(null, "Generate Report Helper -> getAvgNonProductiveAppTime", error);
      return 0;
    }
  },

  mostUnproductiveWebsiteName: async (dateRange, userIds, companyId) => {
    try {
      const { startDate, endDate } = dateRange;
      if (userIds.length == 0) {
        return 0;
      }
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
      if (userIds.length == 0) {
        return 0;
      }
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
      if (userIds.length == 0) {
        return 0;
      }
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
      if (userIds.length == 0) {
        return 0;
      }

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
  getUserInCompany: async (companyId, teamId) => {
    const users = await User.findAll({
      where: { company_id: companyId, isAdmin: 0, teamId: teamId },
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

  getUserInCompanyWithoutTeam: async (companyId) => {
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
    const query = `SELECT
                  u.id AS userId,
                  COUNT(DISTINCT CASE WHEN pw.website_name IS NOT NULL THEN uh.website_name END) AS productive_count,
                  COUNT(DISTINCT CASE WHEN pw.website_name IS NULL THEN uh.website_name END) AS non_productive_count
              FROM
                  users u
              LEFT JOIN
                  user_histories uh
                  ON u.id = uh.userId
                  AND uh.createdAt BETWEEN :startOfDay AND :endOfDay
              LEFT JOIN
                  productive_websites pw
                  ON uh.website_name = pw.website_name
              WHERE
                  u.id IN (:userIds)
              GROUP BY
                  u.id
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
    const query = `WITH ranked_apps AS (
  SELECT
    u.id AS userId,
    a.appName,
    TIMESTAMPDIFF(SECOND, a.startTime, a.endTime) AS time_spent_seconds
  FROM users u
  LEFT JOIN app_histories a ON u.id = a.userId
  WHERE a.createdAt BETWEEN :startOfDay AND :endOfDay
  ORDER BY time_spent_seconds DESC
  LIMIT 1
)
SELECT
  u.id AS userId,
  IFNULL(SUM(TIMESTAMPDIFF(SECOND, a.startTime, a.endTime)), 0) AS time_spent_seconds,
  IFNULL(COUNT(a.id), 0) AS session_count,
  (
    SELECT IFNULL(SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)), 0)
    FROM app_histories ah
    WHERE ah.userId = u.id
      AND ah.createdAt BETWEEN :startOfDay AND :endOfDay
      AND ah.is_productive = 1
  ) AS total_time_spent_on_productive_apps,
  (
    SELECT IFNULL(SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)), 0)
    FROM app_histories ah
    WHERE ah.userId = u.id
      AND ah.createdAt BETWEEN :startOfDay AND :endOfDay
      AND ah.is_productive = 0
  ) AS total_time_spent_on_non_productive_apps,
  (
    SELECT time_spent_seconds
    FROM ranked_apps
    WHERE userId = u.id
  ) AS max_time_spent_on_app,
  ranked_apps.appName AS app_name_with_max_time
FROM users u
LEFT JOIN app_histories a ON u.id = a.userId
  AND a.createdAt BETWEEN :startOfDay AND :endOfDay
LEFT JOIN ranked_apps ON ranked_apps.userId = u.id
WHERE u.id IN (:userIds)
GROUP BY u.id;`;

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

  generateProductivityReport: async (data) => {
    const { users, ProdAppAnalysis, TimeLogs, ProductiveWebsite } = data;
    const report = users.map((user) => {
      const userProdAppAnalysis = ProdAppAnalysis.find((item) => item.userId === user.id);
      const userProdWebCount = ProductiveWebsite.find((item) => item.userId === user.id);
      const userTimeLog = TimeLogs.find((item) => item.userId === user.id);

      const totalTimeSpentOnProductiveApps = userProdAppAnalysis ? userProdAppAnalysis.total_time_spent_on_productive_apps : 0;
      const activeTimeInSeconds = userTimeLog ? userTimeLog.active_time_in_seconds : 0;

      const averageProductivePercentage = activeTimeInSeconds > 0 ? (totalTimeSpentOnProductiveApps / activeTimeInSeconds) * 100 : 0;

      return {
        "Employee Name": user.fullname,
        Department: user.department.name,
        Date: "2024-12-18", // Assuming you want to report for a specific date
        "Total Active Hours": userTimeLog ? (userTimeLog.active_time_in_seconds / 3600).toFixed(2) : "0.00",
        "Idle time": userTimeLog ? (userTimeLog.idle_Time / 3600).toFixed(2) : "0.00",
        "Time on Productive Apps": userProdAppAnalysis ? (userProdAppAnalysis.total_time_spent_on_productive_apps / 3600).toFixed(2) : "0.00",
        "Time on Non Productive Apps": userProdAppAnalysis ? (userProdAppAnalysis.total_time_spent_on_non_productive_apps / 3600).toFixed(2) : "0.00",
        "Productive Websites Count": userProdWebCount ? userProdWebCount.productive_count : 0,
        "Non Productive Websites Count": userProdWebCount ? userProdWebCount.non_productive_count : 0,
        "Average Productive %": averageProductivePercentage.toFixed(2) + "%",
        "Most Used Productive App": userProdAppAnalysis ? userProdAppAnalysis.app_name_with_max_time : "N/A",
      };
    });

    return report;
  },

  getTimeLogDetails: async (userIds, startOfDay, endOfDay) => {
    const query = `SELECT u.id AS userId,
       tl.id AS timelogId,
       (IFNULL(SUM(tl.active_time), 0) + IFNULL(SUM(tl.spare_time), 0) + IFNULL(SUM(tl.idle_time), 0)) / 60 AS active_time_in_hours,
       (IFNULL(SUM(tl.active_time), 0) + IFNULL(SUM(tl.spare_time), 0) + IFNULL(SUM(tl.idle_time), 0)) * 60 AS active_time_in_seconds,
       IFNULL(SUM(tl.idle_time), 0) / 60 As idle_Time,
       CASE
           WHEN tl.user_id IS NOT NULL THEN 'Present'
           ELSE 'Absent'
       END AS attendance
FROM users u
LEFT JOIN timelogs tl
       ON u.id = tl.user_id
       AND tl.createdAt BETWEEN :startOfDay AND :endOfDay
WHERE u.id IN (:userIds)
GROUP BY u.id, tl.createdAt;`;

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

  downloadFileDynamically: async (res, fromTime, toTime, format = "xls", reportName, company_id, reportData, headers) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
      const fileName = `${reportName}_${company_id}_${timestamp}.${format}`;

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      // Define the directory path correctly
      const directoryPath = path.resolve(__dirname, "../../../storage/files");
      const filePath = path.join(directoryPath, fileName);

      // Ensure the directory exists
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }

      const keys = reportData.length === 0 ? [] : Object.keys(reportData[0]);
      if (format === "xls") {
        const csvContent = [
          headers.join(","),
          ...reportData.map((row) => keys.map((key, index) => row[key] || "").join(",")), // Map data to headers
        ].join("\n");

        fs.writeFileSync(filePath, csvContent);
        console.log("XLS file written successfully:", filePath);

        const newAppInfo = await exportHistories.create(
          { reportName: reportName, company_id: company_id, filePath: filePath, reportExtension: format, periodFrom: fromTime, periodTo: toTime, data: JSON.stringify(reportData) },
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
        const doc = new PDFDocument({ compress: false });
        const fileStream = fs.createWriteStream(filePath);

        doc.pipe(fileStream);

        // Add report title
        doc.fontSize(10).text(reportName, { align: "center", underline: true }).moveDown(2);

        // Define table properties
        const tableTop = 100; // Starting Y position for the table
        // const columnWidths = [50, 60, 50, 50, 60, 50, 50, 50, 50];
        const columnWidths = Array(headers.length).fill(55);
        const rowHeight = 40;

        // Draw table headers
        let xPos = 50; // Starting X position
        let yPos = tableTop;

        headers.forEach((header, index) => {
          doc
            .rect(xPos, yPos, columnWidths[index], rowHeight)
            .fillAndStroke("#f0f0f0", "black") // Background and border color
            .fillColor("black")
            .fontSize(6)
            .text(header, xPos + 5, yPos + 5, {
              width: columnWidths[index] - 10, // Adjust width for padding
              align: "center",
              ellipsis: true,
            });
          xPos += columnWidths[index];
        });

        yPos += rowHeight; // Move to the next row

        // Draw table data
        reportData.forEach((row) => {
          xPos = 50; // Reset X position for each row
          keys.forEach((key, index) => {
            const cellText = row[key] || "";
            doc
              .rect(xPos, yPos, columnWidths[index], rowHeight)
              .stroke()
              .fillColor("black")
              .fontSize(6)
              .text(cellText, xPos + 5, yPos + 5, {
                width: columnWidths[index] - 10, // Adjust width for padding
                align: "center",
                ellipsis: true, // Truncate text with "..."
              });
            xPos += columnWidths[index];
          });
          yPos += rowHeight; // Move to the next row
        });

        // Finalize PDF
        doc.end();

        // Await file writing completion
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
      } else {
        await dbTransaction.rollback();
        return helper.failed(res, variables.BadRequest, "Unsupported File Request");
      }
    } catch (error) {
      console.error("Error generating file:", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  },

  generateProductivityReport: async (data) => {
    const { users, ProdAppAnalysis, TimeLogs, ProductiveWebsite } = data;
    let report;

    if (ProdAppAnalysis == 0 || TimeLogs == 0 || ProductiveWebsite == 0) {
      report = [
        {
          "Employee Name": "N/A",
          "Department": "N/A",
          "Total Active Hours": "N/A",
          "Idle time": "N/A",
          "Time on Productive Apps": "N/A",
          "Time on Non Productive Apps": "N/A",
          "Productive Websites Count": "N/A",
          "Non Productive Websites Count": "N/A",
          "Average Productive %": "N/A",
          "Most Used Productive App": "N/A",
        },
      ];
    } else {
      report = users.map((user) => {
        const userProdAppAnalysis = ProdAppAnalysis.find((item) => item.userId === user.id);
        const userProdWebCount = ProductiveWebsite.find((item) => item.userId === user.id);
        const userTimeLog = TimeLogs.find((item) => item.userId === user.id);

        const totalTimeSpentOnProductiveApps = userProdAppAnalysis ? userProdAppAnalysis.total_time_spent_on_productive_apps : 0;
        const activeTimeInSeconds = userTimeLog ? userTimeLog.active_time_in_seconds : 0;

        const averageProductivePercentage = activeTimeInSeconds > 0 ? (totalTimeSpentOnProductiveApps / activeTimeInSeconds) * 100 : 0;


        return {
          "Employee Name": user.fullname || "N/A",
          "Department": user.department?.name || "N/A",
          "Total Active Hours": userTimeLog?.active_time_in_seconds ? (userTimeLog.active_time_in_seconds / 3600).toFixed(2) : "0.00",
          "Idle time": userTimeLog?.idle_Time ? (userTimeLog.idle_Time / 3600).toFixed(2) : "0.00",
          "Time on Productive Apps": userProdAppAnalysis?.total_time_spent_on_productive_apps ? (userProdAppAnalysis.total_time_spent_on_productive_apps / 3600).toFixed(2) : "0.00",
          "Time on Non Productive Apps": userProdAppAnalysis?.total_time_spent_on_non_productive_apps ? (userProdAppAnalysis.total_time_spent_on_non_productive_apps / 3600).toFixed(2) : "0.00",
          "Productive Websites Count": `${userProdWebCount?.productive_count}`,
          "Non Productive Websites Count": `${userProdWebCount?.non_productive_count}`,
          "Average Productive %": averageProductivePercentage ? averageProductivePercentage.toFixed(2) + "%" : "0.00%",
          "Most Used Productive App": userProdAppAnalysis?.app_name_with_max_time || "N/A",
        };
      });
    }

    return report;
  },
};
