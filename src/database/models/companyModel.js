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
    // email: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    // },
    // address: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    // },
    // mobile: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    employeeNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
      comment: "0 for Inactive, 1 for active",
    },
    screen_capture: {
      type: DataTypes.BOOLEAN,
      defaultValue: 1,
    },
    broswer_capture: {
      type: DataTypes.BOOLEAN,
      defaultValue: 1,
    },
    app_capture: {
      type: DataTypes.BOOLEAN,
      defaultValue: 1,
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

await company.sync({ alter: 1 });
export default company;
