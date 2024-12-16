// import moment, { ISO_8601 } from 'moment';
// import { createPool } from 'mysql2/promise'; 
// import { stream } from './stream'; 
// import { chat } from './openai'; 

// // MySQL connection setup
// const pool = createPool({
//   host: 'localhost',
//   user: 'root',
//   password: 'password',
//   database: 'your_database',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// const getUserAnswerStream = (req, res) => {
//   stream(res, async (stream) => {
//     try {
//       console.log("Received request to get user answer.");
//       const { date, userId, question, timeRange = "day" } = req.query;

//       // Validate required parameters
//       if (!question) {
//         console.log("Question is missing.");
//         stream.write("Question is required");
//         stream.abort();
//         return;
//       }

//       // Fetch user from the database
//       const [userRows] = await pool.query(
//         `SELECT * FROM users WHERE userId = ?`,
//         [userId]
//       );
//       const targetUser = userRows[0];
//       if (!targetUser) {
//         console.log(`User not found for userId: ${userId}`);
//         stream.write("User not found");
//         stream.abort();
//         return;
//       }

//       // Validate and set date range
//       const isValidDate = date && moment(date, ISO_8601, true).isValid();
//       const initialDate = isValidDate ? moment(date) : moment();

//       let startDate = initialDate.format("YYYY-MM-DD");
//       let endDate = startDate;

//       if (timeRange === "week") {
//         startDate = initialDate.startOf('week').format("YYYY-MM-DD");
//         endDate = initialDate.endOf('week').format("YYYY-MM-DD");
//       } else if (timeRange === "month") {
//         startDate = initialDate.startOf('month').format("YYYY-MM-DD");
//         endDate = initialDate.endOf('month').format("YYYY-MM-DD");
//       }
//       console.log(`Date range: ${startDate} to ${endDate}`);

//       // Fetch productive items
//       const [productiveItemsRows] = await pool.query(`SELECT * FROM productive_items`);
//       const productiveItems = productiveItemsRows;

//       console.log("Fetched productive items.");

//       // Aggregate URL host usage data
//       const [urlHostUsageData] = await pool.query(
//         `SELECT 
//           SUBSTRING_INDEX(SUBSTRING_INDEX(history.url, '/', 3), '/', -1) AS site,
//           COUNT(*) AS count
//          FROM user_history AS history
//          WHERE date BETWEEN ? AND ?
//          AND user_id = ?
//          GROUP BY site
//          ORDER BY count DESC`,
//         [startDate, endDate, targetUser.id]
//       );
//       console.log("Aggregated URL host usage data.");

//       // Aggregate app usage data
//       const [appUsageData] = await pool.query(
//         `SELECT 
//           appHistory.appName AS appName,
//           SUM(TIMESTAMPDIFF(MINUTE, appHistory.startTime, appHistory.endTime)) AS totalTimeSpent,
//           COUNT(*) AS count
//          FROM user_app_history AS appHistory
//          WHERE date BETWEEN ? AND ?
//          AND user_id = ?
//          GROUP BY appName
//          ORDER BY totalTimeSpent DESC`,
//         [startDate, endDate, targetUser.id]
//       );
//       console.log("Aggregated app usage data.");

//       // Aggregate time logs
//       const [timeLogData] = await pool.query(
//         `SELECT 
//           DATE(timeLogs.date) AS date,
//           SUM(timeLogs.duration) AS totalDuration,
//           JSON_ARRAYAGG(
//             JSON_OBJECT(
//               'startTime', timeLogs.startTime,
//               'endTime', timeLogs.endTime,
//               'duration', timeLogs.duration
//             )
//           ) AS sessions
//          FROM time_logs AS timeLogs
//          WHERE timeLogs.date BETWEEN ? AND ?
//          AND timeLogs.user_id = ?
//          GROUP BY DATE(timeLogs.date)
//          ORDER BY DATE(timeLogs.date) ASC`,
//         [startDate, endDate, targetUser.id]
//       );
//       console.log("Aggregated time log data.");

//       // Prepare data for AI prompt
//       const userRecords = {
//         user: targetUser,
//         userStatus: targetUser.status,
//         appUsageData,
//         urlHostUsageData,
//         timeLogData,
//         productiveItems,
//       };

//       const prompt = `
//         Act as a professional AI assistant. Respond to user questions based on the provided data.
//         The question is: "${question}"
//         Here is the user data you should use:
//         UserId: ${targetUser.userId}
//         Username: ${targetUser.username}
//         User Status: ${userRecords.userStatus}
//         Productive Items: ${JSON.stringify(userRecords.productiveItems)}
//         App Usage Data: ${JSON.stringify(userRecords.appUsageData)}
//         URL Host Usage Data: ${JSON.stringify(userRecords.urlHostUsageData)}
//         Time Log Data: ${JSON.stringify(userRecords.timeLogData)}
//         (Total time spent for apps and totalDuration in timelogs is in minutes)
//         Your answer should strictly be based on the data provided above. If there is not enough data or no data related to the question, then answer accordingly.
//         The answer should consist solely of HTML code that works responsively with charts and visualizations, including inline CSS and JavaScript.
//       `;

//       console.log("Sending request to OpenAI...");
//       const openAIResponse = await chat.completions.create({
//         model: "gpt-4",
//         messages: [{ role: "user", content: prompt }],
//         max_tokens: 16384,
//         temperature: 0.8,
//         stream: true,
//       });

//       // Stream the AI's response
//       for await (const chunk of openAIResponse) {
//         stream.write(chunk.choices[0]?.delta?.content || "");
//       }
//       stream.abort();
//     } catch (error) {
//       console.error("Error in getUserAnswerStream:", error);
//       stream.write("An error occurred while processing your request.");
//       stream.abort();
//     }
//   });
// };

// export default { getUserAnswerStream };
