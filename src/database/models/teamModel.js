import { DataTypes } from 'sequelize';
import sequelize  from '../queries/dbConnection.js';
import shift from './shiftModel.js';
import department from './departmentModel.js';

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

// Team belongs to Department
team.belongsTo(department,{ as: 'department', foreignKey: 'departmentId' });

// Team belongs to Shift
team.belongsTo(shift, { as: 'shift', foreignKey: 'shiftId' });

export default team;
