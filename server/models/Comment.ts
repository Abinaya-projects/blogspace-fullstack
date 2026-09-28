import mongoose, { Schema, Document } from 'mongoose';
import { ICommentDoc, localDB, saveLocalDB, isMongoConnected } from '../config/db.js';
import { UserModel } from './User.js';

export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: [true, 'Please provide comment text'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MongoCommentModel = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export const CommentModel = {
  async findByPost(postId: string) {
    if (isMongoConnected()) {
      const docs = await MongoCommentModel.find({ post: postId })
        .populate('author', 'name email avatar')
        .sort({ createdAt: 1 })
        .lean();
      return docs.map((doc: any) => ({
        ...doc,
        _id: String(doc._id),
        post: String(doc.post),
        author: doc.author ? {
          ...(doc.author as any),
          _id: String((doc.author as any)._id),
        } : null,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      }));
    }

    const matches = localDB.comments.filter((c) => c.post === postId);
    matches.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return Promise.all(
      matches.map(async (c) => {
        let authorData = c.author;
        if (typeof c.author === 'string') {
          const user = await UserModel.findById(c.author);
          if (user) {
            authorData = {
              _id: user._id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
            };
          }
        }
        return {
          ...c,
          author: authorData,
        };
      })
    );
  },

  async findById(id: string): Promise<ICommentDoc | null> {
    if (isMongoConnected()) {
      const doc = await MongoCommentModel.findById(id).populate('author', 'name email avatar').lean();
      if (!doc) return null;
      return {
        ...doc,
        _id: String(doc._id),
        post: String(doc.post),
        author: doc.author ? {
          ...(doc.author as any),
          _id: String((doc.author as any)._id),
        } : null,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      } as unknown as ICommentDoc;
    }

    const comment = localDB.comments.find((c) => c._id === id);
    if (!comment) return null;

    let authorData = comment.author;
    if (typeof comment.author === 'string') {
      const user = await UserModel.findById(comment.author);
      if (user) {
        authorData = {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        };
      }
    }

    return {
      ...comment,
      author: authorData,
    };
  },

  async create(data: Omit<ICommentDoc, '_id' | 'createdAt' | 'updatedAt'>): Promise<ICommentDoc> {
    const now = new Date().toISOString();
    if (isMongoConnected()) {
      const doc = await MongoCommentModel.create(data);
      const populated = await MongoCommentModel.findById(doc._id).populate('author', 'name email avatar').lean();
      return {
        ...populated,
        _id: String(populated._id),
        post: String(populated.post),
        author: populated.author ? {
          ...(populated.author as any),
          _id: String((populated.author as any)._id),
        } : null,
        createdAt: populated.createdAt ? new Date(populated.createdAt).toISOString() : now,
        updatedAt: populated.updatedAt ? new Date(populated.updatedAt).toISOString() : now,
      } as unknown as ICommentDoc;
    }

    const newComment: ICommentDoc = {
      _id: 'com_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    localDB.comments.push(newComment);
    saveLocalDB();

    return this.findById(newComment._id) as Promise<ICommentDoc>;
  },

  async findByIdAndUpdate(id: string, updates: Partial<ICommentDoc>): Promise<ICommentDoc | null> {
    if (isMongoConnected()) {
      const doc = await MongoCommentModel.findByIdAndUpdate(id, updates, { new: true })
        .populate('author', 'name email avatar')
        .lean();
      if (!doc) return null;
      return {
        ...doc,
        _id: String(doc._id),
        post: String(doc.post),
        author: doc.author ? {
          ...(doc.author as any),
          _id: String((doc.author as any)._id),
        } : null,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      } as unknown as ICommentDoc;
    }

    const idx = localDB.comments.findIndex((c) => c._id === id);
    if (idx === -1) return null;
    localDB.comments[idx] = {
      ...localDB.comments[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveLocalDB();
    return this.findById(id);
  },

  async findByIdAndDelete(id: string): Promise<boolean> {
    if (isMongoConnected()) {
      const res = await MongoCommentModel.findByIdAndDelete(id);
      return !!res;
    }

    const idx = localDB.comments.findIndex((c) => c._id === id);
    if (idx === -1) return false;
    localDB.comments.splice(idx, 1);
    saveLocalDB();
    return true;
  },

  async countByAuthor(authorId: string): Promise<number> {
    if (isMongoConnected()) {
      return MongoCommentModel.countDocuments({ author: authorId });
    }
    return localDB.comments.filter((c) => {
      const aId = typeof c.author === 'object' ? c.author._id : c.author;
      return aId === authorId;
    }).length;
  },
};
