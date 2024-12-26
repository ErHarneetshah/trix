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
    type: DataTypes.TEXT('long'),
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

await exportReports.sync({alter:1});

export default exportReports;
