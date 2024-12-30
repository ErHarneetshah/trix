import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

export const UserHistory = sequelize.define(
  "user_history",
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
    website_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    url: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    visitTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    underscored: false,
  }
);

// await UserHistory.sync({ alter: 1 });

UserHistory.afterCreate(async (data) => {
  if (!/^https?:\/\//i.test(data.url)) {
    await data.destroy(); 
  } else {
    try {
      const parsed = new URL(data.url);
      data.website_name = parsed.hostname; 
      await data.save(); 
    } catch {
      await data.destroy(); 
    }
  }
});
