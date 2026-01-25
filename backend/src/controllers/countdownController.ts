import { Response } from 'express';
import Countdown from '../models/Countdown';

export const getCountdowns = async (req: any, res: Response): Promise<void> => {
  try {
    const { type, direction } = req.query;

    const query: any = {};

    if (type) query.type = type;
    if (direction) query.direction = direction;

    let countdowns = await Countdown.find(query).sort({ targetDate: 1 });

    // 确保虚拟字段被正确序列化
    const serializedCountdowns = countdowns.map(c => c.toObject({ virtuals: true }));

    res.json({
      success: true,
      data: { countdowns: serializedCountdowns }
    });
  } catch (error) {
    console.error('Get countdowns error:', error);
    res.status(500).json({
      success: false,
      message: '获取纪念日列表失败'
    });
  }
};

export const getCountdown = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const countdown = await Countdown.findById(id);

    if (!countdown) {
      res.status(404).json({
        success: false,
        message: '纪念日不存在'
      });
      return;
    }

    res.json({
      success: true,
      data: { countdown: countdown.toObject({ virtuals: true }) }
    });
  } catch (error) {
    console.error('Get countdown error:', error);
    res.status(500).json({
      success: false,
      message: '获取纪念日失败'
    });
  }
};

export const createCountdown = async (req: any, res: Response): Promise<void> => {
  try {
    const { title, description, targetDate, type, direction, isRecurring, recurringType } = req.body;

    // 如果没有指定方向，自动根据日期判断
    let autoDirection = direction;
    if (!autoDirection) {
      const date = new Date(targetDate);
      autoDirection = date < new Date() ? 'countup' : 'countdown';
    }

    const countdown = new Countdown({
      title,
      description,
      targetDate: new Date(targetDate),
      type,
      direction: autoDirection,
      isRecurring,
      recurringType
    });

    await countdown.save();

    res.status(201).json({
      success: true,
      message: '纪念日创建成功',
      data: { countdown: countdown.toObject({ virtuals: true }) }
    });
  } catch (error: any) {
    console.error('Create countdown error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || '创建纪念日失败',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const updateCountdown = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.targetDate) {
      updateData.targetDate = new Date(updateData.targetDate);
    }

    const countdown = await Countdown.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!countdown) {
      res.status(404).json({
        success: false,
        message: '纪念日不存在'
      });
      return;
    }

    res.json({
      success: true,
      message: '纪念日更新成功',
      data: { countdown: countdown.toObject({ virtuals: true }) }
    });
  } catch (error) {
    console.error('Update countdown error:', error);
    res.status(500).json({
      success: false,
      message: '更新纪念日失败'
    });
  }
};

export const deleteCountdown = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const countdown = await Countdown.findByIdAndDelete(id);

    if (!countdown) {
      res.status(404).json({
        success: false,
        message: '纪念日不存在'
      });
      return;
    }

    res.json({
      success: true,
      message: '纪念日删除成功'
    });
  } catch (error) {
    console.error('Delete countdown error:', error);
    res.status(500).json({
      success: false,
      message: '删除纪念日失败'
    });
  }
};
