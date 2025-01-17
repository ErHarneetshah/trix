import schedule from "node-schedule";
import { Op } from "sequelize";
import moment from "moment";
import accessToken from "../../database/models/accessTokenModel.js";

async function deleteExpireAccessToken() {
  try {
    let currentTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
    // Delete expired tokens
    const deletedCount = await accessToken.destroy({
      where: {
        expiry_time: {
          [Op.lt]: currentTime, // Tokens with expiry_time less than currentTime
        },
      },
    });

    console.log(`Deleted ${deletedCount} expired access tokens.`);
    console.log(`Job executed at: ${new Date()}`);
  } catch (error) {
    helper.logger(res, "Delete Expire Access Token -> deleteExpireAccessToken", error);
    console.log(error.message);
  }
}

export const job1 = schedule.scheduleJob("* * * * *", deleteExpireAccessToken); // Runs every minute

job1.on("error", (err) => {
  console.log("Error", err);
});
