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
    Department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    Sites: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, 
      },
    },
    Status: {
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
