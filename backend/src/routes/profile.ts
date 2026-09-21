import { Router } from 'express';
import * as profileController from '../controllers/profile.controller';
import { protect } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { profileSchema } from '../validators/profile.validator';

const router = Router();

// Secure all endpoints
router.use(protect);

router.get('/', profileController.getProfile);
router.post('/', validateRequest({ body: profileSchema }), profileController.saveProfile);
router.put('/', validateRequest({ body: profileSchema }), profileController.saveProfile);
router.delete('/', profileController.deleteProfile);

export default router;
