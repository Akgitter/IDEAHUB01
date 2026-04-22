import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  COMMENT = 'comment',
  VOTE = 'vote',
  FOLLOW = 'follow',
  MENTION = 'mention',
  POST_SHARED = 'post_shared',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recipient: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ required: true, enum: Object.values(NotificationType) })
  type: NotificationType;

  @Prop({ type: Types.ObjectId, refPath: 'relatedModel' })
  relatedId: Types.ObjectId;

  @Prop({ type: String, enum: ['Post', 'Comment', 'User'] })
  relatedModel: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ sender: 1 });
NotificationSchema.index({ createdAt: -1 });
