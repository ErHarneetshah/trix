import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

const exportHistories = sequelize.define(
  "exportHistories",
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
    reportName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    filePath: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    reportExtension: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    periodFrom: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    periodTo: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    data: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
  },
  {
    timestamps: true,
    underscored: false,
  }
);

// await exportHistories.sync({alter:1});
export default exportHistories;
