import mongoose, { Document, Schema } from 'mongoose';

export interface ICountdown extends Document {
  title: string;
  description?: string;
  targetDate: Date;
  type: 'anniversary' | 'birthday' | 'event' | 'other';
  isRecurring: boolean;
  recurringType?: 'yearly' | 'monthly' | 'daily';
  isPublic: boolean;
  user: mongoose.Types.ObjectId;
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
    required: [true, '目标日期不能为空'],
    validate: {
      validator: function(value: Date) {
        return value > new Date();
      },
      message: '目标日期必须是未来的日期'
    }
  },
  type: {
    type: String,
    enum: ['anniversary', 'birthday', 'event', 'other'],
    default: 'other'
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
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
CountdownSchema.index({ user: 1, targetDate: 1 });
CountdownSchema.index({ user: 1, type: 1 });

// Virtual for days remaining
CountdownSchema.virtual('daysRemaining').get(function(this: ICountdown) {
  const now = new Date();
  const diffTime = this.targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual for hours remaining
CountdownSchema.virtual('hoursRemaining').get(function(this: ICountdown) {
  const now = new Date();
  const diffTime = this.targetDate.getTime() - now.getTime();
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  return Math.max(0, diffHours);
});

// Virtual for formatted target date
CountdownSchema.virtual('formattedTargetDate').get(function(this: ICountdown) {
  return this.targetDate.toISOString().split('T')[0];
});

// Virtual for status
CountdownSchema.virtual('status').get(function(this: ICountdown) {
  const now = new Date();
  if (this.targetDate <= now) return 'passed';
  if ((this as any).daysRemaining <= 7) return 'urgent';
  if ((this as any).daysRemaining <= 30) return 'soon';
  return 'upcoming';
});

export default mongoose.model<ICountdown>('Countdown', CountdownSchema);