import { DataTypes } from 'sequelize';
import sequelize  from '../queries/dbConnection.js';

const team = sequelize.define('teams', {
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
  underscored: false,
});

// await team.sync({alter:1});

export default team;
