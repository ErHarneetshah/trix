import ip from "ip";
import express from "express";
import appConfiguration from "./src/app/config/appConfig.js";
import routes from "./src/routes/routes.js";
import cors from "cors";
import corsMiddleware from "./src/app/middlewares/corsMiddleware.js";
import dbRelations from "./src/database/queries/dbRelations.js";
import { createServer } from "http";
import setupSocketIO from "./src/app/sockets/socket.js";
import { Server } from "socket.io";
import multer from "multer";
// === file get === //
import { fileURLToPath } from "url";
import path from "path";
import sequelize from "./src/database/queries/dbConnection.js";
import './src/cron/cron-settings.js'; 

const app = express();

await sequelize.query(
  "SET GLOBAL sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';"
);
console.log("SQL mode set successfully");

const httpServer = createServer(app);
const appConfig = new appConfiguration();
const dbConfig = appConfig.getConfig();
const PORT = dbConfig.port;
export const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
setupSocketIO(io);
app.use(express.json());
app.use(cors(corsMiddleware));
app.use(routes);

//================ image get =====================//
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const updatedPath = path.join(__dirname, "assets"); // Adjusted to join the paths properly

app.get("/image/:type/:path", (req, res) => {
  res.sendFile(updatedPath + "/" + req.params.type + "/" + req.params.path);
});
//================ image get =====================//


httpServer.listen(PORT, "0.0.0.0", () => console.log(`Server up and Running on http://${ip.address()}:${PORT}`));
