import OpenAI from 'openai';
import sharp from 'sharp';

import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

interface GenerateArtParams {
  prompt: string;
  style?: string;
  size?: string;
}

interface EditArtParams {
  image: Express.Multer.File;
  prompt: string;
  style?: string;
}

interface UpscaleArtParams {
  image: Express.Multer.File;
  scale: number;
}

export const artService = {
  async generateArt({ prompt, style = 'studio-ghibli', size = '1024x1024' }: GenerateArtParams) {
    try {
      logger.info('Generating art with prompt:', { prompt, style, size });

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `${prompt} in ${style} style`,
        n: 1,
        size: size as "1024x1024" | "1024x1792" | "1792x1024",
        quality: "standard",
        style: "vivid",
      });

      const imageUrl = response.data[0].url;
      if (!imageUrl) {
        throw new AppError(500, 'Failed to generate image');
      }

      return {
        success: true,
        imageUrl,
        prompt,
        style,
        size,
      };
    } catch (error) {
      logger.error('Error generating art:', error);
      throw new AppError(500, 'Failed to generate art');
    }
  },

  async editArt({ image, prompt, style = 'studio-ghibli' }: EditArtParams) {
    try {
      logger.info('Editing art with prompt:', { prompt, style });

      // Process the image to ensure it meets OpenAI's requirements
      const processedImage = await sharp(image.buffer)
        .resize(1024, 1024, { fit: 'inside' })
        .toBuffer();

      const response = await openai.images.edit({
        model: "dall-e-2",
        image: processedImage,
        prompt: `${prompt} in ${style} style`,
        n: 1,
        size: "1024x1024",
      });

      const imageUrl = response.data[0].url;
      if (!imageUrl) {
        throw new AppError(500, 'Failed to edit image');
      }

      return {
        success: true,
        imageUrl,
        prompt,
        style,
      };
    } catch (error) {
      logger.error('Error editing art:', error);
      throw new AppError(500, 'Failed to edit art');
    }
  },

  async upscaleArt({ image, scale = 2 }: UpscaleArtParams) {
    try {
      logger.info('Upscaling art:', { scale });

      const result = await sharp(image.buffer)
        .resize(image.width * scale, image.height * scale, {
          fit: 'fill',
          kernel: 'lanczos3',
        })
        .toBuffer();

      return {
        success: true,
        imageBuffer: result,
        originalSize: {
          width: image.width,
          height: image.height,
        },
        newSize: {
          width: image.width * scale,
          height: image.height * scale,
        },
      };
    } catch (error) {
      logger.error('Error upscaling art:', error);
      throw new AppError(500, 'Failed to upscale art');
    }
  },

  async getHistory(page: number, limit: number) {
    // In a real application, this would fetch from a database
    // For now, return mock data
    return {
      success: true,
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
      },
    };
  },
}; 