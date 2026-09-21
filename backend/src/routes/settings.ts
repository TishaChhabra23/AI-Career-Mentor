import { Router } from 'express';
import { protect } from '../middleware/auth';
import * as settingsController from '../controllers/settings.controller';

const router = Router();

// All settings routes require authentication
router.use(protect);

// AI credential management
router.get('/ai', settingsController.getAISettings);
router.post('/ai/gemini', settingsController.saveGeminiKey);
router.delete('/ai/gemini', settingsController.removeGeminiKey);

export default router;
