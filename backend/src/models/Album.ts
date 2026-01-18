import mongoose, { Document, Schema } from 'mongoose';

export interface IAlbum extends Document {
  name: string;
  description?: string;
  coverPhoto?: string;
  user: mongoose.Types.ObjectId;
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
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
AlbumSchema.index({ user: 1 });

// Ensure only one default album per user
// AlbumSchema.pre('save', async function(next) {
//   if (this.isDefault) {
//     await mongoose.model('Album').updateMany(
//       { user: this.user, _id: { $ne: this._id } },
//       { $set: { isDefault: false } }
//     );
//   }
//   next();
// });

export default mongoose.model<IAlbum>('Album', AlbumSchema);