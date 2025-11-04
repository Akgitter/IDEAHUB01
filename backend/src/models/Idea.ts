import mongoose, { Schema, Document } from 'mongoose';

export interface IIdea extends Document {
  title: string;
  description: string;
  author: mongoose.Types.ObjectId;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ideaSchema = new Schema<IIdea>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot be more than 5000 characters'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    downvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, 'Tag cannot be more than 50 characters'],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
ideaSchema.index({ author: 1, createdAt: -1 });
ideaSchema.index({ createdAt: -1 });

export const Idea = mongoose.model<IIdea>('Idea', ideaSchema);
