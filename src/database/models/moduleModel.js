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
    validate: {
        notEmpty: true,
      },
  }
}, {
  timestamps: true,
});

export default module;
