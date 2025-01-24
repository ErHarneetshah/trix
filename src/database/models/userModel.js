import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";
import { io } from "../../../app.js";
import company from "./company.js";
import { Device } from "./device.js";

const User = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    empId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    socket_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: true,
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
      defaultValue: 60,
    },
    broswer_capture_time: {
      type: DataTypes.INTEGER,
      defaultValue: 60,
    },
    app_capture_time: {
      type: DataTypes.INTEGER,
      defaultValue: 60,
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
    next_reports_schedule_date: {
      type: DataTypes.DATE,
    },
    otp: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },  
    otp_expire_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    image_storage_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
      // unique: true,
    },
  },
  {
    timestamps: true,
    underscored: false,
    hooks: {
      async afterUpdate(user, options) {
        let monitoredFieldss = ["screen_capture_time", "broswer_capture_time", "app_capture_time", "screen_capture", "broswer_capture", "app_capture"];
        let fieldsChangeds = options.fields.some((field) => monitoredFieldss.includes(field));
        if (fieldsChangeds) {
          io.to(user.socket_id).emit("getUserSettings", {
            screen_capture_time: user.screen_capture_time,
            broswer_capture_time: user.broswer_capture_time,
            app_capture_time: user.app_capture_time,
            screen_capture: user.screen_capture,
            broswer_capture: user.broswer_capture,
            app_capture: user.app_capture,
          });
        }

        let monitoredFields = ["currentStatus"];
        let fieldsChanged = options.fields.some((field) => monitoredFields.includes(field));


        if (fieldsChanged) {
          const whereCondition = { companyId: user.company_id };
          const page = 1;
          const limit = 10;
          const offset = (page - 1) * limit;

          const totalCount = await Device.count({
            where: whereCondition,
            include: [
              {
                model: User,
                where: { currentStatus: 1 },
              },
            ],
          });

          const systemDetail = await Device.findAll({
            where: whereCondition,
            include: [
              {
                model: User,
                where: {
                  currentStatus: 1,
                },
                attributes: ["id", "fullname"],
                required: true,
              },
            ],
            order: [["id", "DESC"]],
            limit,
            offset,
          });

          const responseData = {
            totalCount,
            page,
            limit,
            data: systemDetail,
          };

          io.to(`Admin_${user.company_id}`).emit("getSystemDetail", responseData);
        }
      },
    },
  }
);

await User.sync({alter:1});
export default User;
