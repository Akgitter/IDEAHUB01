import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  upvotes: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  downvotes: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({ default: 0 })
  shareCount: number;

  @Prop({ default: 0 })
  commentCount: number;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt?: Date;

  @Prop({ type: Number, default: 0 })
  trendingScore: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Indexes for performance
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ trendingScore: -1, createdAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ isDeleted: 1 });

// Virtuals
PostSchema.virtual('voteCount').get(function () {
  return (this.upvotes?.length || 0) - (this.downvotes?.length || 0);
});

PostSchema.set('toJSON', {
  virtuals: true,
});
