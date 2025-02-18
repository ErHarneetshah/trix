import nodeMailer from 'nodemailer'
import emailGateway from "../database/models/emailGatewayModel.js";


const sendM = async (company_id, to, subject, message, cc = '', from = "", attachment = null) => {
    try {
        const activeEmailServer = await emailGateway.findOne({
            where: { is_active: 1, company_id: company_id }
        });

        if (activeEmailServer) {
            let transporter = nodeMailer.createTransport({
                host: activeEmailServer.host,
                port: activeEmailServer.port,
                secure: false,
                auth: {
                    user: activeEmailServer.username, // Email
                    pass: activeEmailServer.password,
                }
            });

            try {
                await transporter.verify();
            } catch (verifyError) {
                console.error("SMTP server verification failed:", verifyError.message);
                return { success: false, message: "SMTP server verification failed.", error: verifyError };
            }
            let mailOptions = {
                from: `${activeEmailServer.fromUsername} <${activeEmailServer.username}>`,
                to: to,
                subject: subject || 'Test',
                text: message,
                html: '<b>' + message + '</b>',
                attachments: attachment ? [attachment] : [],
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


