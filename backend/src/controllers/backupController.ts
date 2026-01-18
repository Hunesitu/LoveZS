import { Response } from 'express';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import Diary from '../models/Diary';
import Photo from '../models/Photo';
import Album from '../models/Album';
import Countdown from '../models/Countdown';
import { AuthRequest } from '../types/auth';

export const exportBackup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    // Fetch user's data
    const [diaries, albums, photos, countdowns] = await Promise.all([
      Diary.find({ user: userId }).lean(),
      Album.find({ user: userId }).lean(),
      Photo.find({ user: userId }).lean(),
      Countdown.find({ user: userId }).lean()
    ]);

    // Prepare zip
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=backup-${userId}-${Date.now()}.zip`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err: any) => {
      throw err;
    });

    archive.pipe(res);

    // Add metadata JSON
    const metadata = {
      diaries,
      albums,
      photos: photos.map(p => ({
        ...p,
        // remove large fields if any
      })),
      countdowns,
      exportedAt: new Date().toISOString()
    };

    archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });

    // Add photo files
    const uploadDir = path.join(__dirname, '../../uploads');
    for (const photo of photos) {
      const filePath = photo.path;
      if (filePath && fs.existsSync(filePath)) {
        const filename = path.basename(filePath);
        archive.file(filePath, { name: `photos/${filename}` });
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error('Export backup error:', error);
    res.status(500).json({
      success: false,
      message: '导出备份失败'
    });
  }
};

