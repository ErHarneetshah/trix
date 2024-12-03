import { DataTypes } from 'sequelize';
import sequelize  from '../queries/dbConnection.js';

const userSetting = sequelize.define('users_settings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
        notEmpty: true, // Prevents empty string
      },
  },
  screenshot_time: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
        notEmpty: true, // Prevents empty string
      },
  },
  app_history_time: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
        notEmpty: true, // Prevents empty string
      },
  },
  browser_history_time: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
        notEmpty: true, // Prevents empty string
      },
  },
  status:{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt columns
});

export const createUserSetting = async (userId, dbTransaction) => {
  try {
    const userSettingData = await userSetting.create(
      {
        userId,
        screenshot_time: 300,
        app_history_time: 300,
        browser_history_time: 300,
        status: true,
      },
      { transaction: dbTransaction }
    );
    return userSettingData;
  } catch (error) {
    console.error('Error creating user setting:', error.message);
    throw error;
  }
};

export default userSetting;
