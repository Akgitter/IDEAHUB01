import { Response } from 'express';
import { Comment } from '../models/Comment.js';
import { Idea } from '../models/Idea.js';
import { AuthRequest } from '../middleware/auth.js';

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ideaId } = req.params;
    const { text } = req.body;

    if (!text) {
      res.status(400).json({ error: 'Comment text is required' });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Verify idea exists
    const idea = await Idea.findById(ideaId);
    if (!idea) {
      res.status(404).json({ error: 'Idea not found' });
      return;
    }

    const comment = await Comment.create({
      idea: ideaId,
      user: req.userId,
      text,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name email avatar');

    res.status(201).json({
      message: 'Comment created successfully',
      comment: populatedComment,
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Error creating comment' });
  }
};

export const getCommentsByIdea = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ideaId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ idea: ideaId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({ idea: ideaId });

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Error fetching comments' });
  }
};

export const updateComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      res.status(400).json({ error: 'Comment text is required' });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    // Check if user is the author
    if (comment.user.toString() !== req.userId) {
      res.status(403).json({ error: 'Not authorized to update this comment' });
      return;
    }

    comment.text = text;
    await comment.save();

    const updatedComment = await Comment.findById(id)
      .populate('user', 'name email avatar');

    res.json({
      message: 'Comment updated successfully',
      comment: updatedComment,
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Error updating comment' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    // Check if user is the author
    if (comment.user.toString() !== req.userId) {
      res.status(403).json({ error: 'Not authorized to delete this comment' });
      return;
    }

    await Comment.findByIdAndDelete(id);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Error deleting comment' });
  }
};
