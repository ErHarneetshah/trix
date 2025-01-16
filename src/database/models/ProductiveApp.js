import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";
import appConfig from "../../app/config/appConfig.js";

const imageUrlConfig = new appConfig().getImageUrl();
export const ProductiveApp = sequelize.define("productive_app",
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

    app_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    app_logo: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
          return (this.getDataValue('app_logo') ? imageUrlConfig  + 'image/logos/' + this.getDataValue('app_logo') : null);
      }
  },

  },

  {
    timestamps: true,
    // Prevent Sequelize from auto-creating foreign keys
    underscored: false,
  }
);


// await ProductiveApp.sync({ alter: 1 });
