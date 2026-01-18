import { Response } from 'express';
import Diary from '../models/Diary';

export const getDiaries = async (req: any, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, category, mood, startDate, endDate, search } = req.query;

    const query: any = {};

    // Add filters
    if (category) query.category = category;
    if (mood) query.mood = mood;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sort: { date: -1 as 1, createdAt: -1 as 1 }
    };

    const diaries = await Diary.find(query)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit)
      .populate('attachedPhotos')
      .exec();

    const total = await Diary.countDocuments(query);

    res.json({
      success: true,
      data: {
        diaries,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit)
        }
      }
    });
  } catch (error) {
    console.error('Get diaries error:', error);
    res.status(500).json({
      success: false,
      message: '获取日记列表失败'
    });
  }
};

export const getDiary = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const diary = await Diary.findById(id).populate('attachedPhotos');

    if (!diary) {
      res.status(404).json({
        success: false,
        message: '日记不存在'
      });
      return;
    }

    res.json({
      success: true,
      data: { diary }
    });
  } catch (error) {
    console.error('Get diary error:', error);
    res.status(500).json({
      success: false,
      message: '获取日记失败'
    });
  }
};

export const createDiary = async (req: any, res: Response): Promise<void> => {
  try {
    const { title, content, mood, category, tags, date, attachedPhotos } = req.body;

    const diary = new Diary({
      title,
      content,
      mood,
      category,
      tags: tags || [],
      date: date ? new Date(date) : new Date(),
      attachedPhotos: attachedPhotos || []
    });

    await diary.save();

    // Populate photos before returning
    await diary.populate('attachedPhotos');

    res.status(201).json({
      success: true,
      message: '日记创建成功',
      data: { diary }
    });
  } catch (error) {
    console.error('Create diary error:', error);
    res.status(500).json({
      success: false,
      message: '创建日记失败'
    });
  }
};

export const updateDiary = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const diary = await Diary.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('attachedPhotos');

    if (!diary) {
      res.status(404).json({
        success: false,
        message: '日记不存在'
      });
      return;
    }

    res.json({
      success: true,
      message: '日记更新成功',
      data: { diary }
    });
  } catch (error) {
    console.error('Update diary error:', error);
    res.status(500).json({
      success: false,
      message: '更新日记失败'
    });
  }
};

export const deleteDiary = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const diary = await Diary.findByIdAndDelete(id);

    if (!diary) {
      res.status(404).json({
        success: false,
        message: '日记不存在'
      });
      return;
    }

    res.json({
      success: true,
      message: '日记删除成功'
    });
  } catch (error) {
    console.error('Delete diary error:', error);
    res.status(500).json({
      success: false,
      message: '删除日记失败'
    });
  }
};

export const getCategories = async (req: any, res: Response): Promise<void> => {
  try {
    const categories = await Diary.distinct('category');

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: '获取分类失败'
    });
  }
};

export const getTags = async (req: any, res: Response): Promise<void> => {
  try {
    const tags = await Diary.distinct('tags');

    res.json({
      success: true,
      data: { tags: tags.flat() }
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: '获取标签失败'
    });
  }
};

// 添加照片到日记
export const attachPhotos = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { photoIds } = req.body;

    const diary = await Diary.findById(id);

    if (!diary) {
      res.status(404).json({
        success: false,
        message: '日记不存在'
      });
      return;
    }

    // 添加照片ID（去重）
    photoIds.forEach((photoId: string) => {
      if (!diary.attachedPhotos.includes(photoId as any)) {
        diary.attachedPhotos.push(photoId as any);
      }
    });

    await diary.save();
    await diary.populate('attachedPhotos');

    res.json({
      success: true,
      message: '照片关联成功',
      data: { diary }
    });
  } catch (error) {
    console.error('Attach photos error:', error);
    res.status(500).json({
      success: false,
      message: '关联照片失败'
    });
  }
};

// 从日记移除照片
export const removePhoto = async (req: any, res: Response): Promise<void> => {
  try {
    const { id, photoId } = req.params;

    const diary = await Diary.findById(id);

    if (!diary) {
      res.status(404).json({
        success: false,
        message: '日记不存在'
      });
      return;
    }

    diary.attachedPhotos = diary.attachedPhotos.filter(
      (id) => id.toString() !== photoId
    );

    await diary.save();
    await diary.populate('attachedPhotos');

    res.json({
      success: true,
      message: '照片移除成功',
      data: { diary }
    });
  } catch (error) {
    console.error('Remove photo error:', error);
    res.status(500).json({
      success: false,
      message: '移除照片失败'
    });
  }
};
