import multer from 'multer';

import { config } from '../config';
import { AppError } from './errorHandler';

const storage = multer.memoryStorage();

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (config.imageProcessing.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.imageProcessing.maxSize,
  },
}); 