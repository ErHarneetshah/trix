// // import mysql from "mysql2/promise";
// import OpenAI from "openai";
// import moment from "moment";
// import User from "../../../database/models/userModel.js";
// import helper from "../../../utils/services/helper.js";
// import variables from "../../config/variableConfig.js";
// import sequelize from "../../../database/queries/dbConnection.js";
// import {stream} from 'hono';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const aiController = {
//   getUserAnswerStream: (c) => {
//     console.log(c.query);
//     console.log("Incoming query:", c.query);

//     return stream(c, async (stream) => {
//       console.log("kkkkk");

//       try {
//         // Ensure c.query is populated
//         if (!c.query) {
//           console.log("No query parameters found in request.");
//           stream.write("Error: No query parameters found.");
//           stream.end(); // Close the stream properly
//           return;
//         }

//         const { date, userId, question } = c.query;
//         console.log("Processing query:", c.query); // Log query for debugging

//         // Validate the question
//         if (!question) {
//           console.log("Question is missing.");
//           stream.write("Error: Question is required.");
//           stream.end(); // Properly close the stream
//           return;
//         }

//         // If everything is fine, process the query
//         stream.write(`Processing your question: ${question}`);
//         stream.end();
//       } catch (error) {
//         console.error("Error occurred:", error.message);
//         stream.write("Error processing request.");
//         stream.end(); // Close the stream on error
//       }
//     });
//     // return stream(c, async (stream) => {
//     //   try {
//     //     console.log(c.query);

//     //     console.log("Received request to get user answer.");
//     //     // const { date, userId, question, timeRange = "day" } = c.req.query();
//     //     const { date, userId, question } = c.query;
//     //     // Validate the question
//     //     if (!question) {
//     //       console.log("Question is missing.");
//     //       stream.write("Question is required");
//     //       stream.abort();
//     //       return;
//     //     }

//     //     // Fetch user data
//     //     // const [userRows] = await sequelize.query(`SELECT * FROM users WHERE id = ?`,[userId]);
//     //     // if (userRows.length === 0) {
//     //     //   console.log(`User not found for userId: ${userId}`);
//     //     //   stream.write("User not found");
//     //     //   stream.abort();
//     //     //   return;
//     //     // }
//     //     let user = await sequelize.query(`SELECT * FROM users WHERE id = ${userId}`);
//     //     if (!user) {
//     //       console.log(`User not found for userId: ${userId}`);
//     //       stream.write("User not found");
//     //       stream.abort();
//     //       return;
//     //     }

//     //     console.log({"Id":userId,"question":question,"date":date});

//     //     // const targetUser = userRows[0];

//     //     // Handle date range
//     //     // const isValidDate = date && moment(date, ISO_8601, true).isValid();
//     //     // const initialDate = isValidDate ? moment(date) : moment(); // Use provided date or today's date
//     //     // let startDate = initialDate.format("YYYY-MM-DD");
//     //     // let endDate = startDate;

//     //     // if (timeRange === "week") {
//     //     //   startDate = initialDate.startOf("week").format("YYYY-MM-DD");
//     //     //   endDate = initialDate.endOf("week").format("YYYY-MM-DD");
//     //     // } else if (timeRange === "month") {
//     //     //   startDate = initialDate.startOf("month").format("YYYY-MM-DD");
//     //     //   endDate = initialDate.endOf("month").format("YYYY-MM-DD");
//     //     // }
//     //     // console.log(`Date range: ${startDate} to ${endDate}`);

//     //     // Fetch data from MySQL
//     //     const productiveItems = await getProductiveItems();
//     //     const urlHostUsageData = await getUrlHostUsageData(
//     //       userId,
//     //       startDate,
//     //       endDate
//     //     );
//     //     const appUsageData = await getAppUsageData(userId, startDate, endDate);
//     //     const timeLogData = await getTimeLogData(userId, startDate, endDate);

//     //     console.log("Data aggregation complete.");

//     //     // Prepare user records for OpenAI
//     //     const userRecords = {
//     //       user: targetUser,
//     //       userStatus: targetUser.status,
//     //       productiveItems,
//     //       appUsageData,
//     //       urlHostUsageData,
//     //       timeLogData,
//     //     };

//     //     const prompt = generatePrompt(question, targetUser, userRecords);

//     //     console.log("Sending request to OpenAI...");
//     //     const openAIResponse = await openai.chat.completions.create({
//     //       model: "gpt-4o-mini",
//     //       messages: [{ role: "user", content: prompt }],
//     //       max_tokens: 16384,
//     //       temperature: 0.8,
//     //       stream: true,
//     //     });

