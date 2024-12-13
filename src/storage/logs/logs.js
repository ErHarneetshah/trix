import winston from "winston";
import path from "path";
import moment from "moment-timezone";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const logsDir = dirname(__filename);

class logs {
  infoLogger = () => {
    winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp({
          format: moment().format("YYYY-MM-DD HH:mm:ss"),
        }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({
          filename: path.join(logsDir, "app.log"),
          level: "info",
        }),
      ],
    });
  };

  errorLogger = () => {
    winston.createLogger({
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp({
          format: moment().format("YYYY-MM-DD HH:mm:ss"),
        }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({
          filename: path.join(logsDir, "error.log"),
          level: "error",
        }),
      ],
    });
  };
}

// Export the logs class instance
export default logs;
