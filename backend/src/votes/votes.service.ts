import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../posts/schemas/post.schema';
import { PostsService } from '../posts/posts.service';

export enum VoteType {
  UPVOTE = 'upvote',
  DOWNVOTE = 'downvote',
}

@Injectable()
export class VotesService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private postsService: PostsService,
  ) {}

  async vote(postId: string, userId: string, voteType: VoteType) {
    const post = await this.postModel.findById(postId);

    if (!post || post.isDeleted) {
      throw new NotFoundException('Post not found');
    }

    const hasUpvoted = post.upvotes.some((id) => id.toString() === userId);
    const hasDownvoted = post.downvotes.some((id) => id.toString() === userId);

    // Remove existing votes
    post.upvotes = post.upvotes.filter((id) => id.toString() !== userId);
    post.downvotes = post.downvotes.filter((id) => id.toString() !== userId);

    // Add new vote if it's different from existing
    if (voteType === VoteType.UPVOTE && !hasUpvoted) {
      post.upvotes.push(userId as any);
    } else if (voteType === VoteType.DOWNVOTE && !hasDownvoted) {
      post.downvotes.push(userId as any);
    }

    await post.save();

    // Recalculate trending score
    await this.postsService.calculateTrendingScore(postId);

    return {
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
      userVote: voteType,
    };
  }

  async removeVote(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);

    if (!post || post.isDeleted) {
      throw new NotFoundException('Post not found');
    }

    post.upvotes = post.upvotes.filter((id) => id.toString() !== userId);
    post.downvotes = post.downvotes.filter((id) => id.toString() !== userId);

    await post.save();

    // Recalculate trending score
    await this.postsService.calculateTrendingScore(postId);

    return {
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
    };
  }

  async getVoteStatus(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const hasUpvoted = post.upvotes.some((id) => id.toString() === userId);
    const hasDownvoted = post.downvotes.some((id) => id.toString() === userId);

    return {
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
      userVote: hasUpvoted ? 'upvote' : hasDownvoted ? 'downvote' : null,
    };
  }
}
