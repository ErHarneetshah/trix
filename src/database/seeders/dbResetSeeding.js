import sequelize from '../queries/dbConnection.js';

// Sync function
async function syncModels() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        // Synchronize all models
        await sequelize.sync({ alter: true }); // Use { force: true } for dropping and recreating
        console.log('All models were dropped and created again successfully');
    } catch (error) {
        console.error('Error syncing models:', error);
    } finally {
        await sequelize.close();
    }
}

export default syncModels;
