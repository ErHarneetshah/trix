import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

export const ImageUpload = sequelize.define(
  "image_upload",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

await ImageUpload.sync({ alter: 1 });
