import express from 'express';
import {
  getDiaries,
  getDiary,
  createDiary,
  updateDiary,
  deleteDiary,
  getCategories,
  getTags
} from '../controllers/diaryController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All diary routes require authentication
router.use(authenticate);

// Diary CRUD routes
router.get('/', getDiaries);
router.get('/:id', getDiary);
router.post('/', createDiary);
router.put('/:id', updateDiary);
router.delete('/:id', deleteDiary);

// Utility routes
router.get('/meta/categories', getCategories);
router.get('/meta/tags', getTags);

export default router;