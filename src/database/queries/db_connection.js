import Sequelize from 'sequelize';
import appConfiguration from '../../app/config/appConfiguration.js';

const dbConfig = new appConfiguration().db_config;

const sequelize = new Sequelize(dbConfig.dbName, dbConfig.dbUser, dbConfig.dbPassword, {
  host: dbConfig.dbHost,
  dialect: 'mysql',
});

sequelize.authenticate()
    .then(() => {
        console.log('Database connected...');
        return sequelize.sync(); // This will create the table if it doesn't exist
    })
    
    .catch(err => {
        console.error('Error: ' + err);
    });

export default sequelize;
