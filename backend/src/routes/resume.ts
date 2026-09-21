import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  createResume,
  listResumes,
  getResume,
  updateResume,
  deleteResume,
  exportResume
} from '../controllers/resume.controller';

const router = Router();

// Secure all endpoints
router.use(protect);

router.post('/', createResume);
router.get('/', listResumes);
router.get('/:resumeId', getResume);
router.patch('/:resumeId', updateResume);
router.delete('/:resumeId', deleteResume);
router.post('/:resumeId/export', exportResume);

export default router;
