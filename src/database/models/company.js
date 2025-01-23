import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";
import { io } from "../../../app.js";
import User from "./userModel.js";

const company = sequelize.define(
  "companies",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
     },
    companyEmpPrefix: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    employeeCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      Comment: "Current Employee Count in company",
    },
    currentPlanId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    planEmployeeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      Comment: "Employee Count allowed for the company based on plan",
      defaultValue: 10,
    },
    planStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    planEndDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: () => {
        const today = new Date();
        today.setDate(today.getDate() + 7);
        return today.toISOString().split('T')[0];
      },
    },
    bucketStorePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
      comment: "0 for Inactive, 1 for active",
    },
  },
  {
    timestamps: true,
    hooks: {
      async afterUpdate(user, options) {
        let monitoredFields = [
          "screen_capture",
          "broswer_capture",
          "app_capture",
        ];
        let fieldsChanged = options.fields.some((field) =>
          monitoredFields.includes(field)
        );

        if (fieldsChanged) {
          let userData = await User.findAll({ where: { company_id: user.id } });
          userData.forEach((x) => {
            if (x.socket_id) {               
              io.to(x.socket_id).emit("getUserSettings", {
                screen_capture_time: x.screen_capture_time,
                broswer_capture_time: x.broswer_capture_time,
                app_capture_time: x.app_capture_time,
                screen_capture: user.screen_capture,
                broswer_capture: user.broswer_capture,
                app_capture: user.app_capture
              });
            }
          });
        }
      },
    },
  }
);

// await company.sync({ alter: 1 });
export default company;
