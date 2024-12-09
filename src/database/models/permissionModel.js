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
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
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
    // Prevent Sequelize from auto-creating foreign keys
    underscored: false,
  }
);

await permission.sync({alter:1});

export default permission;
