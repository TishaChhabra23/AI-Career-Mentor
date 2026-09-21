import { Router } from 'express';
import * as educationController from '../controllers/education.controller';
import { protect } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { educationSchema } from '../validators/education.validator';

const router = Router();

// Secure all endpoints
router.use(protect);

router.get('/', educationController.getEducation);
router.post('/', validateRequest({ body: educationSchema }), educationController.saveEducation);
router.put('/', validateRequest({ body: educationSchema }), educationController.saveEducation);
router.delete('/', educationController.deleteEducation);

export default router;
