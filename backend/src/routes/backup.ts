import express from 'express';
import { exportBackup } from '../controllers/backupController';

const router = express.Router();

router.get('/export', exportBackup);

export default router;

