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
import { fileURLToPath } from "url";
import path from "path";
import sequelize from "./src/database/queries/dbConnection.js";
import paymentController from "./src/app/controllers/admin/paymentController.js";
import helper from "./src/utils/services/helper.js";
import variables from "./src/app/config/variableConfig.js";
import "./src/utils/services/scheduleEmailForPlanPayment.js";


const app = express();
const httpServer = createServer(app);
const appConfig = new appConfiguration();
const dbConfig = appConfig.getConfig();
const PORT = dbConfig.port;
const paymentInstance = new paymentController();
export const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const updatedPath = path.join(__dirname, "assets");

// await sequelize.query("SET GLOBAL sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';");

process.env.TZ = "Asia/Kolkata";
console.log(`Server timezone set to: ${process.env.TZ}`);
console.log(`Current server time: ${new Date().toString()}`);

setupSocketIO(io);
// Increase the limit for JSON payloads
app.use(express.json({ limit: "50mb" }));

// If you're using URL-encoded data
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors(corsMiddleware));
app.use(routes);
app.use(express.static("assets"));
app.use(express.static("storage/files"));
app.use(express.static("storage"));

app.get("/get_timezone", (req, res, next) => {
  res.send(`Server timezone set to: ${process.env.TZ} and Current server time: ${new Date().toString()}`);
});

app.get("/export/:path", (req, res) => {
  console.log(__dirname + "/storage/files/" + req.params.path);
  res.sendFile(__dirname + "/storage/files/" + req.params.path);
});

app.get("/image/:type/:path", (req, res) => {
  res.sendFile(updatedPath + "/" + req.params.type + "/" + req.params.path);
});

app.post("/webhook", async (req, res) => {
  console.log("Webhook called");
  const ifVerified = await paymentInstance.confirmPayment(req, res);
  console.log("Tested");
  if(!ifVerified.status) return helper.failed(res, variables.ValidationError, ifVerified.message);
  return helper.success(res, variables.Success, ifVerified.message)
});

httpServer.listen(PORT, "0.0.0.0", () => console.log(`Server up and Running on http://${ip.address()}:${PORT}`));
