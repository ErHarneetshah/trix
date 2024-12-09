import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

const teamMemberDailyLog = sequelize.define(
  "team_member_daily_logs",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    empId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    empName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    productiveTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shiftTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    arrivedTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    leftAt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

await teamMemberDailyLog.sync({alter:1});

export default teamMemberDailyLog;
