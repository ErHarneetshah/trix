const sequelize = require('./path_to_sequelize_instance');
import sequelize from '../queries/db_connection.js';
import User from '../models/userModel.js'

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
})();
