import mongoose, { Document, Schema } from 'mongoose';

export type CountdownDirection = 'countup' | 'countdown';
export type CountdownType = 'anniversary' | 'birthday' | 'event' | 'other';

export interface ICountdown extends Document {
  title: string;
  description?: string;
  targetDate: Date;
  type: CountdownType;
  direction: CountdownDirection;  // countup: 已过去天数, countdown: 倒计时
  isRecurring: boolean;
  recurringType?: 'yearly' | 'monthly' | 'daily';
  createdAt: Date;
  updatedAt: Date;
}

const CountdownSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, '标题不能为空'],
    trim: true,
    maxlength: [50, '标题最多50个字符']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, '描述最多200个字符']
  },
  targetDate: {
    type: Date,
    required: [true, '目标日期不能为空']
    // 移除必须是未来日期的验证，允许过去日期
  },
  type: {
    type: String,
    enum: ['anniversary', 'birthday', 'event', 'other'],
    default: 'other'
  },
  direction: {
    type: String,
    enum: ['countup', 'countdown'],
    default: 'countup'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringType: {
    type: String,
    enum: ['yearly', 'monthly', 'daily'],
    required: function(this: ICountdown) {
      return this.isRecurring;
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
CountdownSchema.index({ targetDate: 1 });
CountdownSchema.index({ type: 1 });
CountdownSchema.index({ direction: 1 });

// Virtual for days calculation (positive for countdown, negative for countup)
CountdownSchema.virtual('days').get(function(this: ICountdown) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(this.targetDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  let days = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // 对于 countup (已过去的纪念日)，天数加1（纪念日当天算第1天）
  if (this.direction === 'countup') {
    days -= 1;
  }

  return days;
});

// Virtual for absolute days (always positive)
CountdownSchema.virtual('absoluteDays').get(function(this: ICountdown) {
  return Math.abs((this as any).days);
});

// Virtual for formatted target date
CountdownSchema.virtual('formattedTargetDate').get(function(this: ICountdown) {
  return this.targetDate.toISOString().split('T')[0];
});

// Virtual for status
CountdownSchema.virtual('status').get(function(this: ICountdown) {
  const days = (this as any).days;

  if (this.direction === 'countup') {
    // countup: 已过去的纪念日
    if (days <= -365) return 'long-time';
    if (days <= -30) return 'month';
    return 'recent';
  } else {
    // countdown: 倒计时
    if (days <= 0) return 'today';
    if (days <= 7) return 'urgent';
    if (days <= 30) return 'soon';
    return 'upcoming';
  }
});

export default mongoose.model<ICountdown>('Countdown', CountdownSchema);
