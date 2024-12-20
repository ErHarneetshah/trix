import { QueryTypes, Sequelize } from 'sequelize';
import User from '../database/models/userModel.js';
import helper from '../utils/services/helper.js';
import H from '../utils/Mail.js';
import variables from '../app/config/variableConfig.js';
import path from 'path';
import commonfuncitons from '../utils/services/commonfuncitons.js';

const sendEmailWithReports = async (req, res) => {
    try {
        const date = new Date();
        // const todayDate = '2025-01-01';

        const todayDate = date.toISOString().split('T')[0];

        const limit = 1000;
        let offset = 0;
        let hasMoreData = true;

        while (hasMoreData) {
            const admins = await User.sequelize.query(
                `SELECT u.id, u.email, rs.status FROM users AS u LEFT JOIN report_settings AS rs ON u.company_id = rs.company_id WHERE u.isAdmin = 1 AND u.next_reports_schedule_date = :todayDate LIMIT :limit OFFSET :offset`,
                {
                    replacements: { todayDate, limit, offset },
                    type: QueryTypes.SELECT,
                }
            );

            if (admins.length === 0) {
                if (offset === 0) {
                    //console.log("No admins found, skipping sending reports via email.");
                }
                hasMoreData = false;
                break;
            }

            for (const admin of admins) {
                try {
                    if (!admin.status) {
                        console.warn(`No status found for admin ID: ${admin.id}, email: ${admin.email}`);
                        continue;
                    }
                    const __dirname = path.dirname(new URL(import.meta.url).pathname);
                    const filePath = path.resolve(__dirname, '../storage/files/work_reports.csv');

                    const attachment = {
                        filename: 'work_reports.csv',
                        path: filePath,
                        contentType: 'text/csv',
                    };

                    let message = (admin.status == 1) ? "Employees Monthly Reports" : (admin.status == 2) ? "Employees Weekly Reports" : (admin.status == 3) ? "Employees Daily Report" : "Unknown Report Status";

                    const sendmail = await H.sendM(admin.email, "Reports Data", message, '', '', attachment);
                    if (sendmail.success) {
                        //get the report status and then after sending the mail update the users table next_reports_scheduling date

                        let resultDate = (admin.status === 1) ? commonfuncitons.getNextMonthDate() : (admin.status === 2) ? commonfuncitons.getNextMondayDate() : (admin.status === 3) ? commonfuncitons.getTomorrowDate() : "Unknown Error in sendEmailWithReports";

                        const [updatedUsers] = await User.update(
                            { next_reports_schedule_date: resultDate },
                            { where: { id: admin.id } }
                        );

                        //console.log("Report Send Successfully.");
                    } else {
                        //console.log("Error while sending the reports to the admin");
                    }
                } catch (error) {
                    console.error(`Failed to send email to ${admin.email}:`, error.message);
                }
            }
            offset += limit;
        }
    } catch (error) {
        console.error("Error fetching while sending reports:", error);
        return helper.failed(res, variables.BadRequest, error.message);
    }
};

export default { sendEmailWithReports };
