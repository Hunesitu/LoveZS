import express from 'express';
import { exportBackup } from '../controllers/backupController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/export', exportBackup);

export default router;

