import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth';
import { env } from '../config/env';
import * as aiController from '../controllers/ai.controller';

const router = Router();

// Configure the AI endpoints rate limiter dynamically from env settings
const aiLimiter = rateLimit({
  windowMs: env.AI_RATE_LIMIT_WINDOW_MS,
  max: env.AI_RATE_LIMIT_MAX,
  message: {
    success: false,
    message: 'Too many AI recommendations requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Protect all AI routes globally
router.use(protect);

router.get('/', aiController.getAllRecommendations);
router.get('/:type', aiController.getRecommendationByType);

// Apply rate limiter strictly to generation/regeneration calls
router.post('/generate', aiLimiter, aiController.generateAIRecommendation);
router.post('/regenerate', aiLimiter, aiController.regenerateAIRecommendation);

export default router;
