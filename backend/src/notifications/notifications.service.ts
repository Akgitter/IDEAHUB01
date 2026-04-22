import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from './schemas/notification.schema';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private redisService: RedisService,
  ) {}

  async create(
    recipientId: string,
    senderId: string,
    type: NotificationType,
    message: string,
    relatedId?: string,
    relatedModel?: string,
  ) {
    const notification = new this.notificationModel({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      relatedId,
      relatedModel,
    });

    await notification.save();

    // Publish notification via Redis for realtime delivery
    await this.redisService.publish(`notifications:${recipientId}`, JSON.stringify(notification));

    return notification;
  }

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const notifications = await this.notificationModel
      .find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name email avatar');

    const total = await this.notificationModel.countDocuments({ recipient: userId });
    const unread = await this.notificationModel.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return {
      notifications,
      unread,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationModel.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      return null;
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    return { message: 'All notifications marked as read' };
  }
}
