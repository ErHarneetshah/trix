import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

const AppHistoryEntry = sequelize.define(
  "app_history",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    company_id: {
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
  },
  {
    // Prevent Sequelize from auto-creating foreign keys
    underscored: false,
  }
);

await AppHistoryEntry.sync({ alter: 1 });
export default AppHistoryEntry;
