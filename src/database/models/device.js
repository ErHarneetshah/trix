import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";
import { io } from "../../../app.js";

export const Device = sequelize.define("device", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  companyId:{
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  device_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  device_id: {
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

// await Device.sync({ alter: 1 });


