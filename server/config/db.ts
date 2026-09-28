import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

export interface IUserDoc {
  _id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPostDoc {
  _id: string;
  title: string;
  content: string;
  category: string;
  image?: string;
  author: string | { _id: string; name: string; email: string; avatar?: string; bio?: string };
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICommentDoc {
  _id: string;
  content: string;
  author: string | { _id: string; name: string; email: string; avatar?: string };
  post: string;
  createdAt: string;
  updatedAt: string;
}

// In-Memory & File-backed Store for robust fallback if MongoDB is not connected
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.resolve(DATA_DIR, 'database.json');

export interface LocalDatabase {
  users: IUserDoc[];
  posts: IPostDoc[];
  comments: ICommentDoc[];
}

export const localDB: LocalDatabase = {
  users: [],
  posts: [],
  comments: [],
};

export const saveLocalDB = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(localDB, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save local database to disk:', err);
  }
};

export const loadLocalDB = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      localDB.users = parsed.users || [];
      localDB.posts = parsed.posts || [];
      localDB.comments = parsed.comments || [];
      console.log(`Loaded local database from disk: ${localDB.users.length} users, ${localDB.posts.length} posts, ${localDB.comments.length} comments.`);
    }
  } catch (err) {
    console.error('Failed to read local database from disk:', err);
  }
};

let isConnectedToMongo = false;

export const isMongoConnected = () => isConnectedToMongo;

export const connectDB = async () => {
  const rawMongoUri = process.env.MONGODB_URI;
  const mongoUri = rawMongoUri ? rawMongoUri.trim() : '';

  // Validate that the URI begins with a valid MongoDB protocol scheme
  const hasValidMongoScheme = mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://');

  if (hasValidMongoScheme) {
    try {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
      });
      isConnectedToMongo = true;
      console.log('Successfully connected to MongoDB.');
      return;
    } catch (err) {
      console.log('MongoDB cluster unreachable. Falling back to persistent local document engine.');
    }
  } else {
    if (mongoUri !== '') {
      console.log('MONGODB_URI is not a valid mongodb:// or mongodb+srv:// connection string. Using high-performance persistent local document store.');
    } else {
      console.log('No MONGODB_URI provided in environment. Initializing high-performance persistent local document store.');
    }
  }

  // Load from disk fallback
  loadLocalDB();
};
