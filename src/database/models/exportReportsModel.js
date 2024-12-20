import { DataTypes } from 'sequelize';
import sequelize  from '../queries/dbConnection.js';

const exportReports = sequelize.define('exportReports', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  status:{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  timestamps: true,
  underscored: false,
});

export default exportReports;
