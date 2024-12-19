import OpenAI from "openai";
import User from "../../../database/models/userModel.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import sequelize from "../../../database/queries/dbConnection.js";
import { UserHistory } from "../../../database/models/UserHistory.js";
import { Op } from "sequelize";
import AppHistoryEntry from "../../../database/models/AppHistoryEntry.js";
import TimeLog from "../../../database/models/timeLogsModel.js";
import { ProductiveApp } from "../../../database/models/ProductiveApp.js";
import ProductiveWebsite from "../../../database/models/ProductiveWebsite.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getOpenAIResponse(userId, question, date) {
  
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
  
  let productive_app = await ProductiveApp.findAll({where:{company_id:user.company_id,department_id:user.departmentId}});
  let productive_website = await ProductiveWebsite.findAll({where:{company_id:user.company_id,department_id:user.departmentId}});

  console.log({appData,siteUsageData});
  
  
  const prompt = `
  Act as a professional AI assistant. Respond to user questions based on the provided data.
  The question is: "${question}"
  Here is the user data you should use:
  UserId: ${userId}
  Username: ${user.fullname}
  User Status: ${user.currentStatus}
  App Usage Data: ${JSON.stringify(appData)}
  Productive App : ${JSON.stringify(productive_app)}
  URL Host Usage Data: ${JSON.stringify(siteUsageData)}
  Productive Website : ${JSON.stringify(productive_website)}
  Time Log Data: ${JSON.stringify(timedata)}
  (Total time spent for apps and totalDuration in timelogs is in minutes)
  I Want Text Response based on given data
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
