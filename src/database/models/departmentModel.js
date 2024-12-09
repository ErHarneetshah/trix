import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

const department = sequelize.define(
  "departments",
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
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parentDeptId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reportingManagerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isRootId: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue : 0,
      comment: "0 for not root, 1 for root"
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt columns
  }
);

await department.sync({alter:1});

export default department;
