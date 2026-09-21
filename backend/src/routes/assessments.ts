import { Router } from 'express';
import * as assessmentController from '../controllers/assessment.controller';
import { protect } from '../middleware/auth';

const router = Router();

// Apply auth protection globally to all assessment endpoints
router.use(protect);

router.get('/available', assessmentController.getAvailableAssessment);
router.post('/start', assessmentController.startAssessment);
router.get('/attempts/:attemptId', assessmentController.getAttempt);
router.patch('/attempts/:attemptId/progress', assessmentController.saveProgress);
router.post('/attempts/:attemptId/submit', assessmentController.submitAssessment);
router.get('/history', assessmentController.getHistory);
router.get('/results/:resultId', assessmentController.getResult);

export default router;
