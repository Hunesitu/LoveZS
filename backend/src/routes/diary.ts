import express from 'express';
import {
  getDiaries,
  getDiary,
  createDiary,
  updateDiary,
  deleteDiary,
  getCategories,
  getTags,
  attachPhotos,
  removePhoto
} from '../controllers/diaryController';

const router = express.Router();

// Diary CRUD routes
router.get('/', getDiaries);
router.get('/:id', getDiary);
router.post('/', createDiary);
router.put('/:id', updateDiary);
router.delete('/:id', deleteDiary);

// Photo association routes
router.post('/:id/photos', attachPhotos);
router.delete('/:id/photos/:photoId', removePhoto);

// Utility routes
router.get('/meta/categories', getCategories);
router.get('/meta/tags', getTags);

export default router;
