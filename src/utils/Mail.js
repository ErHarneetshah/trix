import nodeMailer from 'nodemailer'
import emailGateway from "../database/models/emailGatewayModel.js";
import responseUtils from "../utils/common/responseUtils.js";


const sendEmail = async (to, message, cc = '', subject = '', from = "") => {
    try {
        const activeEmailServer = await emailGateway.findOne({
            where: { is_active : 1 }
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
    
            let mailOptions = {
                from: from || activeEmailServer.username,
                to: to,
                subject: subject || 'Test',
                text: message,
                html: '<b>' + message + '</b>'
            };
        const info = await transporter.sendMail(mailOptions);
        if(info.messageId){
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

export default { sendEmail };


