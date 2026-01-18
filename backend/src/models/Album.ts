import mongoose, { Document, Schema } from 'mongoose';

export interface IAlbum extends Document {
  name: string;
  description?: string;
  coverPhoto?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AlbumSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, '相册名称不能为空'],
    trim: true,
    maxlength: [50, '相册名称最多50个字符']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, '描述最多200个字符']
  },
  coverPhoto: {
    type: String,
    default: ''
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
AlbumSchema.index({ isDefault: 1 });

// Ensure only one default album
AlbumSchema.pre('save', async function() {
  if (this.isDefault) {
    await mongoose.model('Album').updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
});

export default mongoose.model<IAlbum>('Album', AlbumSchema);
