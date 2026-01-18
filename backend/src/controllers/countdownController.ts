import { Response } from 'express';
import Countdown from '../models/Countdown';
import { AuthRequest } from '../types/auth';

export const getCountdowns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { type, status } = req.query;

    const query: any = { user: userId };

    if (type) query.type = type;

    let countdowns = await Countdown.find(query).sort({ targetDate: 1 });

    // Filter by status if provided
    if (status) {
      countdowns = countdowns.filter(countdown => (countdown as any).status === status);
    }

    res.json({
      success: true,
      data: { countdowns }
    });
  } catch (error) {
    console.error('Get countdowns error:', error);
    res.status(500).json({
      success: false,
      message: '获取倒计时列表失败'
    });
  }
};

export const getCountdown = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const countdown = await Countdown.findOne({ _id: id, user: userId });

    if (!countdown) {
      res.status(404).json({
        success: false,
        message: '倒计时不存在'
      });
      return;
    }

    res.json({
      success: true,
      data: { countdown }
    });
  } catch (error) {
    console.error('Get countdown error:', error);
    res.status(500).json({
      success: false,
      message: '获取倒计时失败'
    });
  }
};

export const createCountdown = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { title, description, targetDate, type, isRecurring, recurringType, isPublic } = req.body;

    const countdown = new Countdown({
      title,
      description,
      targetDate: new Date(targetDate),
      type,
      isRecurring,
      recurringType,
      isPublic,
      user: userId
    });

    await countdown.save();

    res.status(201).json({
      success: true,
      message: '倒计时创建成功',
      data: { countdown }
    });
  } catch (error) {
    console.error('Create countdown error:', error);
    res.status(500).json({
      success: false,
      message: '创建倒计时失败'
    });
  }
};

export const updateCountdown = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.targetDate) {
      updateData.targetDate = new Date(updateData.targetDate);
    }

    const countdown = await Countdown.findOneAndUpdate(
      { _id: id, user: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!countdown) {
      res.status(404).json({
        success: false,
        message: '倒计时不存在'
      });
      return;
    }

    res.json({
      success: true,
      message: '倒计时更新成功',
      data: { countdown }
    });
  } catch (error) {
    console.error('Update countdown error:', error);
    res.status(500).json({
      success: false,
      message: '更新倒计时失败'
    });
  }
};

export const deleteCountdown = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const countdown = await Countdown.findOneAndDelete({ _id: id, user: userId });

    if (!countdown) {
      res.status(404).json({
        success: false,
        message: '倒计时不存在'
      });
      return;
    }

    res.json({
      success: true,
      message: '倒计时删除成功'
    });
  } catch (error) {
    console.error('Delete countdown error:', error);
    res.status(500).json({
      success: false,
      message: '删除倒计时失败'
    });
  }
};