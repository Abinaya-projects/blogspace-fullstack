import { Request, Response } from 'express';
import { UserModel } from '../models/User.js';
import { PostModel } from '../models/Post.js';
import { CommentModel } from '../models/Comment.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

// @desc    Get user profile & their posts
// @route   GET /api/users/:id
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const posts = await PostModel.find({ author: user._id, sort: 'newest' });
    const totalPosts = await PostModel.countDocuments({ author: user._id });

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      user: safeUser,
      totalPosts,
      posts,
    });
  } catch (err: any) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving user profile.' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized.' });
      return;
    }

    if (req.user._id !== req.params.id) {
      res.status(403).json({ success: false, message: 'You can only update your own profile.' });
      return;
    }

    const { name, bio, avatar } = req.body;
    const updates: Record<string, any> = {};

    if (name && name.trim()) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (avatar !== undefined) updates.avatar = avatar.trim();

    const updated = await UserModel.findByIdAndUpdate(req.params.id, updates);

    if (!updated) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const safeUser = {
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      avatar: updated.avatar,
      bio: updated.bio,
      createdAt: updated.createdAt,
    };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: safeUser,
    });
  } catch (err: any) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
};

// @desc    Get dashboard metrics for logged-in user
// @route   GET /api/users/stats/dashboard
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized.' });
      return;
    }

    const userId = req.user._id;
    const userPosts = await PostModel.find({ author: userId, sort: 'newest' });
    const totalPosts = userPosts.length;

    // Total comments received across user posts
    const totalCommentsReceived = userPosts.reduce((acc, p) => acc + (p.commentsCount || 0), 0);

    // Comments written by user
    const totalCommentsWritten = await CommentModel.countByAuthor(userId);

    res.status(200).json({
      success: true,
      stats: {
        totalPosts,
        totalCommentsReceived,
        totalCommentsWritten,
        recentPosts: userPosts.slice(0, 5),
      },
    });
  } catch (err: any) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving dashboard metrics.' });
  }
};
