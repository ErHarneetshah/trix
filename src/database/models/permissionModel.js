import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

const permission = sequelize.define(
  "permissions",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    modules: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    allowed_permissions: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt columns
  }
);


export default permission;
