import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

export const UserHistory = sequelize.define("user_history", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  website_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  visitTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

await UserHistory.sync({ alter: 1 });

UserHistory.beforeCreate(async (data) => {
  try {
    let parsed = new URL(data.url);
    data.website_name = parsed.hostname;
  } catch (error) {
    console.error("Error setting website_name:", error.message);
  }
});
