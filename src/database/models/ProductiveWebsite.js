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
    },

    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    website_name:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    website: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
   
  }
);


await ProductiveWebsite.sync({ alter: 1 });
export default ProductiveWebsite;