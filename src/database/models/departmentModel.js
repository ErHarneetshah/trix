import { DataTypes } from 'sequelize';
import sequelize  from '../queries/dbConnection.js';

const department = sequelize.define('departments', {
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
  reportingManagerId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status:{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt columns
});

export default department;
