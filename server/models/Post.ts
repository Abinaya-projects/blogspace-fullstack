import mongoose, { Schema, Document } from 'mongoose';
import { IPostDoc, localDB, saveLocalDB, isMongoConnected } from '../config/db.js';
import { UserModel } from './User.js';

export interface IPost extends Document {
  title: string;
  content: string;
  category: string;
  image?: string;
  author: mongoose.Types.ObjectId;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a post title'],
      trim: true,
      maxlength: [160, 'Title cannot exceed 160 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide post content'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const MongoPostModel = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export const PostModel = {
  async find(filter: { category?: string; search?: string; author?: string; sort?: string; limit?: number; skip?: number } = {}) {
    if (isMongoConnected()) {
      const query: Record<string, unknown> = {};
      if (filter.category && filter.category !== 'All') {
        query.category = new RegExp(`^${filter.category}$`, 'i');
      }
      if (filter.author) {
        query.author = filter.author;
      }
      if (filter.search) {
        query.$or = [
          { title: { $regex: filter.search, $options: 'i' } },
          { content: { $regex: filter.search, $options: 'i' } },
        ];
      }

      let mQuery = MongoPostModel.find(query).populate('author', 'name email avatar bio');
      if (filter.sort === 'oldest') {
        mQuery = mQuery.sort({ createdAt: 1 });
      } else if (filter.sort === 'comments') {
        mQuery = mQuery.sort({ commentsCount: -1, createdAt: -1 });
      } else {
        mQuery = mQuery.sort({ createdAt: -1 });
      }

      if (filter.skip) mQuery = mQuery.skip(filter.skip);
      if (filter.limit) mQuery = mQuery.limit(filter.limit);

      const docs = await mQuery.lean();
      return docs.map((doc: any) => ({
        ...doc,
        _id: String(doc._id),
        author: doc.author ? {
          ...doc.author,
          _id: String(doc.author._id),
        } : null,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      }));
    }

    // Local DB resolution
    let results = [...localDB.posts];

    if (filter.category && filter.category !== 'All') {
      results = results.filter((p) => p.category.toLowerCase() === filter.category?.toLowerCase());
    }

    if (filter.author) {
      results = results.filter((p) => {
        const authorId = typeof p.author === 'object' ? p.author._id : p.author;
        return authorId === filter.author;
      });
    }

    if (filter.search) {
      const q = filter.search.toLowerCase();
      results = results.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(q);
        const contentMatch = p.content.toLowerCase().includes(q);
        const authorNameMatch = typeof p.author === 'object' && p.author.name ? p.author.name.toLowerCase().includes(q) : false;
        return titleMatch || contentMatch || authorNameMatch;
      });
    }

    if (filter.sort === 'oldest') {
      results.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (filter.sort === 'comments') {
      results.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
    } else {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Populate authors
    const populated = await Promise.all(
      results.map(async (p) => {
        let authorData = p.author;
        if (typeof p.author === 'string') {
          const user = await UserModel.findById(p.author);
          if (user) {
            authorData = {
              _id: user._id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              bio: user.bio,
            };
          }
        }
        return {
          ...p,
          author: authorData,
        };
      })
    );

    const skip = filter.skip || 0;
    const limit = filter.limit || populated.length;
    return populated.slice(skip, skip + limit);
  },

  async countDocuments(filter: { category?: string; search?: string; author?: string } = {}) {
    if (isMongoConnected()) {
      const query: Record<string, unknown> = {};
      if (filter.category && filter.category !== 'All') {
        query.category = new RegExp(`^${filter.category}$`, 'i');
      }
      if (filter.author) query.author = filter.author;
      if (filter.search) {
        query.$or = [
          { title: { $regex: filter.search, $options: 'i' } },
          { content: { $regex: filter.search, $options: 'i' } },
        ];
      }
      return MongoPostModel.countDocuments(query);
    }

    let results = [...localDB.posts];
    if (filter.category && filter.category !== 'All') {
      results = results.filter((p) => p.category.toLowerCase() === filter.category?.toLowerCase());
    }
    if (filter.author) {
      results = results.filter((p) => {
        const authorId = typeof p.author === 'object' ? p.author._id : p.author;
        return authorId === filter.author;
      });
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      results = results.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
    }
    return results.length;
  },

  async findById(id: string): Promise<IPostDoc | null> {
    if (isMongoConnected()) {
      const doc = await MongoPostModel.findById(id).populate('author', 'name email avatar bio').lean();
      if (!doc) return null;
      return {
        ...doc,
        _id: String(doc._id),
        author: doc.author ? {
          ...(doc.author as any),
          _id: String((doc.author as any)._id),
        } : null,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      } as unknown as IPostDoc;
    }

    const post = localDB.posts.find((p) => p._id === id);
    if (!post) return null;

    let authorData = post.author;
    if (typeof post.author === 'string') {
      const user = await UserModel.findById(post.author);
      if (user) {
        authorData = {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
        };
      }
    }

    return {
      ...post,
      author: authorData,
    };
  },

  async create(postData: Omit<IPostDoc, '_id' | 'createdAt' | 'updatedAt' | 'commentsCount'>): Promise<IPostDoc> {
    const now = new Date().toISOString();
    if (isMongoConnected()) {
      const doc = await MongoPostModel.create({
        ...postData,
        commentsCount: 0,
      });
      const populated = await MongoPostModel.findById(doc._id).populate('author', 'name email avatar bio').lean();
      return {
        ...populated,
        _id: String(populated._id),
        author: populated.author ? {
          ...(populated.author as any),
          _id: String((populated.author as any)._id),
        } : null,
        createdAt: populated.createdAt ? new Date(populated.createdAt).toISOString() : now,
        updatedAt: populated.updatedAt ? new Date(populated.updatedAt).toISOString() : now,
      } as unknown as IPostDoc;
    }

    const newPost: IPostDoc = {
      _id: 'post_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      ...postData,
      commentsCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    localDB.posts.unshift(newPost);
    saveLocalDB();

    let authorData = newPost.author;
    if (typeof newPost.author === 'string') {
      const user = await UserModel.findById(newPost.author);
      if (user) {
        authorData = {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
        };
      }
    }

    return {
      ...newPost,
      author: authorData,
    };
  },

  async findByIdAndUpdate(id: string, updates: Partial<IPostDoc>): Promise<IPostDoc | null> {
    if (isMongoConnected()) {
      const doc = await MongoPostModel.findByIdAndUpdate(id, updates, { new: true })
        .populate('author', 'name email avatar bio')
        .lean();
      if (!doc) return null;
      return {
        ...doc,
        _id: String(doc._id),
        author: doc.author ? {
          ...(doc.author as any),
          _id: String((doc.author as any)._id),
        } : null,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      } as unknown as IPostDoc;
    }

    const idx = localDB.posts.findIndex((p) => p._id === id);
    if (idx === -1) return null;

    localDB.posts[idx] = {
      ...localDB.posts[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveLocalDB();

    return this.findById(id);
  },

  async findByIdAndDelete(id: string): Promise<boolean> {
    if (isMongoConnected()) {
      const res = await MongoPostModel.findByIdAndDelete(id);
      return !!res;
    }

    const idx = localDB.posts.findIndex((p) => p._id === id);
    if (idx === -1) return false;
    localDB.posts.splice(idx, 1);
    // Also remove associated comments
    localDB.comments = localDB.comments.filter((c) => c.post !== id);
    saveLocalDB();
    return true;
  },

  async incrementCommentsCount(postId: string, amount: number = 1): Promise<void> {
    if (isMongoConnected()) {
      await MongoPostModel.findByIdAndUpdate(postId, { $inc: { commentsCount: amount } });
      return;
    }

    const post = localDB.posts.find((p) => p._id === postId);
    if (post) {
      post.commentsCount = Math.max(0, (post.commentsCount || 0) + amount);
      saveLocalDB();
    }
  },
};
