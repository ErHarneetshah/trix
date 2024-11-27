import { DataTypes } from 'sequelize';
import sequelize  from '../queries/db_connection.js';

const team = sequelize.define('teams', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
        notEmpty: true, // Prevents empty string
      },
  },
  departmentId:{
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
        notEmpty: true, // Prevents empty string
      },
  },
  shiftId:{
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

export default team;
