import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

export const bucketImageUpload = sequelize.define(
  "bucket_image_uploads",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    company_id:{
      type: DataTypes.INTEGER,
      allowNull:false
    },
    image_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image_upload_path: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    bucket_owner: {
      type: DataTypes.TINYINT,
      allowNull: false,
      default: 1,
      comment: "1 => Emonitrix, 2 => User's Company"
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    underscored: false,
  }
);

// await bucketImageUpload.sync({ alter: 1 });