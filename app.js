import express from 'express';
import appConfiguration from './src/app/config/appConfig.js';
import routes from './src/routes/routes.js';
import sequelize  from './src/database/queries/dbConnection.js';

//models
import blockedWebsites from './src/database/models/blockedWebsitesModel.js';
import appInfo from './src/database/models/blockedWebsitesModel.js';
import reportSettings from './src/database/models/reportSettingsModel.js';
import emailGateway from './src/database/models/emailGatewayModel.js';
import userReports from './src/database/models/workReportsModel.js';


const app = express();
const appConfig = new appConfiguration();
const dbConfig = appConfig.db_config;
const PORT = dbConfig.port;

app.use(express.json());
app.use(routes);
sequelize.sync();
app.listen(PORT, () => console.log('Server up and Running'));