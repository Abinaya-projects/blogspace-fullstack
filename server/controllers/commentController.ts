import { Request, Response } from 'express';
import { CommentModel } from '../models/Comment.js';
import { PostModel } from '../models/Post.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
export const getPostComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const comments = await CommentModel.findByPost(req.params.id);
    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (err: any) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving comments.' });
  }
};

// @desc    Create comment on a post
// @route   POST /api/posts/:id/comments
export const createComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Please log in to leave a comment.' });
      return;
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
      return;
    }

    const post = await PostModel.findById(req.params.id);
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found.' });
      return;
    }

    const comment = await CommentModel.create({
      content: content.trim(),
      author: req.user._id,
      post: req.params.id,
    });

    await PostModel.incrementCommentsCount(req.params.id, 1);

    res.status(201).json({
      success: true,
      message: 'Comment posted successfully.',
      comment,
    });
  } catch (err: any) {
    console.error('Error creating comment:', err);
    res.status(500).json({ success: false, message: 'Server error posting comment.' });
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
export const updateComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized.' });
      return;
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      res.status(400).json({ success: false, message: 'Comment text cannot be empty.' });
      return;
    }

    const comment = await CommentModel.findById(req.params.id);
    if (!comment) {
      res.status(404).json({ success: false, message: 'Comment not found.' });
      return;
    }

    const authorId = typeof comment.author === 'object' ? comment.author._id : comment.author;
    if (authorId !== req.user._id) {
      res.status(403).json({ success: false, message: 'You are only allowed to edit your own comment.' });
      return;
    }

    const updated = await CommentModel.findByIdAndUpdate(req.params.id, {
      content: content.trim(),
    });

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully.',
      comment: updated,
    });
  } catch (err: any) {
    console.error('Error updating comment:', err);
    res.status(500).json({ success: false, message: 'Server error updating comment.' });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
export const deleteComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized.' });
      return;
    }

    const comment = await CommentModel.findById(req.params.id);
    if (!comment) {
      res.status(404).json({ success: false, message: 'Comment not found.' });
      return;
    }

    const authorId = typeof comment.author === 'object' ? comment.author._id : comment.author;
    if (authorId !== req.user._id) {
      res.status(403).json({ success: false, message: 'You are only allowed to delete your own comment.' });
      return;
    }

    await CommentModel.findByIdAndDelete(req.params.id);
    await PostModel.incrementCommentsCount(comment.post, -1);

    res.status(200).json({
      success: true,
      message: 'Comment deleted.',
    });
  } catch (err: any) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ success: false, message: 'Server error deleting comment.' });
  }
};
