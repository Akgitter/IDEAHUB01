import { Response } from 'express';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate('followers', 'name email avatar')
      .populate('following', 'name email avatar');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        bio: user.bio,
        avatar: user.avatar,
        followers: user.followers,
        following: user.following,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Error fetching user profile' });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, bio, avatar } = req.body;

    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        bio: user.bio,
        avatar: user.avatar,
        followers: user.followers,
        following: user.following,
      },
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
};

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
      .select('name email avatar bio followers following')
      .limit(20);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Error searching users' });
  }
};

export const followUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (id === req.userId) {
      res.status(400).json({ error: 'You cannot follow yourself' });
      return;
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.userId),
      User.findById(id),
    ]);

    if (!currentUser || !targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if already following
    const isFollowing = currentUser.following.some(
      followingId => followingId.toString() === id
    );

    if (isFollowing) {
      res.status(400).json({ error: 'You are already following this user' });
      return;
    }

    // Add to following and followers
    currentUser.following.push(id as any);
    targetUser.followers.push(req.userId as any);

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({
      message: 'User followed successfully',
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        followers: targetUser.followers,
      },
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Error following user' });
  }
};

export const unfollowUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (id === req.userId) {
      res.status(400).json({ error: 'You cannot unfollow yourself' });
      return;
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.userId),
      User.findById(id),
    ]);

    if (!currentUser || !targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Remove from following and followers
    currentUser.following = currentUser.following.filter(
      followingId => followingId.toString() !== id
    );
    targetUser.followers = targetUser.followers.filter(
      followerId => followerId.toString() !== req.userId
    );

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({
      message: 'User unfollowed successfully',
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        followers: targetUser.followers,
      },
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Error unfollowing user' });
  }
};

export const getFollowers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).populate('followers', 'name email avatar bio');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ followers: user.followers });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Error fetching followers' });
  }
};

export const getFollowing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).populate('following', 'name email avatar bio');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ following: user.following });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Error fetching following' });
  }
};
