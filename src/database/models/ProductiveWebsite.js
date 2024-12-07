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

    website: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    // hooks: {
    //   async afterUpdate(user, options) {
    //     console.log({user,options});
        
    //   }
    // }
  }
);


await ProductiveWebsite.sync({ alter: 1 });
export default ProductiveWebsite;