import ip from "ip";
import express from "express";
import appConfiguration from "./src/app/config/appConfig.js";
import routes from "./src/routes/routes.js";
import cors from "cors";
import corsMiddleware from "./src/app/middlewares/corsMiddleware.js";

const app = express();
const appConfig = new appConfiguration();
const dbConfig = appConfig.getConfig();
const PORT = dbConfig.port;

app.use(express.json());
app.use(cors(corsMiddleware));
// const allowedOrigins = ['http://192.168.11.93:3000'];
// app.options('*', cors(corsOptions));
app.use(routes);

app.listen(PORT, () =>
  console.log(
    `Server up and Running on http://${ip.address()}:${PORT} --------------------------`
  )
);
