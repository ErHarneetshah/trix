import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

export const AppHistoryEntry = sequelize.define("app_history", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  appName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

await AppHistoryEntry.sync({ alter: 1 });
