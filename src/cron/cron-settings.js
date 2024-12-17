
import sendEmailWithReports from '../cron/cronFunctions'

async function sendReports(req, res) {
    try {
        await sendEmailWithReports(req, res);
    } catch (e) {
        console.log(e.message);
    }
}