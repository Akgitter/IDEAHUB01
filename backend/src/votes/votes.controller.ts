import { Controller, Post, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { VotesService, VoteType } from './votes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('votes')
@Controller('votes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post('upvote/:postId')
  @ApiOperation({ summary: 'Upvote a post' })
  @ApiResponse({ status: 200, description: 'Post upvoted successfully' })
  async upvote(@Param('postId') postId: string, @CurrentUser() user: any) {
    return this.votesService.vote(postId, user.userId, VoteType.UPVOTE);
  }

  @Post('downvote/:postId')
  @ApiOperation({ summary: 'Downvote a post' })
  @ApiResponse({ status: 200, description: 'Post downvoted successfully' })
  async downvote(@Param('postId') postId: string, @CurrentUser() user: any) {
    return this.votesService.vote(postId, user.userId, VoteType.DOWNVOTE);
  }

  @Delete(':postId')
  @ApiOperation({ summary: 'Remove vote from a post' })
  @ApiResponse({ status: 200, description: 'Vote removed successfully' })
  async removeVote(@Param('postId') postId: string, @CurrentUser() user: any) {
    return this.votesService.removeVote(postId, user.userId);
  }

  @Get(':postId')
  @ApiOperation({ summary: 'Get vote status for a post' })
  @ApiResponse({ status: 200, description: 'Vote status retrieved' })
  async getVoteStatus(@Param('postId') postId: string, @CurrentUser() user: any) {
    return this.votesService.getVoteStatus(postId, user.userId);
  }
}
