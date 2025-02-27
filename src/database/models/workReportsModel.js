import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../queries/dbConnection.js";

const workReports = sequelize.define(
  "work_reports",
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        notEmpty: true,
      },
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: "0=>Pending,1 => Approved,2=>Disapproved",
    },
    remarks: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true, // Accepts null values
      defaultValue: Sequelize.NOW, // Sets the current date and time by default
    },
  },
  {
    timestamps: true,
    // Prevent Sequelize from auto-creating foreign keys
    underscored: false,
  }
);

// await workReports.sync({ alter: 1 });

export default workReports;
