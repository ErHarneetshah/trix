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

    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isUserAdmin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiry_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    timestamps: true,
    // Prevent Sequelize from auto-creating foreign keys
    underscored: false,
  }
);

export const createAccessToken = async (userId, isUserAdmin, company_id, token, expireTime, dbTransaction) => {
  try {
    
    const accessTokenData = await accessToken.create(
      {
        userId: userId,
        isUserAdmin: isUserAdmin,
        company_id: company_id,
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

// await accessToken.sync({alter:1})

export default accessToken;
