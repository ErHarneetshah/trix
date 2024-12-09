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
  }
);

await rolePermission.sync({alter:1});

export default rolePermission;
