import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

export const System = sequelize.define("system", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  fan_speed: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  rom: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  ram: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  memory:{
    type: DataTypes.INTEGER,
    allowNull: false
  }
},{
  // Prevent Sequelize from auto-creating foreign keys
  underscored: false,
});

await System.sync({alter:1});

await System.sync({ alter: 1 });
