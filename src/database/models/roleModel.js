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
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt columns
  // Prevent Sequelize from auto-creating foreign keys
  underscored: false,
});

await role.sync({alter:1});

export default role;
