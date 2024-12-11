import sequelize from './dbConnection.js';
// import exportModels from '../models/Export_Models.js'

(async () => {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Synchronize models
    for (const model of exportModels) {
      await model.sync(); // Sync each model
      console.log(`Table for model ${model.name} created or already exists.`);
    }

    console.log('All models synchronized successfully.');
  } catch (error) {
    console.error('Error during model synchronization:', error);
  }
})();