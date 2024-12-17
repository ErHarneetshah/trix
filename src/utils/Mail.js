import nodeMailer from 'nodemailer'
import emailGateway from "../database/models/emailGatewayModel.js";


const sendM = async (to, subject, message, cc = '', from = "") => {
    try {
        const activeEmailServer = await emailGateway.findOne({
            where: { is_active: 1 }
        });

        if (activeEmailServer) {
            let transporter = nodeMailer.createTransport({
                host: activeEmailServer.host,
                port: activeEmailServer.port,
                secure: false,
                auth: {
                    user: activeEmailServer.username,
                    pass: activeEmailServer.password
                }
            });

            try {
                await transporter.verify();
                console.log("SMTP server is ready to take our messages.");
            } catch (verifyError) {
                console.error("SMTP server verification failed:", verifyError.message);
                return { success: false, message: "SMTP server verification failed.", error: verifyError };
            }
            
            let mailOptions = {
                from: from || activeEmailServer.username,
                to: to,
                subject: subject || 'Test',
                text: message,
                html: '<b>' + message + '</b>'
            };
            const info = await transporter.sendMail(mailOptions);
            if (info.messageId) {
                return { success: true, message: "Email sent successfully.", info };
            }
        } else {
            return { success: false, message: "Failed to send email." };
        }
    } catch (error) {
        console.log({ 'mailer_error': error });
        return 0;
    }

};

export default { sendM };


