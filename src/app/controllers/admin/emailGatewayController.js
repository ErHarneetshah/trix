import emailGateway from "../../../database/models/emailGatewayModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import { Op } from "sequelize";
import validate from "../../../utils/CustomValidation.js";
import variables from "../../config/variableConfig.js";
import H from "../../../utils/Mail.js";
import helper from "../../../utils/services/helper.js";
import nodemailer from "nodemailer";

// const addEmailGateeways = async (req, res) => {
//     try {
//         const { protocol, host, username, password, port } = req.body;
//         let encryption = "tls"; // default option for encryption
//         const rules = {
//             protocol: 'required|string|min:2|max:50',
//             host: 'required|string|min:2|max:50',
//             username: 'required|email',
//             password: [
//                 'required',
//             ],
//             port: 'required|numeric|min:1|max:65535',
//             // encryption: 'required|string|min:2|max:50'
//         };

//         const { status, message } = await validate(req.body, rules);
//         if (status === 0) {
//             return helper.failed(res, variables.ValidationError, message);
//         }

//         await emailGateway.destroy({ where: {} });
//         await sequelize.query(`ALTER TABLE \`${emailGateway.getTableName()}\` AUTO_INCREMENT = 1;`);

//         await emailGateway.create({ protocol, host, username, password, port, encryption });
//         return helper.success(res, variables.Created, "Created the Email Gateway Successfully");
//     } catch (error) {
//         console.error('Error while creating the email gateway setup', error);
//         return helper.failed(res, variables.BadRequest, error.message);
//     }
// };

const addEmailGateeways = async (req, res) => {
  try {
    let { protocol, host, username, password, port, encryption } = req.body;

    console.log(req.body);
    // Default encryption type
    const defaultEncryption = "tls";
    const encryptionOptions = ["tls", "ssl"];

    const rules = {
      protocol: "required|string|min:2|max:50",
      host: "required|string|min:2|max:50",
      username: "required|string|min:1|max:100",
      password: "required|string|min:6",
      port: "required|numeric|min:1|max:65535",
    };

    if (encryption) {
        encryption = encryption.toLowerCase();
      if (!encryptionOptions.includes(encryption)) {
        return helper.failed(
          res,
          variables.ValidationError,
          "Invalid Email encryption provided"
        );
      }
    }

    const isport = parseInt(req.body.port, 10);
    const validPorts = [587, 465, 25];
    if (!validPorts.includes(isport)) {
      return helper.failed(
        res,
        variables.ValidationError,
        "Invalid SMTP port provided"
      );
    }

    const { status, message } = await validate(req.body, rules);
    if (status === 0) {
      return helper.failed(res, variables.ValidationError, message);
    }

    const selectedEncryption = encryptionOptions.includes(encryption)
      ? encryption
      : defaultEncryption;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: {
        user: username,
        pass: password,
      },
    });

    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error("Email gateway verification failed:", verifyError);
      return helper.failed(
        res,
        variables.BadRequest,
        "Email gateway verification failed. Please check your credentials and try again."
      );
    }

    await emailGateway.destroy({ where: { company_id: req.user.company_id } });
    await sequelize.query(
      `ALTER TABLE \`${emailGateway.getTableName()}\` AUTO_INCREMENT = 1;`
    );

    // Save the new gateway
    const gateway = await emailGateway.create({
      company_id: req.user.company_id,
      protocol,
      host,
      username,
      password,
      port,
      encryption: selectedEncryption,
    });

    return helper.success(
      res,
      variables.Created,
      "Created the Email Gateway Successfully",
      gateway
    );
  } catch (error) {
    console.error("Error while creating the email gateway setup:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const checkEmailServer = async (req, res) => {
  const { to, subject, message } = req.body;

  const rules = {
    to: "required|string|min:1|max:100",
    subject: "required|string|min:3|max:100",
    message: "required|string|min:5|max:1000",
  };

  const { status, message: validationMessage } = await validate(
    req.body,
    rules
  );
  if (status === 0) {
    return helper.failed(res, variables.ValidationError, validationMessage);
  }

  const sendmail = await H.sendM(to, subject, message);
  if (sendmail.success) {
    return helper.success(res, variables.Success, sendmail.message);
  } else {
    return helper.failed(
      res,
      variables.BadRequest,
      "PLease check the credentials first."
    );
  }
};

const getEmailList = async (req, res) => {
  try {
    const getEmailGateway = await emailGateway.findAll({
      where: {
        is_active: {
          [Op.ne]: 0,
        },
      },
      attributes: ["id", "protocol", "host", "username", "port", "encryption"],
    });
    return helper.success(
      res,
      variables.Success,
      "Retrieved  Email Lists Successfully",
      getEmailGateway
    );
  } catch (error) {
    console.error("Error blocking website:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

export default { addEmailGateeways, checkEmailServer, getEmailList };
