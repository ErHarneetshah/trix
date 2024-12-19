import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";
import User from "./userModel.js";
import { ProductiveApp } from "./ProductiveApp.js";

const AppHistoryEntry = sequelize.define(
  "app_history",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    appName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_productive: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    underscored: false,
  }
);

// await AppHistoryEntry.sync({ alter: 1 });
export default AppHistoryEntry;
AppHistoryEntry.afterCreate(async (user, options) => {
  let userData = await User.findOne({ where: { id: user.userId } });
  let productiveData = await ProductiveApp.findAll({
    where: {
      company_id: userData.company_id,
      department_id: userData.departmentId,
    },
  });
  for (let app of productiveData) {
    if (app.app_name.toLowerCase() == user.appName.toLowerCase()) {
      user.is_productive = 1; 
      await user.save(); 
    }
  }
});
