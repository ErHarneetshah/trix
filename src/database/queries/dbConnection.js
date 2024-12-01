import Sequelize from 'sequelize';
import appConfig from '../../app/config/appConfig.js';

const dbConfig = new appConfig().getConfig();


const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 20,
    min: 2,
    acquire: 30000,
    idle: 60000
  }
});

try {
    await sequelize.authenticate();
     console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

export default sequelize;
