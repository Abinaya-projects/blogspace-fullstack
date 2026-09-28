import mongoose, { Schema, Document } from 'mongoose';
import { IUserDoc, localDB, saveLocalDB, isMongoConnected } from '../config/db.js';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: [240, 'Bio cannot exceed 240 characters'],
    },
  },
  {
    timestamps: true,
  }
);

export const MongoUserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// Universal model adapter
export const UserModel = {
  async findOne(query: { email?: string; _id?: string }): Promise<IUserDoc | null> {
    if (isMongoConnected()) {
      const doc = await MongoUserModel.findOne(query).lean();
      if (!doc) return null;
      return {
        ...doc,
        _id: String(doc._id),
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      } as unknown as IUserDoc;
    }

    if (query.email) {
      return localDB.users.find((u) => u.email.toLowerCase() === query.email?.toLowerCase()) || null;
    }
    if (query._id) {
      return localDB.users.find((u) => u._id === query._id) || null;
    }
    return null;
  },

  async findById(id: string): Promise<IUserDoc | null> {
    if (isMongoConnected()) {
      const doc = await MongoUserModel.findById(id).lean();
      if (!doc) return null;
      return {
        ...doc,
        _id: String(doc._id),
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      } as unknown as IUserDoc;
    }
    return localDB.users.find((u) => u._id === id) || null;
  },

  async create(userData: Omit<IUserDoc, '_id' | 'createdAt' | 'updatedAt'>): Promise<IUserDoc> {
    const now = new Date().toISOString();
    if (isMongoConnected()) {
      const doc = await MongoUserModel.create(userData);
      const plain = doc.toObject();
      return {
        ...plain,
        _id: String(plain._id),
        createdAt: plain.createdAt.toISOString(),
        updatedAt: plain.updatedAt.toISOString(),
      } as unknown as IUserDoc;
    }

    const newUser: IUserDoc = {
      _id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      ...userData,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}`,
      bio: userData.bio || '',
      createdAt: now,
      updatedAt: now,
    };
    localDB.users.push(newUser);
    saveLocalDB();
    return newUser;
  },

  async findByIdAndUpdate(id: string, updates: Partial<IUserDoc>): Promise<IUserDoc | null> {
    if (isMongoConnected()) {
      const doc = await MongoUserModel.findByIdAndUpdate(id, updates, { new: true }).lean();
      if (!doc) return null;
      return {
        ...doc,
        _id: String(doc._id),
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      } as unknown as IUserDoc;
    }

    const index = localDB.users.findIndex((u) => u._id === id);
    if (index === -1) return null;
    localDB.users[index] = {
      ...localDB.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveLocalDB();
    return localDB.users[index];
  },
};
