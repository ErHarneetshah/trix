import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

export const System = sequelize.define("system", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  company_id:{
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  rom: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  ram: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  memory:{
    type: DataTypes.STRING,
    allowNull: false
  }
},{
  underscored: false,
});

await System.sync({ alter: 1 });

System.afterCreate(()=>{
  
})