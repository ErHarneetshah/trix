import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";
import role from "./roleModel.js";

const rolePermission = sequelize.define(
  "role_permissions",
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
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    modules: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    // Prevent Sequelize from auto-creating foreign keys
    underscored: false,
  }
);

// await rolePermission.sync({alter:1});

export default rolePermission;
