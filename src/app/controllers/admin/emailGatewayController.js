import emailGateway from "../../../database/models/emailGatewayModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import { Op } from "sequelize";
import validate from "../../../utils/CustomValidation.js";
import variables from "../../config/variableConfig.js";
import H from "../../../utils/Mail.js";
import helper from "../../../utils/services/helper.js";
import nodemailer from "nodemailer";

const addEmailGateeways = async (req, res) => {
  // ___________-------- Role Permisisons Exists or not ---------________________
  const routeMethod = req.method;
  const isApproved = await helper.checkRolePermission(req.user.roleId, "Email Gateway", routeMethod, req.user.company_id);
  if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
  // ___________-------- Role Permisisons Exists or not ---------________________

  try {
    let { protocol, host, username, password, port, encryption, fromUsername } = req.body;

    // Default encryption type and options
    const defaultEncryption = "tls";
    const encryptionOptions = ["tls", "ssl"];
    const validPorts = [587, 465, 25];

    // Validation rules
    const rules = {
      protocol: "required|string|min:2|max:50",
      host: "required|string|min:2|max:50",
      username: "required|string|min:1|max:100",
      password: "required|string|min:6",
      port: "required|numeric|min:1|max:65535",
      fromUsername: "required|email",
    };

    const { status, message } = await validate(req.body, rules);
    if (status === 0) {
      return helper.failed(res, variables.ValidationError, message);
    }

    // Ensure encryption type is valid or use default
    encryption = encryption ? encryption.toLowerCase() : defaultEncryption;
    if (!encryptionOptions.includes(encryption)) {
      return helper.failed(res, variables.ValidationError, "Invalid email encryption type provided. Use 'tls' or 'ssl'.");
    }

    // Validate SMTP port
    port = parseInt(port, 10);
    if (!validPorts.includes(port)) {
      return helper.failed(res, variables.ValidationError, `Invalid SMTP port provided. Valid ports are ${validPorts.join(", ")}.`);
    }

    // Configure nodemailer
    const transporterConfig = {
      host,
      port,
      secure: encryption === "ssl", // 'secure' is true only for SSL
      auth: {
        user: fromUsername,
        pass: password,
      },
    };

    const transporter = nodemailer.createTransport(transporterConfig);

    // Log configuration for debugging

    // Verify SMTP credentials
    // try {
    //   await transporter.verify();
    // } catch (verifyError) {
    //   console.error("SMTP verification failed:", verifyError);
    //   return helper.failed(
    //     res,
    //     variables.BadRequest,
    //     "SMTP verification failed: " + verifyError.message
    //   );
    // }

    // Reset existing gateways for the company
    await emailGateway.destroy({ where: { company_id: req.user.company_id } });
    await sequelize.query(`ALTER TABLE \`${emailGateway.getTableName()}\` AUTO_INCREMENT = 1;`);

    // Save the new gateway
    const gateway = await emailGateway.create({
      company_id: req.user.company_id,
      protocol,
      host,
      username,
      password,
      port,
      encryption,
      fromUsername,
    });

    return helper.success(res, variables.Created, "Email gateway created successfully.", gateway);
  } catch (error) {
    console.error("Error while creating the email gateway setup:", error);
    helper.logger(res, "Email Gateway Controller -> addEmailGateeways", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const checkEmailServer = async (req, res) => {
  try {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "Email Gateway", routeMethod, req.user.company_id);
    if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________

    const { to, subject, message } = req.body;

    const rules = {
      to: "required|string|min:1|max:100",
      subject: "required|string|min:3|max:100",
      message: "required|string|min:5|max:1000",
    };

    const { status, message: validationMessage } = await validate(req.body, rules);
    if (status === 0) {
      return helper.failed(res, variables.ValidationError, validationMessage);
    }

    const sendmail = await H.sendM(req.user.company_id, to, subject, message);
    if (sendmail.success) {
      return helper.success(res, variables.Success, sendmail.message);
    } else {
      return helper.failed(res, variables.BadRequest, "Please check the credentials first.");
    }
  } catch (error) {
    helper.logger(res, "Email Gateway Controller -> checkEmailServer", error);
    return helper.failed(res, variables.BadRequest, "Unable To Send Mail. Please Try Again Later!");
  }
};

const getEmailList = async (req, res) => {
  // ___________-------- Role Permisisons Exists or not ---------________________
  const routeMethod = req.method;
  const isApproved = await helper.checkRolePermission(req.user.roleId, "Email Gateway", routeMethod, req.user.company_id);
  if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
  // ___________-------- Role Permisisons Exists or not ---------________________

  try {
    const getEmailGateway = await emailGateway.findAll({
      where: {
        is_active: {
          [Op.ne]: 0,
        },
      },
      attributes: ["id", "protocol", "host", "username", "port", "encryption"],
    });
    return helper.success(res, variables.Success, "Retrieved  Email Lists Successfully", getEmailGateway);
  } catch (error) {
    console.error("Error blocking website:", error);
    helper.logger(res, "Email Gateway Controller -> getEmailList", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

export default { addEmailGateeways, checkEmailServer, getEmailList };
