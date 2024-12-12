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
import path from 'path'



const app = express();
const httpServer = createServer(app);
// const io = new Server(httpServer);
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const updatedPath = path.join(__dirname, 'assets'); // Adjusted to join the paths properly

//================ image get =====================//

app.get("/image/:type/:path", (req, res) => {
  res.sendFile(
       updatedPath + "/" + req.params.type + '/' + req.params.path
  );
  });

// Start the Express server
httpServer.listen(PORT, "0.0.0.0", () =>
  console.log(`Server up and Running on http://${ip.address()}:${PORT}`)
);
