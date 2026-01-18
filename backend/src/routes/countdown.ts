import express from 'express';
import {
  getCountdowns,
  getCountdown,
  createCountdown,
  updateCountdown,
  deleteCountdown
} from '../controllers/countdownController';

const router = express.Router();

// Countdown CRUD routes
router.get('/', getCountdowns);
router.get('/:id', getCountdown);
router.post('/', createCountdown);
router.put('/:id', updateCountdown);
router.delete('/:id', deleteCountdown);

export default router;
