import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async create(userId: string, createPostDto: CreatePostDto): Promise<PostDocument> {
    const post = new this.postModel({
      ...createPostDto,
      author: userId,
    });

    await post.save();
    await this.calculateTrendingScore(post._id.toString());

    // Publish event for realtime updates
    await this.redisService.publish('post:created', JSON.stringify(post));

    return post.populate('author');
  }

  async findAll(page = 1, limit = 20, cursor?: string) {
    const query: any = { isDeleted: false };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const posts = await this.postModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('author', 'name email avatar');

    const nextCursor = posts.length === limit ? posts[posts.length - 1]._id : null;

    return {
      posts,
      nextCursor,
      hasMore: posts.length === limit,
    };
  }

  async findTrending(page = 1, limit = 20) {
    const posts = await this.postModel
      .find({ isDeleted: false })
      .sort({ trendingScore: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name email avatar');

    const total = await this.postModel.countDocuments({ isDeleted: false });

    return {
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<PostDocument> {
    const post = await this.postModel.findById(id).populate('author', 'name email avatar');

    if (!post || post.isDeleted) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async update(id: string, userId: string, updatePostDto: UpdatePostDto): Promise<PostDocument> {
    const post = await this.postModel.findById(id);

    if (!post || post.isDeleted) {
      throw new NotFoundException('Post not found');
    }

    if (post.author.toString() !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    Object.assign(post, updatePostDto);
    await post.save();

    return post.populate('author', 'name email avatar');
  }

  async delete(id: string, userId: string): Promise<void> {
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    // Soft delete
    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();
  }

  async incrementShareCount(id: string): Promise<void> {
    const post = await this.postModel.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    post.shareCount += 1;
    await post.save();
    await this.calculateTrendingScore(id);
  }

  async getUserPosts(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const posts = await this.postModel
      .find({ author: userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email avatar');

    const total = await this.postModel.countDocuments({ author: userId, isDeleted: false });

    return {
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getFollowingFeed(userId: string, followingIds: string[], cursor?: string, limit = 20) {
    const query: any = {
      author: { $in: followingIds },
      isDeleted: false,
    };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const posts = await this.postModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('author', 'name email avatar');

    const nextCursor = posts.length === limit ? posts[posts.length - 1]._id : null;

    return {
      posts,
      nextCursor,
      hasMore: posts.length === limit,
    };
  }

  /**
   * Trending Score Algorithm:
   * score = (upvotes * VOTE_WEIGHT + comments * COMMENT_WEIGHT + shares * SHARE_WEIGHT)
   *         / (1 + hours_since_creation / TIME_DECAY_HOURS)
   */
  async calculateTrendingScore(postId: string): Promise<void> {
    const post = await this.postModel.findById(postId);
    if (!post) return;

    const voteWeight = parseFloat(this.configService.get<string>('VOTE_WEIGHT', '1.0'));
    const commentWeight = parseFloat(this.configService.get<string>('COMMENT_WEIGHT', '0.5'));
    const shareWeight = parseFloat(this.configService.get<string>('SHARE_WEIGHT', '0.3'));
    const timeDecayHours = parseFloat(this.configService.get<string>('TIME_DECAY_HOURS', '72'));

    const upvoteCount = post.upvotes.length;
    const downvoteCount = post.downvotes.length;
    const netVotes = upvoteCount - downvoteCount;

    const hoursSinceCreation = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);

    const score =
      (netVotes * voteWeight + post.commentCount * commentWeight + post.shareCount * shareWeight) /
      (1 + hoursSinceCreation / timeDecayHours);

    post.trendingScore = Math.max(0, score);
    await post.save();
  }

  async recalculateAllTrendingScores(): Promise<void> {
    const posts = await this.postModel.find({ isDeleted: false });
    for (const post of posts) {
      await this.calculateTrendingScore(post._id.toString());
    }
  }
}
