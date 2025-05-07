import rateLimit from 'express-rate-limit';

import { config } from '../config';
import { AppError } from './errorHandler';

export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  handler: (req, res) => {
    throw new AppError(
      429,
      'Too many requests, please try again later.'
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
}); 