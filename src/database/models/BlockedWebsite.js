import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

export const blockedWebsites = sequelize.define(
  "blocked_websites",
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
    Sites: {
      type: DataTypes.JSON,
      allowNull: false,
    }
  },
  {
    timestamps: true
  }
);


await blockedWebsites.sync({alter:1}); 


blockedWebsites.afterUpdate(()=>{
  
})