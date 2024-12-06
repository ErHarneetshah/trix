import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

const accessToken = sequelize.define(
  "access_tokens",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    isUserAdmin: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    features: {
      type: DataTypes.JSON,
      // unique: true,
      allowNull: true,
    },
    expiry_time: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const createAccessToken = async (userId, isUserAdmin, token, expireTime, dbTransaction) => {
  try {
    const accessTokenData = await accessToken.create(
      {
        userId: userId,
        isUserAdmin: isUserAdmin,
        token,
        expiry_time: expireTime,
      },
      { transaction: dbTransaction }
    );
    return accessTokenData;
  } catch (error) {
    console.error('Error creating access token:', error.message);
    throw error;
  }
};

export default accessToken;
