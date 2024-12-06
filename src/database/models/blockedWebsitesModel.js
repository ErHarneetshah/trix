import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

const blockedWebsites = sequelize.define(
  "blockedWebsites",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    sites: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true, 
      },
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '1 => Blocked Websites,0=>Unblock Websites'
    },
  },
  {
    timestamps: true
  }
);


export default blockedWebsites;
