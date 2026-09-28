import { Request, Response } from 'express';
import { PostModel } from '../models/Post.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

// @desc    Get all posts (with filter, search, sort)
// @route   GET /api/posts
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, author, sort, page = '1', limit = '10' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const filterObj = {
      category: category as string,
      search: search as string,
      author: author as string,
      sort: sort as string,
      skip,
      limit: limitNum,
    };

    const [posts, total] = await Promise.all([
      PostModel.find(filterObj),
      PostModel.countDocuments({
        category: category as string,
        search: search as string,
        author: author as string,
      }),
    ]);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      posts,
    });
  } catch (err: any) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving posts.' });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await PostModel.findById(req.params.id);

    if (!post) {
      res.status(404).json({ success: false, message: 'Blog post not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      post,
    });
  } catch (err: any) {
    console.error('Error fetching post:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving blog post.' });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
export const createPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized.' });
      return;
    }

    const { title, content, category, image } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Please provide a post title.' });
      return;
    }

    if (!content || !content.trim()) {
      res.status(400).json({ success: false, message: 'Please provide post content.' });
      return;
    }

    if (!category || !category.trim()) {
      res.status(400).json({ success: false, message: 'Please select a category.' });
      return;
    }

    const newPost = await PostModel.create({
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      image: image ? image.trim() : '',
      author: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Post published successfully!',
      post: newPost,
    });
  } catch (err: any) {
    console.error('Error creating post:', err);
    res.status(500).json({ success: false, message: 'Server error creating blog post.' });
  }
};

// @desc    Update an existing post
// @route   PUT /api/posts/:id
export const updatePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized.' });
      return;
    }

    const post = await PostModel.findById(req.params.id);
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found.' });
      return;
    }

    const authorId = typeof post.author === 'object' ? post.author._id : post.author;
    if (authorId !== req.user._id) {
      res.status(403).json({ success: false, message: 'You are not authorized to update this post.' });
      return;
    }

    const { title, content, category, image } = req.body;

    const updates: Record<string, any> = {};
    if (title !== undefined) updates.title = title.trim();
    if (content !== undefined) updates.content = content.trim();
    if (category !== undefined) updates.category = category.trim();
    if (image !== undefined) updates.image = image ? image.trim() : '';

    const updatedPost = await PostModel.findByIdAndUpdate(req.params.id, updates);

    res.status(200).json({
      success: true,
      message: 'Post updated successfully.',
      post: updatedPost,
    });
  } catch (err: any) {
    console.error('Error updating post:', err);
    res.status(500).json({ success: false, message: 'Server error updating post.' });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
export const deletePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized.' });
      return;
    }

    const post = await PostModel.findById(req.params.id);
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found.' });
      return;
    }

    const authorId = typeof post.author === 'object' ? post.author._id : post.author;
    if (authorId !== req.user._id) {
      res.status(403).json({ success: false, message: 'You are not authorized to delete this post.' });
      return;
    }

    await PostModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully.',
    });
  } catch (err: any) {
    console.error('Error deleting post:', err);
    res.status(500).json({ success: false, message: 'Server error deleting post.' });
  }
};
