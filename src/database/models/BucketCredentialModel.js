import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

export const BucketCredentialsModel = sequelize.define(
  "bucket_credentials",
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
      unique: true,
    },
    host: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    access_key: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },

    secret_key: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    
    bucket_name:{
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '1 => Activated, 0=>Deactivated'
    },
  },
  {
    timestamps: true,
  }
);


await BucketCredentialsModel.sync({alter:1}); 

