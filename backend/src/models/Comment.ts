import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  idea: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    idea: {
      type: Schema.Types.ObjectId,
      ref: 'Idea',
      required: [true, 'Idea reference is required'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      maxlength: [1000, 'Comment cannot be more than 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
commentSchema.index({ idea: 1, createdAt: -1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
