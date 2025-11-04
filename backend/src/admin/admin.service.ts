import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Post, PostDocument } from '../posts/schemas/post.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async getStats() {
    const totalUsers = await this.userModel.countDocuments();
    const activeUsers = await this.userModel.countDocuments({ isActive: true });
    const verifiedUsers = await this.userModel.countDocuments({ isEmailVerified: true });

    const totalPosts = await this.postModel.countDocuments();
    const activePosts = await this.postModel.countDocuments({ isDeleted: false });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        verified: verifiedUsers,
      },
      posts: {
        total: totalPosts,
        active: activePosts,
        deleted: totalPosts - activePosts,
      },
    };
  }

  async getAllUsers(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const users = await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password -refreshToken');

    const total = await this.userModel.countDocuments();

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async deactivateUser(userId: string) {
    const user = await this.userModel.findByIdAndUpdate(userId, { isActive: false }, { new: true });

    return user;
  }

  async activateUser(userId: string) {
    const user = await this.userModel.findByIdAndUpdate(userId, { isActive: true }, { new: true });

    return user;
  }

  async deletePost(postId: string) {
    const post = await this.postModel.findById(postId);
    if (post) {
      post.isDeleted = true;
      post.deletedAt = new Date();
      await post.save();
    }
    return post;
  }
}
