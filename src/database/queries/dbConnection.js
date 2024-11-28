import Sequelize from 'sequelize';
import appConfiguration from '../../app/config/appConfig.js';


const dbConfig = new appConfiguration().db_config;

const sequelize = new Sequelize(dbConfig.dbName, dbConfig.dbUser, dbConfig.dbPassword, {
  host: dbConfig.dbHost,
  dialect: 'mysql',
  logging: false,
});

sequelize.authenticate()
    .then(() => {
        console.log('Database connected...');
    })
    
    .catch(err => {
        console.error('Error: ' + err);
    });

export default sequelize;
