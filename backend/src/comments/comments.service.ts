import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Post, PostDocument } from '../posts/schemas/post.schema';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private postsService: PostsService,
  ) {}

  async create(userId: string, createCommentDto: CreateCommentDto): Promise<CommentDocument> {
    const { postId, parentCommentId, text } = createCommentDto;

    const post = await this.postModel.findById(postId);
    if (!post || post.isDeleted) {
      throw new NotFoundException('Post not found');
    }

    if (parentCommentId) {
      const parentComment = await this.commentModel.findById(parentCommentId);
      if (!parentComment || parentComment.isDeleted) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = new this.commentModel({
      text,
      user: userId,
      post: postId,
      parentComment: parentCommentId || null,
    });

    await comment.save();

    // Update parent comment replies if nested
    if (parentCommentId) {
      await this.commentModel.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id },
      });
    }

    // Update post comment count
    post.commentCount += 1;
    await post.save();

    // Recalculate trending score
    await this.postsService.calculateTrendingScore(postId);

    return comment.populate('user', 'name email avatar');
  }

  async findByPost(postId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const comments = await this.commentModel
      .find({ post: postId, parentComment: null, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email avatar')
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'name email avatar' },
      });

    const total = await this.commentModel.countDocuments({
      post: postId,
      parentComment: null,
      isDeleted: false,
    });

    return {
      comments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, userId: string, updateCommentDto: UpdateCommentDto) {
    const comment = await this.commentModel.findById(id);

    if (!comment || comment.isDeleted) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user.toString() !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.text = updateCommentDto.text;
    await comment.save();

    return comment.populate('user', 'name email avatar');
  }

  async delete(id: string, userId: string) {
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Soft delete
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await comment.save();

    // Update post comment count
    const post = await this.postModel.findById(comment.post);
    if (post) {
      post.commentCount = Math.max(0, post.commentCount - 1);
      await post.save();
      await this.postsService.calculateTrendingScore(post._id.toString());
    }
  }
}
