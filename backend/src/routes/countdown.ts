import express from 'express';
import {
  getCountdowns,
  getCountdown,
  createCountdown,
  updateCountdown,
  deleteCountdown
} from '../controllers/countdownController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All countdown routes require authentication
router.use(authenticate);

// Countdown CRUD routes
router.get('/', getCountdowns);
router.get('/:id', getCountdown);
router.post('/', createCountdown);
router.put('/:id', updateCountdown);
router.delete('/:id', deleteCountdown);

export default router;