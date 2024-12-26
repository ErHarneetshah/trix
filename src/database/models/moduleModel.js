import { DataTypes } from 'sequelize';
import sequelize  from '../queries/dbConnection.js';

const app_modules = sequelize.define('modules', {
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
  aliasName: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  timestamps: true,
  underscored: false,
});

// await module.sync({alter:1});
export default app_modules;
