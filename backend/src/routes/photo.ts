import express from 'express';
import {
  getAlbums,
  createAlbum,
  getPhotos,
  uploadPhotos,
  deletePhoto,
  deleteAlbum,
  updateAlbum,
  upload
} from '../controllers/photoController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All photo routes require authentication
router.use(authenticate);

// Album routes
router.get('/albums', getAlbums);
router.post('/albums', createAlbum);
router.put('/albums/:id', updateAlbum);
router.delete('/albums/:id', deleteAlbum);

// Photo routes
router.get('/', getPhotos);
router.post('/upload', upload.array('photos', 20), uploadPhotos);
router.delete('/:id', deletePhoto);

export default router;
