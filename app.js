import ip from "ip";
import express from "express";
import appConfiguration from "./src/app/config/appConfig.js";
import routes from "./src/routes/routes.js";
import cors from "cors";
import corsMiddleware from "./src/app/middlewares/corsMiddleware.js";
import { createServer } from "http";
import setupSocketIO from "./src/app/sockets/socket.js";
import { Server } from "socket.io";

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

// Start the Express server
httpServer.listen(PORT, "0.0.0.0", () =>
  console.log(`Server up and Running on http://${ip.address()}:${PORT}`)
);