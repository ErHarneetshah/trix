import { DataTypes } from 'sequelize';
import sequelize  from '../queries/dbConnection.js';

const module = sequelize.define('modules', {
  id: {
    type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  timestamps: true,
});

await module.sync({alter:1});

export default module;
