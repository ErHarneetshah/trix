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
// import './src/cron/cron-settings.js'; 
// import "./src/utils/services/deleteExpireTokensScheduler.js"; // scheduler closed for now

const app = express();

await sequelize.query(
  "SET GLOBAL sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';"
);
//console.log("SQL mode set successfully");


process.env.TZ = "Asia/Kolkata"; console.log(`Server timezone set to: ${process.env.TZ}`);
console.log(`Current server time: ${new Date().toString()}`);

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
app.get('/get_timezone',(req,res,next)=>{
  res.send(`Server timezone set to: ${process.env.TZ} and Current server time: ${new Date().toString()}`)
});

app.get("/export/:path", (req, res) => {
  console.log(__dirname + "/storage/files/" +  req.params.path);
  res.sendFile(__dirname + "/storage/files/" +  req.params.path);
});

app.post('/payment-webhook', (req, res) => {
  console.log('Webhook received:', req.body);

  if (req.body.event === 'order.created') {
    console.log(`Order created: ${req.body}`);
  }

  res.status(200).send('Webhook received successfully');
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static('assets'));
app.use(express.static('storage/files'));
app.use(express.static('storage'));

//================ image get =====================//
const updatedPath = path.join(__dirname, "assets"); // Adjusted to join the paths properly

app.get("/image/:type/:path", (req, res) => {
  res.sendFile(updatedPath + "/" + req.params.type + "/" + req.params.path);
});
//================ image get =====================//


httpServer.listen(PORT, "0.0.0.0", () => console.log(`Server up and Running on http://${ip.address()}:${PORT}`));
