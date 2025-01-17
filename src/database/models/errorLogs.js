import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

const errorLog = sequelize.define(
  "errorLogs",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    error_file: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    error_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    // Prevent Sequelize from auto-creating foreign keys
    underscored: false,
  }
);

await errorLog.sync({alter:1});
export default errorLog;
