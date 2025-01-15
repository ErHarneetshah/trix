import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

const paymentLog = sequelize.define(
  "payment_logs",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    company_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    companyEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    planName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amountPaid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    allowedEmployeeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      Comment: "0 For Pending, 1 For Activ, 2 For Exhausted, 3 for Plan Changed",
    }
  },
  {
    timestamps: true,
    underscored: false,
  }
);

await paymentLog.sync({alter:1});
export default paymentLog;
