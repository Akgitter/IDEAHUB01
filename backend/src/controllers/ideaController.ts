import { Response } from 'express';
import mongoose from 'mongoose';
import { Idea } from '../models/Idea.js';
import { Comment } from '../models/Comment.js';
import { AuthRequest } from '../middleware/auth.js';

export const createIdea = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, tags } = req.body;

    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const idea = await Idea.create({
      title,
      description,
      author: req.userId,
      tags: tags || [],
    });

    const populatedIdea = await Idea.findById(idea._id).populate('author', 'name email avatar');

    res.status(201).json({
      message: 'Idea created successfully',
      idea: populatedIdea,
    });
  } catch (error) {
    console.error('Create idea error:', error);
    res.status(500).json({ error: 'Error creating idea' });
  }
};

export const getIdeas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const ideas = await Idea.find()
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Idea.countDocuments();

    res.json({
      ideas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get ideas error:', error);
    res.status(500).json({ error: 'Error fetching ideas' });
  }
};

export const getIdeaById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const idea = await Idea.findById(id)
      .populate('author', 'name email avatar')
      .populate('upvotes', 'name email')
      .populate('downvotes', 'name email');

    if (!idea) {
      res.status(404).json({ error: 'Idea not found' });
      return;
    }

    res.json({ idea });
  } catch (error) {
    console.error('Get idea by ID error:', error);
    res.status(500).json({ error: 'Error fetching idea' });
  }
};

export const updateIdea = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, tags } = req.body;

    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const idea = await Idea.findById(id);

    if (!idea) {
      res.status(404).json({ error: 'Idea not found' });
      return;
    }

    // Check if user is the author
    if (idea.author.toString() !== req.userId) {
      res.status(403).json({ error: 'Not authorized to update this idea' });
      return;
    }

    if (title) idea.title = title;
    if (description) idea.description = description;
    if (tags) idea.tags = tags;

    await idea.save();

    const updatedIdea = await Idea.findById(id).populate('author', 'name email avatar');

    res.json({
      message: 'Idea updated successfully',
      idea: updatedIdea,
    });
  } catch (error) {
    console.error('Update idea error:', error);
    res.status(500).json({ error: 'Error updating idea' });
  }
};

export const deleteIdea = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const idea = await Idea.findById(id);

    if (!idea) {
      res.status(404).json({ error: 'Idea not found' });
      return;
    }

    // Check if user is the author
    if (idea.author.toString() !== req.userId) {
      res.status(403).json({ error: 'Not authorized to delete this idea' });
      return;
    }

    await Idea.findByIdAndDelete(id);
    
    // Delete associated comments
    await Comment.deleteMany({ idea: id });

    res.json({ message: 'Idea deleted successfully' });
  } catch (error) {
    console.error('Delete idea error:', error);
    res.status(500).json({ error: 'Error deleting idea' });
  }
};

export const upvoteIdea = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const idea = await Idea.findById(id);

    if (!idea) {
      res.status(404).json({ error: 'Idea not found' });
      return;
    }

    const userIdObj = req.userId;
    const hasUpvoted = idea.upvotes.some(id => id.toString() === userIdObj);
    const hasDownvoted = idea.downvotes.some(id => id.toString() === userIdObj);

    if (hasUpvoted) {
      // Remove upvote
      idea.upvotes = idea.upvotes.filter(id => id.toString() !== userIdObj);
    } else {
      // Add upvote and remove downvote if exists
      idea.upvotes.push(new mongoose.Types.ObjectId(req.userId));
      if (hasDownvoted) {
        idea.downvotes = idea.downvotes.filter(id => id.toString() !== userIdObj);
      }
    }

    await idea.save();

    const updatedIdea = await Idea.findById(id).populate('author', 'name email avatar');

    res.json({
      message: hasUpvoted ? 'Upvote removed' : 'Idea upvoted',
      idea: updatedIdea,
    });
  } catch (error) {
    console.error('Upvote idea error:', error);
    res.status(500).json({ error: 'Error voting on idea' });
  }
};

export const downvoteIdea = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const idea = await Idea.findById(id);

    if (!idea) {
      res.status(404).json({ error: 'Idea not found' });
      return;
    }

    const userIdObj = req.userId;
    const hasUpvoted = idea.upvotes.some(id => id.toString() === userIdObj);
    const hasDownvoted = idea.downvotes.some(id => id.toString() === userIdObj);

    if (hasDownvoted) {
      // Remove downvote
      idea.downvotes = idea.downvotes.filter(id => id.toString() !== userIdObj);
    } else {
      // Add downvote and remove upvote if exists
      idea.downvotes.push(new mongoose.Types.ObjectId(req.userId));
      if (hasUpvoted) {
        idea.upvotes = idea.upvotes.filter(id => id.toString() !== userIdObj);
      }
    }

    await idea.save();

    const updatedIdea = await Idea.findById(id).populate('author', 'name email avatar');

    res.json({
      message: hasDownvoted ? 'Downvote removed' : 'Idea downvoted',
      idea: updatedIdea,
    });
  } catch (error) {
    console.error('Downvote idea error:', error);
    res.status(500).json({ error: 'Error voting on idea' });
  }
};

export const getUserIdeas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const ideas = await Idea.find({ author: userId })
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Idea.countDocuments({ author: userId });

    res.json({
      ideas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get user ideas error:', error);
    res.status(500).json({ error: 'Error fetching user ideas' });
  }
};
