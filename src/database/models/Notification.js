import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

const Notification = sequelize.define("notification_log",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING, 
      allowNull: false,
    },
    is_read:{
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    company_id:{
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false, 
  }
);

await Notification.sync({alter:1})

export { sequelize, Notification };