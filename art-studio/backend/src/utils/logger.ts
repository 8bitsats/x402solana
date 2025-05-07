import path from 'path';
import winston from 'winston';

import { config } from '../config';

// Create logs directory if it doesn't exist
const logDir = path.dirname(config.logging.filePath);
if (!require('fs').existsSync(logDir)) {
  require('fs').mkdirSync(logDir, { recursive: true });
}

export const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: config.logging.filePath,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
}); 