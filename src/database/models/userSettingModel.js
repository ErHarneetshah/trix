import { DataTypes } from 'sequelize';
import sequelize  from '../queries/db_connection.js';

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

export default userSetting;
