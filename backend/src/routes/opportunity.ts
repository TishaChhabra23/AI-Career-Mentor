import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  listJobs,
  listInternships,
  getJobDetails,
  getInternshipDetails,
  saveOpportunity,
  unsaveOpportunity,
  updateSavedDetails,
  listSavedOpportunities
} from '../controllers/opportunity.controller';

const router = Router();

// Secure all endpoints
router.use(protect);

router.get('/jobs', listJobs);
router.get('/jobs/:id', getJobDetails);
router.get('/internships', listInternships);
router.get('/internships/:id', getInternshipDetails);
router.post('/saved', saveOpportunity);
router.delete('/saved/:id', unsaveOpportunity);
router.patch('/saved/:id', updateSavedDetails);
router.get('/saved', listSavedOpportunities);

export default router;
