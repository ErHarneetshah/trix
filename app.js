import ip from 'ip'
import express from 'express';
import appConfiguration from './src/app/config/appConfig.js';
import routes from './src/routes/routes.js';

const app = express();
const appConfig = new appConfiguration();
const dbConfig = appConfig.db_config;
const PORT = dbConfig.port;

app.use(express.json());
app.use(routes);

app.listen(PORT, "0.0.0.0",() => console.log(`Server up and Running on http://${ip.address()}:${PORT}`));