import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import Album from '../models/Album';
import Photo from '../models/Photo';
import sharp from 'sharp';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

export const getAlbums = async (req: any, res: Response): Promise<void> => {
  try {
    const albums = await Album.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { albums }
    });
  } catch (error) {
    console.error('Get albums error:', error);
    res.status(500).json({
      success: false,
      message: '获取相册列表失败'
    });
  }
};

export const createAlbum = async (req: any, res: Response): Promise<any> => {
  try {
    const { name, description } = req.body;

    const album = new Album({
      name,
      description
    });

    await album.save();

    res.status(201).json({
      success: true,
      message: '相册创建成功',
      data: { album }
    });
  } catch (error: any) {
    console.error('Create album error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || '创建相册失败',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getPhotos = async (req: any, res: Response): Promise<void> => {
  try {
    const { albumId, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (albumId) query.album = albumId;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sort: { createdAt: -1 as 1 }
    };

    const photos = await Photo.find(query)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit)
      .populate('album')
      .exec();

    const total = await Photo.countDocuments(query);

    res.json({
      success: true,
      data: {
        photos,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit)
        }
      }
    });
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({
      success: false,
      message: '获取照片列表失败'
    });
  }
};

export const uploadPhotos = async (req: any, res: Response): Promise<void> => {
  try {
    const { albumId, description, tags } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: '请至少上传一张照片'
      });
      return;
    }

    // Verify album exists
    const album = await Album.findById(albumId);
    if (!album) {
      res.status(404).json({
        success: false,
        message: '相册不存在'
      });
      return;
    }

    // Ensure thumbnails directory exists
    const uploadDir = path.join(__dirname, '../../uploads');
    const thumbDir = path.join(uploadDir, 'thumbnails');
    if (!fs.existsSync(thumbDir)) {
      fs.mkdirSync(thumbDir, { recursive: true });
    }

    const uploadedPhotos: any[] = [];

    for (const file of files) {
      // Generate thumbnail (320px width) and save alongside uploads
      const thumbnailPath = path.join(thumbDir, file.filename);
      try {
        await sharp(file.path).resize({ width: 320 }).withMetadata().toFile(thumbnailPath);
      } catch (thumbErr) {
        console.error('Thumbnail generation failed for', file.filename, thumbErr);
      }

      const parsedTags = (() => {
        try {
          return tags ? JSON.parse(tags) : [];
        } catch (e) {
          return [];
        }
      })();

      const photo = new Photo({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        url: `/uploads/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype,
        album: albumId,
        description,
        tags: parsedTags
      });

      await photo.save();
      uploadedPhotos.push(photo);
    }

    res.status(201).json({
      success: true,
      message: `成功上传 ${uploadedPhotos.length} 张照片`,
      data: { photos: uploadedPhotos }
    });
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({
      success: false,
      message: '上传照片失败'
    });
  }
};

export const deletePhoto = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const photo = await Photo.findById(id);

    if (!photo) {
      res.status(404).json({
        success: false,
        message: '照片不存在'
      });
      return;
    }

    // Delete file from filesystem
    if (fs.existsSync(photo.path)) {
      fs.unlinkSync(photo.path);
    }

    await Photo.findByIdAndDelete(id);

    res.json({
      success: true,
      message: '照片删除成功'
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      success: false,
      message: '删除照片失败'
    });
  }
};

export const deleteAlbum = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const album = await Album.findById(id);
    if (!album) {
      res.status(404).json({
        success: false,
        message: '相册不存在'
      });
      return;
    }

    // Don't allow deleting default album
    if (album.isDefault) {
      res.status(400).json({
        success: false,
        message: '不能删除默认相册'
      });
      return;
    }

    // Find all photos in this album
    const photos = await Photo.find({ album: id });

    // Delete all photo files from filesystem
    for (const photo of photos) {
      if (fs.existsSync(photo.path)) {
        fs.unlinkSync(photo.path);
      }
    }

    // Delete all photos in database
    await Photo.deleteMany({ album: id });

    // Delete the album
    await Album.findByIdAndDelete(id);

    res.json({
      success: true,
      message: '相册删除成功'
    });
  } catch (error) {
    console.error('Delete album error:', error);
    res.status(500).json({
      success: false,
      message: '删除相册失败'
    });
  }
};

export const updateAlbum = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const album = await Album.findById(id);
    if (!album) {
      res.status(404).json({
        success: false,
        message: '相册不存在'
      });
      return;
    }

    album.name = name || album.name;
    if (description !== undefined) {
      album.description = description;
    }

    await album.save();

    res.json({
      success: true,
      message: '相册更新成功',
      data: { album }
    });
  } catch (error) {
    console.error('Update album error:', error);
    res.status(500).json({
      success: false,
      message: '更新相册失败'
    });
  }
};
