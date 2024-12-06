import ip from 'ip';
import express from 'express';
import appConfiguration from './src/app/config/appConfig.js';
import routes from './src/routes/routes.js';
import cors from 'cors';
import corsMiddleware from './src/app/middlewares/corsMiddleware.js';
import ImportModels from './src/app/config/ImportDependencies/ImportModels.js';
import sequelize from './src/database/queries/dbConnection.js';

const app = express();
const appConfig = new appConfiguration();
const dbConfig = appConfig.getConfig();
const PORT = dbConfig.port;

app.use(express.json());
app.use(cors(corsMiddleware));
app.use(routes);

async function initializeApp() {
    try {
        const models = await ImportModels(); 

        await sequelize.sync({ alter: true }); 
        console.log('All models synced successfully.');
        
        app.listen(PORT, () =>
            console.log(`Server up and Running on http://${ip.address()}:${PORT} --------------------------`)
        );
    } catch (error) {
        console.error('Error during application initialization:', error);
    }
}

initializeApp();
