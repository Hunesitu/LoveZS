import { Response } from 'express';
import Diary from '../models/Diary';
import { AuthRequest } from '../types/auth';

export const getDiaries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { page = 1, limit = 10, category, mood, startDate, endDate, search } = req.query;

    const query: any = { user: userId };

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
      sort: { date: -1 as 1, createdAt: -1 as 1 },
      populate: []
    };

    const diaries = await Diary.find(query)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit)
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

export const getDiary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const diary = await Diary.findOne({ _id: id, user: userId });

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

export const createDiary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { title, content, mood, category, tags, date, isPublic } = req.body;

    const diary = new Diary({
      title,
      content,
      mood,
      category,
      tags: tags || [],
      date: date ? new Date(date) : new Date(),
      isPublic: isPublic || false,
      user: userId
    });

    await diary.save();

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

export const updateDiary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const updateData = req.body;

    const diary = await Diary.findOneAndUpdate(
      { _id: id, user: userId },
      updateData,
      { new: true, runValidators: true }
    );

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

export const deleteDiary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const diary = await Diary.findOneAndDelete({ _id: id, user: userId });

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

export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const categories = await Diary.distinct('category', { user: userId });

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

export const getTags = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const tags = await Diary.distinct('tags', { user: userId });

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