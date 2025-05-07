import Joi from 'joi';

export const artValidation = {
  generateArt: {
    body: Joi.object({
      prompt: Joi.string().required().min(1).max(1000),
      style: Joi.string().valid('studio-ghibli', 'anime', 'realistic', 'cartoon').default('studio-ghibli'),
      size: Joi.string().valid('1024x1024', '1024x1792', '1792x1024').default('1024x1024'),
    }),
  },

  editArt: {
    body: Joi.object({
      prompt: Joi.string().required().min(1).max(1000),
      style: Joi.string().valid('studio-ghibli', 'anime', 'realistic', 'cartoon').default('studio-ghibli'),
    }),
  },

  upscaleArt: {
    body: Joi.object({
      scale: Joi.number().integer().min(2).max(4).default(2),
    }),
  },

  getHistory: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
    }),
  },
}; 