//     //     for await (const chunk of openAIResponse) {
//     //       stream.write(chunk.choices[0]?.delta?.content || "");
//     //     }
//     //     stream.abort();
//     //   } catch (error) {
//     //     console.error("Error in getUserAnswerStream:", error);
//     //     stream.write("An error occurred while processing your request.");
//     //     stream.abort();
//     //   }
//     // });
//   },

//   getUserdata: async (req, res) => {
//     try {
//       let data = await User.findAll({
//         where: { company_id: req.user.company_id, isAdmin: 0 },
//         attributes: ["id", "fullname"],
//       });
//       return helper.success(
//         res,
//         variables.Success,
//         "Data Fetched Succesfully",
//         data
//       );
//     } catch (error) {
//       return helper.failed(
//         res,
//         variables.BadRequest,
//         "Error fetching user data"
//       );
//     }
//   },
// };

// // Helper functions
// async function getProductiveItems() {
//   const [rows] = await pool.query(`SELECT * FROM productive_items`);
//   return rows;
// }

// async function getUrlHostUsageData(userId, startDate, endDate) {
//   const [rows] = await pool.query(
//     `
//     SELECT
//       SUBSTRING_INDEX(SUBSTRING_INDEX(history.url, '/', 3), '/', -1) AS site,
//       COUNT(*) AS count
//     FROM user_history AS history
//     WHERE history.user_id = ? AND history.date BETWEEN ? AND ?
//     GROUP BY site
//     ORDER BY count DESC`,
//     [userId, startDate, endDate]
//   );
//   return rows;
// }

// async function getAppUsageData(userId, startDate, endDate) {
//   const [rows] = await pool.query(
//     `
//     SELECT
//       app_history.app_name AS appName,
//       SUM(TIMESTAMPDIFF(MINUTE, app_history.start_time, app_history.end_time)) AS totalTimeSpent,
//       COUNT(*) AS count
//     FROM user_app_history AS app_history
//     WHERE app_history.user_id = ? AND app_history.date BETWEEN ? AND ?
//     GROUP BY app_history.app_name
//     ORDER BY totalTimeSpent DESC`,
//     [userId, startDate, endDate]
//   );
//   return rows;
// }

// async function getTimeLogData(userId, startDate, endDate) {
//   const [rows] = await pool.query(
//     `
//     SELECT
//       DATE(time_logs.date) AS date,
//       SUM(time_logs.duration) AS totalDuration,
//       JSON_ARRAYAGG(JSON_OBJECT(
//         'startTime', time_logs.start_time,
//         'endTime', time_logs.end_time,
//         'duration', time_logs.duration
//       )) AS sessions
//     FROM time_logs
//     WHERE time_logs.user_id = ? AND time_logs.date BETWEEN ? AND ?
//     GROUP BY DATE(time_logs.date)
//     ORDER BY date ASC`,
//     [userId, startDate, endDate]
//   );
//   return rows.map((row) => ({
//     date: row.date,
//     totalDuration: row.totalDuration,
//     sessions: JSON.parse(row.sessions),
//   }));
// }

// function generatePrompt(question, targetUser, userRecords) {
//   return `
//     Act as a professional AI assistant. Respond to user questions based on the provided data.
//     The question is: "${question}"
//     Here is the user data you should use:
//     UserId: ${targetUser.userId}
//     Username: ${targetUser.username}
//     User Status: ${userRecords.userStatus}
//     Productive Items: ${JSON.stringify(userRecords.productiveItems)}
//     App Usage Data: ${JSON.stringify(userRecords.appUsageData)}
//     URL Host Usage Data: ${JSON.stringify(userRecords.urlHostUsageData)}
//     Time Log Data: ${JSON.stringify(userRecords.timeLogData)}
//     (Total time spent for apps and totalDuration in timelogs is in minutes)
//     Your answer should strictly be based on the data provided above. If there is not enough data, respond accordingly.
//     Generate a responsive HTML webpage with charts and visualizations, including inline CSS and JavaScript.
//   `;
// }

// export default aiController;

