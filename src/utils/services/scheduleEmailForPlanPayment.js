import schedule from "node-schedule";
import moment from "moment";
import company from "../../database/models/company.js";

async function scheduleEmailForPlanPayment() {
  try {
    for (let i = 5; i <= 1; i--) {
      let currentTime = moment().tz("Asia/Kolkata").add(i, "days").format("YYYY-MM-DD");
      const getUserRecords = await company.findAll({
        where: { planEndDate: currentTime },
      });

      if (getUserRecords) {
        getUserRecords.forEach(async (record) => {
          let textMessage = `Hello ${record.name},\n\nYour Company Plan Pack is going to end in ${i} days. We request you please recharge your plan pack for continue smooth usage of our product Emonitrix. \n\nBest regards`;

          let subject = "Emonitrix Monthly Subscription";
          let sendmail = await H.sendM(record.id, record.email, subject, textMessage);

          if (!sendmail.success) {
            await dbTransaction.rollback();
            return helper.failed(res, variables.BadRequest, "Please Set the Email Credentials First");
          }
        });
      }

      console.log(`Plan Payment Email Scheduler Job executed at: ${new Date()}`);
    }
  } catch (error) {
    console.log(error.message);
  }
}

export const job1 = schedule.scheduleJob("0 0 * * *", scheduleEmailForPlanPayment); // Runs every day at mid-night

job1.on("error", (err) => {
  console.log("Error", err);
});
