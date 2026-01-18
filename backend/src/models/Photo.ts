import mongoose, { Document, Schema } from 'mongoose';

export interface IPhoto extends Document {
  filename: string;
  originalName: string;
  path: string;
  url: string;
  size: number;
  mimetype: string;
  album: mongoose.Types.ObjectId;
  description?: string;
  tags: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  exif?: {
    camera?: string;
    lens?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: number;
    focalLength?: string;
    dateTime?: Date;
  };
  compressedUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PhotoSchema: Schema = new Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  album: {
    type: Schema.Types.ObjectId,
    ref: 'Album',
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, '描述最多200个字符']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, '标签最多20个字符']
  }],
  location: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    },
    address: String
  },
  exif: {
    camera: String,
    lens: String,
    aperture: String,
    shutterSpeed: String,
    iso: Number,
    focalLength: String,
    dateTime: Date
  }
  ,
  compressedUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
PhotoSchema.index({ album: 1, createdAt: -1 });
PhotoSchema.index({ tags: 1 });

// Virtual for file size in human readable format
PhotoSchema.virtual('sizeFormatted').get(function(this: IPhoto) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (this.size === 0) return '0 Byte';
  const i = Math.floor(Math.log(this.size) / Math.log(1024));
  return Math.round(this.size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for thumbnail URL
PhotoSchema.virtual('thumbnailUrl').get(function(this: IPhoto) {
  return this.url.replace('/uploads/', '/uploads/thumbnails/');
});
// Note: `compressedUrl` is stored as a field; no virtual accessor to avoid recursion.

export default mongoose.model<IPhoto>('Photo', PhotoSchema);