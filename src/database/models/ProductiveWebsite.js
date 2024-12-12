import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

const ProductiveWebsite = sequelize.define("productive_website",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 101,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    website_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Facebook",
    },
    website: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    // Prevent Sequelize from auto-creating foreign keys
    // underscored: false,
  }
);

await ProductiveWebsite.sync({ alter: 1 });
export default ProductiveWebsite;