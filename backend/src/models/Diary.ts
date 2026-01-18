import mongoose, { Document, Schema } from 'mongoose';

export interface IDiary extends Document {
  title: string;
  content: string;
  mood: 'happy' | 'sad' | 'excited' | 'calm' | 'angry' | 'tired' | 'loved' | 'grateful';
  category: string;
  tags: string[];
  date: Date;
  isPublic: boolean;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DiarySchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, '日记标题不能为空'],
    trim: true,
    maxlength: [100, '标题最多100个字符']
  },
  content: {
    type: String,
    required: [true, '日记内容不能为空'],
    maxlength: [10000, '内容最多10000个字符']
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'excited', 'calm', 'angry', 'tired', 'loved', 'grateful'],
    default: 'happy'
  },
  category: {
    type: String,
    required: [true, '分类不能为空'],
    trim: true,
    maxlength: [20, '分类最多20个字符']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, '标签最多20个字符']
  }],
  date: {
    type: Date,
    default: Date.now
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
DiarySchema.index({ user: 1, date: -1 });
DiarySchema.index({ user: 1, category: 1 });
DiarySchema.index({ user: 1, mood: 1 });

// Virtual for formatted date
DiarySchema.virtual('formattedDate').get(function(this: IDiary) {
  return this.date.toISOString().split('T')[0];
});

// Virtual for word count
DiarySchema.virtual('wordCount').get(function(this: IDiary) {
  return this.content.split(/\s+/).length;
});

export default mongoose.model<IDiary>('Diary', DiarySchema);