import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/summary', protect, dashboardController.getDashboardSummary);

export default router;
