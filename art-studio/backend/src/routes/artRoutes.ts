import { Router } from 'express';

import { artController } from '../controllers/artController';
import { upload } from '../middleware/upload';
import { validateRequest } from '../middleware/validateRequest';
import { artValidation } from '../validations/artValidation';

const router = Router();

// Generate new art
router.post(
  '/generate',
  validateRequest(artValidation.generateArt),
  artController.generateArt
);

// Edit existing art
router.post(
  '/edit',
  upload.single('image'),
  validateRequest(artValidation.editArt),
  artController.editArt
);

// Upscale art
router.post(
  '/upscale',
  upload.single('image'),
  validateRequest(artValidation.upscaleArt),
  artController.upscaleArt
);

// Get art history
router.get(
  '/history',
  validateRequest(artValidation.getHistory),
  artController.getHistory
);

export const artRoutes = router; 