import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

export const BlockedWebsites = sequelize.define(
  "blocked_websites",
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
    },

    departmentId:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    
    website_name:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    website: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status:{
      type: DataTypes.BOOLEAN,
      defaultValue: 1,
    }
  },
  {
    timestamps: true,
  }
);

// await BlockedWebsites.sync({alter:1})