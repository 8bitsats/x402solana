import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  openaiApiKey: process.env.OPENAI_API_KEY,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  imageProcessing: {
    maxSize: parseInt(process.env.MAX_IMAGE_SIZE || '10485760', 10),
    allowedTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
    outputQuality: parseInt(process.env.OUTPUT_IMAGE_QUALITY || '90', 10)
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || path.join(__dirname, '../../logs/app.log')
  }
} as const;

// Validate required configuration
if (!config.openaiApiKey) {
  throw new Error('OPENAI_API_KEY is required');
} 