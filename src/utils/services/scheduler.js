import schedule from "node-schedule";
import { Op } from "sequelize";
import moment from "moment";
import accessToken from "../../database/models/accessTokenModel.js";

async function deleteExpireAccessToken() {
  try {
    // let now = new Date();
    // let formatter = new Intl.DateTimeFormat("en-IN", {
    //   timeZone: "Asia/Kolkata",
    //   year: "numeric",
    //   month: "2-digit",
    //   day: "2-digit",
    //   hour: "2-digit",
    //   minute: "2-digit",
    //   second: "2-digit",
    // });
    // let formattedDate = formatter.format(now);
    let currentTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
    await accessToken.destroy({
      where: {
        expiry_time: {
          [Op.lt]: currentTime, // Compare timestamps less than current time
        },
      },
    });
    //console.log("Delete Expire Token Worked Properly");
  } catch (error) {
    //console.log("Delete Expire Access Token Scheduler Error: ---------------------");
    //console.log(error.message);
    }
}

export const job1 = schedule.scheduleJob("* * * * *", deleteExpireAccessToken); // Runs every minute

job1.on("error", (err) => {
  //console.log("Error", err);
});
