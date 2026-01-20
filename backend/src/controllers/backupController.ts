import { Request, Response } from 'express';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import Diary from '../models/Diary';
import Photo from '../models/Photo';
import Album from '../models/Album';
import Countdown from '../models/Countdown';

export const exportBackup = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all data (共享模式)
    const [diaries, albums, photos, countdowns] = await Promise.all([
      Diary.find().lean(),
      Album.find().lean(),
      Photo.find().lean(),
      Countdown.find().lean()
    ]);

    // Prepare zip
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=lovezs-backup-${Date.now()}.zip`);

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
