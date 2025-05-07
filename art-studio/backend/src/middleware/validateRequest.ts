import {
  NextFunction,
  Request,
  Response,
} from 'express';

import { AppError } from './errorHandler';

type ValidationSchema = {
  body?: any;
  query?: any;
  params?: any;
};

export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    };

    try {
      if (schema.body) {
        req.body = schema.body.validate(req.body, validationOptions).value;
      }
      if (schema.query) {
        req.query = schema.query.validate(req.query, validationOptions).value;
      }
      if (schema.params) {
        req.params = schema.params.validate(req.params, validationOptions).value;
      }
      next();
    } catch (error: any) {
      const errors = error.details.map((detail: any) => detail.message);
      next(new AppError(400, `Validation error: ${errors.join(', ')}`));
    }
  };
}; 