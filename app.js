import express from 'express';
import appConfiguration from './src/app/config/appConfiguration.js';
import routes from './src/routes/routes.js';
import sequelize  from './src/database/queries/db_connection.js';

const app = express();
const appConfig = new appConfiguration();
const dbConfig = appConfig.db_config;
const PORT = dbConfig.port;

app.use(express.json());
app.use(routes);

app.listen(PORT, () => console.log('Server up and Running'));