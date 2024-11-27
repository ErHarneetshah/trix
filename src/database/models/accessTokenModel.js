import { DataTypes } from "sequelize";
import sequelize from "../queries/db_connection.js";

const accessToken = sequelize.define(
  "access_tokens",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    isUserAdmin: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    features: {
      type: DataTypes.JSON,
      unique: true,
      allowNull: true,
    },
    expiry_time: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    timestamps: true,
  }
);

export default accessToken;