// import mysql from "mysql2/promise";
import OpenAI from "openai";
import moment from "moment";
import User from "../../../database/models/userModel.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import sequelize from "../../../database/queries/dbConnection.js";
import { UserHistory } from "../../../database/models/UserHistory.js";
import { Op } from "sequelize";
import AppHistoryEntry from "../../../database/models/AppHistoryEntry.js";
import TimeLog from "../../../database/models/timeLogsModel.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getOpenAIResponse(userId, question, date) {
  // const prompt = `User ID: ${userId}\nQuestion: ${question}\nDate: ${date}\n\nPlease provide a helpful response.`;

  let user = await User.findOne({ where: { id: userId } });
  if (!user) {
    return { message: "User not found", status: 0 };
  }

  let siteUsageData = await UserHistory.findAll({
    attributes: [
      "website_name",
      [sequelize.fn("COUNT", sequelize.col("website_name")), "count"],
    ],
    where: {
      date: {
        [Op.eq]: date,
      },
      userId: userId,
    },
    group: ["website_name"],
    order: [[sequelize.literal("count"), "DESC"]],
    raw: true,
  });

  let appUsageData = await AppHistoryEntry.findAll({
    attributes: [
      "appName",
      [
        sequelize.literal("SUM(TIMESTAMPDIFF(SECOND, startTime, endTime))"),
        "totalTimeSpent",
      ],
      [sequelize.fn("COUNT", sequelize.col("appName")), "count"],
    ],
    where: {
      userId: userId,
      date: date,
    },
    group: ["appName"],
    order: [[sequelize.literal("totalTimeSpent"), "DESC"]],
    raw: true,
  });

  // Format the result
  let appData = appUsageData.map((entry) => ({
    appName: entry.appName,
    totalTimeSpent: (entry.totalTimeSpent / 60).toFixed(1),
    count: entry.count,
  }));

  let timeLogData = await TimeLog.findAll({
    attributes: [
      "date",
      [sequelize.fn("SUM", sequelize.col("active_time")), "totalDuration"],
      [sequelize.fn("COUNT", sequelize.col("logged_in_time")), "sessionsCount"],
      [
        sequelize.literal(
          'GROUP_CONCAT(CONCAT(logged_in_time, " - ", logged_out_time))'
        ),
        "sessions",
      ], 
    ],
    where: {
      user_id: userId, 
      date: date, 
    },
    group: ["date"], 
    order: [[sequelize.literal("totalDuration"), "DESC"]], 
    raw: true,
  });

  let timedata = timeLogData.map((entry) => {
    const sessions = entry.sessions.split(",").map((session) => {
      const [start, end] = session.split(" - ");

      const startTime = new Date(`1970-01-01T${start}:00Z`); 
      const endTime = new Date(`1970-01-01T${end}:00Z`);
      const duration = (endTime - startTime) / (1000 * 60);

      return { startTime: start, endTime: end, duration: duration.toFixed(1) };
    });

    return {
      date: entry.date,
      totalDuration: entry.totalDuration, 
      sessions: sessions,
    };
  });
  console.log({siteUsageData,appData,timedata});
  

  const prompt = `
  Act as a professional AI assistant. Respond to user questions based on the provided data.
  The question is: "${question}"
  Here is the user data you should use:
  UserId: ${userId}
  Username: ${user.fullname}
  User Status: ${user.currentStatus}
  App Usage Data: ${JSON.stringify(appData)}
  URL Host Usage Data: ${JSON.stringify(siteUsageData)}
  Time Log Data: ${JSON.stringify(timedata)}
  (Total time spent for apps and totalDuration in timelogs is in minutes)
  i want text report of given user data given all type measurment.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI:", message.error);
  }
}

const aiController = {
  getUserAnswerStream: async (req, res) => {
    const { userId, question, date } = req.query;

    if (!userId || !question || !date) {
      return helper.sendResponse(
        res,
        variables.ValidationError,
        0,
        "Missing required fields: userId, question, or date"
      );
    }

    try {
      const openAIResponse = await getOpenAIResponse(userId, question, date);
      if (openAIResponse && openAIResponse.status == 0) {
        throw new Error(openAIResponse.message);
      }
      return helper.sendResponse(
        res,
        variables.Success,
        1,
        { response: openAIResponse },
        "AI Report Get Successfully!!"
      );
    } catch (error) {
      return helper.sendResponse(
        res,
        variables.ValidationError,
        0,
        error.message
      );
    }
  },

  getUserdata: async (req, res) => {
    try {
      let data = await User.findAll({
        where: { company_id: req.user.company_id, isAdmin: 0 },
        attributes: ["id", "fullname"],
      });
      return helper.success(
        res,
        variables.Success,
        "Data Fetched Succesfully",
        data
      );
    } catch (error) {
      return helper.failed(
        res,
        variables.BadRequest,
        "Error fetching user data"
      );
    }
  },
};

export default aiController;
