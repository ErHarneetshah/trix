import { DataTypes } from 'sequelize';
import sequelize  from '../queries/dbConnection.js';
import User from './userModel.js';

const reportingManager = sequelize.define('reporting_managers', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  userId:{
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
        notEmpty: true, // Prevents empty string
      },
  },
  teamId:{
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
  hooks: {
    async beforeUpdate(user, options) {
      const validationMap = {
        userId: User,
        teamId: team
      };

      // Iterate through the fields to validate
      for (const [field, model] of Object.entries(validationMap)) {
        if (user[field]) {
          const recordExists = await model.findOne({
            where: { id: user[field] },
            transaction: options.transaction,
          });

          if (!recordExists) {
            throw new Error(
              `${field.replace(/Id$/, "")} with ID ${
                user[field]
              } does not exist.`
            );
          }
        }
      }
    },
  }
});

export default reportingManager;
