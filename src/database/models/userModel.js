import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../queries/dbConnection.js";
import department from "./departmentModel.js";
import designation from "./designationModel.js";
import role from "./roleModel.js";
import team from "./teamModel.js";
import helper from "../../utils/services/helper.js";
import variables from "../../app/config/variableConfig.js";
import { io } from "../../../app.js";

const User = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    socket_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true, // Ensures the value is a valid email
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      // validate: {
      //   notEmpty: true, // Prevents empty string
      // },
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: true,
      // validate: {
      //   notEmpty: true, // Prevents empty string
      //   isNumeric: true,
      //   len: [1, 10],
      // },
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    designationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
    },
    currentStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "Daily Log Active/InActive Status (0 for absent, 1 for present)",
      defaultValue: 0,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
    screen_capture_time: {
      type: DataTypes.INTEGER,
      defaultValue: 60, // default value is 60 seconds
    },
    broswer_capture_time: {
      type: DataTypes.INTEGER,
      defaultValue: 60, // default value is 60 seconds
    },
    app_capture_time: {
      type: DataTypes.INTEGER,
      defaultValue: 60, // default value is 60 seconds
    },
  },
  {
    timestamps: true,
    // Prevent Sequelize from auto-creating foreign keys
    underscored: false,
    hooks: {
      async beforeCreate(user, options) {
        // if (user.password) {
        //   user.password = await bcrypt.hash(user.password, 10);
        // }

        const validationMap = {
          departmentId: department,
          designationId: designation,
          roleId: role,
          teamId: team,
        };

        // Iterate through the fields to validate
        for (const [field, model] of Object.entries(validationMap)) {
          if (user[field]) {
            console.log(model);
            const recordExists = await model.findOne({
              where: { id: user[field] },
              transaction: options.transaction,
            });

            if (!recordExists) {
              throw new Error(`${field.replace(/Id$/, "")} with ID ${user[field]} does not exist.`);
            }
          }
        }
      },
      // async beforeUpdate(user, options) {
      //   // Hash the password if it's being updated
      //   if (user.password) {
      //     user.password = await bcrypt.hash(user.password, 10);
      //   }

      //   // Define a mapping of fields to their respective models
      //   const validationMap = {
      //     departmentId: department,
      //     designationId: designation,
      //     roleId: role,
      //     teamId: team,
      //   };

      //   // Iterate through the fields to validate
      //   for (const [field, model] of Object.entries(validationMap)) {
      //     if (user[field]) {
      //       console.log("------------------------");
      //       console.log(model);
      //       const recordExists = await model.findOne({
      //         where: { id: user[field] },
      //         transaction: options.transaction,
      //       });

      //       if (!recordExists) {
      //         return helper.failed(res, variables.NotFound, `${field.replace(/Id$/, "")} with ID ${user[field]} does not exist.`);
      //         // throw new Error(`${field.replace(/Id$/, "")} with ID ${user[field]} does not exist.`);
      //       }
      //     }
      //   }
      // },
      async afterUpdate(user, options) {
        let monitoredFields = ["screen_capture_time", "broswer_capture_time", "app_capture_time"];
        let fieldsChanged = options.fields.some((field) => monitoredFields.includes(field));
        if (fieldsChanged) {
          io.to(user.socket_id).emit("getUserSettings", {
            screen_capture_time: user.screen_capture_time,
            broswer_capture_time: user.broswer_capture_time,
            app_capture_time: user.app_capture_time,
          });
        }
      },
    },
  }
);

// await User.sync({alter:1});
export default User;
