import winston from "winston";
import { getAppConfig } from "./app-config";

const config = getAppConfig();

const logger = winston.createLogger({
  level: config.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export { logger };
