import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

const company = sequelize.define(
  "companies",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // email: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    // },
    // address: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    // },
    // mobile: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    employeeNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
      comment: "0 for Inactive, 1 for active"
    },
  },
  {
    timestamps: true,
    underscored: false, // prevents from generating foreign keys on it's own    
  }
);

// await company.sync({alter:1});
export default company;
