import {
  NextFunction,
  Request,
  Response,
} from 'express';

import { AppError } from '../middleware/errorHandler';
import { artService } from '../services/artService';

export const artController = {
  async generateArt(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt, style, size } = req.body;
      const result = await artService.generateArt(prompt, style, size);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async editArt(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError(400, 'No image file provided');
      }

      const { prompt, style } = req.body;
      const result = await artService.editArt(req.file, prompt, style);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async upscaleArt(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError(400, 'No image file provided');
      }

      const { scale } = req.body;
      const result = await artService.upscaleArt(req.file, parseInt(scale, 10));
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await artService.getHistory(
        parseInt(page as string, 10),
        parseInt(limit as string, 10)
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}; 