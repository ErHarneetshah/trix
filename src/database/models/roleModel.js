import { DataTypes } from 'sequelize';
import sequelize from '../queries/dbConnection.js';

const role = sequelize.define('roles', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: 1,
  },
}, {
  timestamps: true,
  underscored: false,
});


export default role;
