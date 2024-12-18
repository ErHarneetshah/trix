// import mysql from "mysql2/promise";
import OpenAI from "openai";
import moment from "moment";
import { stream } from "hono/streaming";
import User from "../../../database/models/userModel.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const aiController = {
  getUserAnswerStream: (c) => {
    return stream(c, async (stream) => {
      try {
        console.log("Received request to get user answer.");
        const { date, userId, question, timeRange = "day" } = c.req.query();

        // Validate the question
        if (!question) {
          console.log("Question is missing.");
          stream.write("Question is required");
          stream.abort();
          return;
        }

        // Fetch user data
        const [userRows] = await pool.query(
          `SELECT * FROM users WHERE userId = ?`,
          [userId]
        );
        if (userRows.length === 0) {
          console.log(`User not found for userId: ${userId}`);
          stream.write("User not found");
          stream.abort();
          return;
        }
        const targetUser = userRows[0];

        // Handle date range
        const isValidDate = date && moment(date, ISO_8601, true).isValid();
        const initialDate = isValidDate ? moment(date) : moment(); // Use provided date or today's date
        let startDate = initialDate.format("YYYY-MM-DD");
        let endDate = startDate;

        if (timeRange === "week") {
          startDate = initialDate.startOf("week").format("YYYY-MM-DD");
          endDate = initialDate.endOf("week").format("YYYY-MM-DD");
        } else if (timeRange === "month") {
          startDate = initialDate.startOf("month").format("YYYY-MM-DD");
          endDate = initialDate.endOf("month").format("YYYY-MM-DD");
        }
        console.log(`Date range: ${startDate} to ${endDate}`);

        // Fetch data from MySQL
        const productiveItems = await getProductiveItems();
        const urlHostUsageData = await getUrlHostUsageData(
          userId,
          startDate,
          endDate
        );
        const appUsageData = await getAppUsageData(userId, startDate, endDate);
        const timeLogData = await getTimeLogData(userId, startDate, endDate);

        console.log("Data aggregation complete.");

        // Prepare user records for OpenAI
        const userRecords = {
          user: targetUser,
          userStatus: targetUser.status,
          productiveItems,
          appUsageData,
          urlHostUsageData,
          timeLogData,
        };

        const prompt = generatePrompt(question, targetUser, userRecords);

        console.log("Sending request to OpenAI...");
        const openAIResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 16384,
          temperature: 0.8,
          stream: true,
        });

        for await (const chunk of openAIResponse) {
          stream.write(chunk.choices[0]?.delta?.content || "");
        }
        stream.abort();
      } catch (error) {
        console.error("Error in getUserAnswerStream:", error);
        stream.write("An error occurred while processing your request.");
        stream.abort();
      }
    });
  },

  getUserdata: async (req, res) => {
    try {
      let data = await User.findAll({
        where: { company_id: req.user.company_id },
        attributes: ["id", "fullname"],
      });
      return helper.success(res, variables.Success, "Data Fetched Succesfully", data);
    } catch (error) {
      return helper.failed(
        res,
        variables.BadRequest,
        "Error fetching user data"
      );
    }
  },
};

// Helper functions
async function getProductiveItems() {
  const [rows] = await pool.query(`SELECT * FROM productive_items`);
  return rows;
}

async function getUrlHostUsageData(userId, startDate, endDate) {
  const [rows] = await pool.query(
    `
    SELECT 
      SUBSTRING_INDEX(SUBSTRING_INDEX(history.url, '/', 3), '/', -1) AS site, 
      COUNT(*) AS count 
    FROM user_history AS history 
    WHERE history.user_id = ? AND history.date BETWEEN ? AND ? 
    GROUP BY site 
    ORDER BY count DESC`,
    [userId, startDate, endDate]
  );
  return rows;
}

async function getAppUsageData(userId, startDate, endDate) {
  const [rows] = await pool.query(
    `
    SELECT 
      app_history.app_name AS appName, 
      SUM(TIMESTAMPDIFF(MINUTE, app_history.start_time, app_history.end_time)) AS totalTimeSpent, 
      COUNT(*) AS count 
    FROM user_app_history AS app_history 
    WHERE app_history.user_id = ? AND app_history.date BETWEEN ? AND ? 
    GROUP BY app_history.app_name 
    ORDER BY totalTimeSpent DESC`,
    [userId, startDate, endDate]
  );
  return rows;
}

async function getTimeLogData(userId, startDate, endDate) {
  const [rows] = await pool.query(
    `
    SELECT 
      DATE(time_logs.date) AS date, 
      SUM(time_logs.duration) AS totalDuration, 
      JSON_ARRAYAGG(JSON_OBJECT(
        'startTime', time_logs.start_time, 
        'endTime', time_logs.end_time, 
        'duration', time_logs.duration
      )) AS sessions 
    FROM time_logs 
    WHERE time_logs.user_id = ? AND time_logs.date BETWEEN ? AND ? 
    GROUP BY DATE(time_logs.date) 
    ORDER BY date ASC`,
    [userId, startDate, endDate]
  );
  return rows.map((row) => ({
    date: row.date,
    totalDuration: row.totalDuration,
    sessions: JSON.parse(row.sessions),
  }));
}

function generatePrompt(question, targetUser, userRecords) {
  return `
    Act as a professional AI assistant. Respond to user questions based on the provided data.
    The question is: "${question}"
    Here is the user data you should use:
    UserId: ${targetUser.userId}
    Username: ${targetUser.username}
    User Status: ${userRecords.userStatus}
    Productive Items: ${JSON.stringify(userRecords.productiveItems)}
    App Usage Data: ${JSON.stringify(userRecords.appUsageData)}
    URL Host Usage Data: ${JSON.stringify(userRecords.urlHostUsageData)}
    Time Log Data: ${JSON.stringify(userRecords.timeLogData)}
    (Total time spent for apps and totalDuration in timelogs is in minutes)
    Your answer should strictly be based on the data provided above. If there is not enough data, respond accordingly.
    Generate a responsive HTML webpage with charts and visualizations, including inline CSS and JavaScript.
  `;
}

export default aiController;
