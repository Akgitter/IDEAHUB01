import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dto/user.dto';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private redisService: RedisService,
  ) {}

  async findById(id: string): Promise<UserDocument> {
    // Try cache first
    const cached = await this.redisService.get(`user:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Cache for 5 minutes
    await this.redisService.set(`user:${id}`, JSON.stringify(user), 300);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Invalidate cache
    await this.redisService.del(`user:${id}`);
    return user;
  }

  async search(query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const users = await this.userModel
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
        isActive: true,
      })
      .skip(skip)
      .limit(limit)
      .select('-password -refreshToken');

    const total = await this.userModel.countDocuments({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
      isActive: true,
    });

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

  async follow(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new ConflictException('Cannot follow yourself');
    }

    const user = await this.userModel.findById(userId);
    const targetUser = await this.userModel.findById(targetUserId);

    if (!user || !targetUser) {
      throw new NotFoundException('User not found');
    }

    if (user.following.includes(targetUserId)) {
      throw new ConflictException('Already following this user');
    }

    user.following.push(targetUserId);
    targetUser.followers.push(userId);

    await user.save();
    await targetUser.save();

    // Invalidate caches
    await this.redisService.del(`user:${userId}`);
    await this.redisService.del(`user:${targetUserId}`);

    return { message: 'Followed successfully' };
  }

  async unfollow(userId: string, targetUserId: string) {
    const user = await this.userModel.findById(userId);
    const targetUser = await this.userModel.findById(targetUserId);

    if (!user || !targetUser) {
      throw new NotFoundException('User not found');
    }

    user.following = user.following.filter((id) => id !== targetUserId);
    targetUser.followers = targetUser.followers.filter((id) => id !== userId);

    await user.save();
    await targetUser.save();

    // Invalidate caches
    await this.redisService.del(`user:${userId}`);
    await this.redisService.del(`user:${targetUserId}`);

    return { message: 'Unfollowed successfully' };
  }

  async getFollowers(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const followers = await this.userModel
      .find({ _id: { $in: user.followers } })
      .skip(skip)
      .limit(limit);

    return {
      followers,
      pagination: {
        total: user.followers.length,
        page,
        limit,
        pages: Math.ceil(user.followers.length / limit),
      },
    };
  }

  async getFollowing(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const following = await this.userModel
      .find({ _id: { $in: user.following } })
      .skip(skip)
      .limit(limit);

    return {
      following,
      pagination: {
        total: user.following.length,
        page,
        limit,
        pages: Math.ceil(user.following.length / limit),
      },
    };
  }
}
