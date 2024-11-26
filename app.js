import express from 'express';
import dotenv from "dotenv";
import routes from './src/routes/routes.js';

dotenv.config();
const app = express();
const PORT = process.env.APP_PORT;

app.use(express.json());
app.use(routes);

app.listen(PORT, () => console.log('Server up and Running'));