# BlogSpace - Modern Full-Stack Blogging Platform

BlogSpace is a full-stack, production-grade blogging platform engineered for technical writers, software architects, product designers, and creative thinkers. It features a responsive React TypeScript frontend, an Express RESTful API, MongoDB/Mongoose database integration with an automated persistent fallback engine, and secure JWT-based authentication with bcrypt password hashing.

---

## 🌟 Key Features

### 1. User Registration & Authentication
- **Full Validation**: Name, email formatting, minimum password length, and password confirmation matching.
- **Secure Password Storage**: Passwords hashed with `bcryptjs` (salt rounds: 10).
- **Duplicate Email Prevention**: Checks database before account creation.
- **Stateless JWT Sessions**: JSON Web Tokens signed with secret and stored securely.
- **Auto-Fill Demo Account**: One-click demo credentials (`demo@blogspace.io` / `password123`) for evaluation.

### 2. Modern Landing & Discovery
- **Top Bar Contract**: Clean 3-zone header (`Brand Title` — `Nav Links` — `Actions`) with responsive mobile drawer.
- **Hero Section**: "Share Your Stories. Inspire the World." with primary conversion CTAs and quality proof metrics.
- **Editorial Spotlight**: Highlighting marquee articles with reading times and author credits.
- **Latest Posts Grid**: Responsive card grid with fallback image containers and unboxed metadata.

### 3. Explore & Search Engine
- **Live Search**: Search posts across titles, article bodies, and author names.
- **Segmented Category Filtering**: Filter across *Technology*, *Design*, *Lifestyle*, *Writing*, *Business*, *Programming*, and *Science*.
- **Multi-criteria Sorting**: Sort by *Newest First*, *Oldest First*, or *Most Discussed*.
- **Empty & Loading States**: Animated skeletons and clear recovery actions.

### 4. Article Publishing & Rich Editor
- **Create & Edit Flow**: Publish new posts or update existing content.
- **Live Preview Tab**: Instant toggle between markdown/prose editor and formatted preview mode.
- **Preset Image Suggestions**: Curated high-fidelity visual assets for instant thumbnail selection.
- **Ownership Protection**: Edit and delete operations are restricted strictly to post owners.

### 5. Article Detail & Discourse
- **Typography & Formatting**: Clean typographic hierarchy for headings, blockquotes, and code snippets.
- **Reading Time**: Dynamically calculated reading duration based on word count.
- **Two-Way Comment System**: Authenticated users can leave responses, edit their own comments inline, and delete them with confirmation dialogs.
- **Comment Count Sync**: Comment tallies update in real-time across cards, headers, and dashboards.

### 6. Author Dashboard & Profiles
- **Metric Summaries**: View total articles published, comments received, and engagement ratios.
- **Article Management**: Searchable and sortable post management table with view, edit, and deletion actions.
- **Public Author Profiles**: Showcase author avatar, biography, join date, and complete list of published stories.
- **Profile Editing**: Authors can update their display name, bio, and avatar.

---

## 🛠️ Technologies Used

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React icons, Motion
- **Backend**: Node.js, Express 4, RESTful APIs
- **Database**: MongoDB via Mongoose (with automated local persistent document store fallback when `MONGODB_URI` is omitted)
- **Security & Auth**: JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS
- **Tooling & Build**: Vite, `tsx`, ES2022 TypeScript compiler

---

## 🚀 Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn
- Optional: MongoDB instance (or MongoDB Atlas cluster). If not present, BlogSpace runs seamlessly using its built-in persistent document store.

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/your-username/blogspace.git
cd blogspace
npm install
```

### 3. Environment Variables
Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | HTTP port for Express server | `3000` |
| `MONGODB_URI` | MongoDB connection string (Optional) | `mongodb://localhost:27017/blogspace` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | `blogspace_jwt_secret_super_secure_key_2026` |
| `APP_URL` | Application root URL | `http://localhost:3000` |

### 4. Running the Application

#### Development Mode (Full-Stack Express + Vite)
```bash
npm run dev
```
The server will boot on `http://localhost:3000` with the Express API and Vite frontend running concurrently.

#### Production Build & Start
```bash
npm run build
npm start
```

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch currently logged-in user | **Yes** |

### Posts (`/api/posts`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/posts` | Query all posts (supports `search`, `category`, `sort`, `page`, `limit`) | No |
| `GET` | `/api/posts/:id` | Fetch single post by ID with populated author | No |
| `POST` | `/api/posts` | Create and publish a new post | **Yes** |
| `PUT` | `/api/posts/:id` | Update an existing post (owner only) | **Yes** |
| `DELETE` | `/api/posts/:id` | Delete post and associated comments (owner only) | **Yes** |

### Comments (`/api/comments` & `/api/posts/:id/comments`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/posts/:id/comments` | Get all comments for a post | No |
| `POST` | `/api/posts/:id/comments` | Post a new comment | **Yes** |
| `PUT` | `/api/comments/:id` | Update comment content (owner only) | **Yes** |
| `DELETE` | `/api/comments/:id` | Delete comment (owner only) | **Yes** |

### Users & Dashboard (`/api/users`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/users/:id` | Fetch user profile and their published posts | No |
| `PUT` | `/api/users/:id` | Update user profile (self only) | **Yes** |
| `GET` | `/api/users/stats/dashboard` | Fetch dashboard statistics for author | **Yes** |

---

## 📂 Project Structure

```
├── .data/                  # Persistent disk store fallback (if Mongo not configured)
├── server/
│   ├── config/             # DB connection & persistent document storage
│   ├── controllers/        # Express route handlers (auth, post, comment, user)
│   ├── middleware/         # JWT authentication guard
│   ├── models/             # Mongoose schemas (User, Post, Comment)
│   ├── routes/             # RESTful API route definitions
│   └── seedData.ts         # Sample data seeder with initial authors & articles
├── src/
│   ├── assets/images/      # High-fidelity generated image assets
│   ├── components/
│   │   ├── blog/           # BlogCard, CategoryBadge, CommentItem
│   │   ├── common/         # ConfirmationModal, LoadingSkeleton, EmptyState
│   │   └── layout/         # Navbar, Footer
│   ├── context/            # AuthContext, ToastContext
│   ├── pages/              # Home, Explore, PostDetail, CreateEditPost, Login, Register, Dashboard, Profile
│   ├── services/           # Fetch API client with JWT bearer tokens
│   ├── types/              # Domain models & TypeScript interfaces
│   ├── App.tsx             # Routing & application shell
│   ├── index.css           # Tailwind CSS imports & base styles
│   └── main.tsx            # React root entry point
├── server.ts               # Full-stack entry point (Express + Vite middlewares)
├── package.json
└── tsconfig.json
```

---

## 🔒 Security Measures

- Passwords salted and hashed with `bcryptjs`.
- Passwords are never returned in any API responses.
- Protected API routes check `Authorization: Bearer <token>` via JWT middleware.
- Strict authorization checks enforce that authors can only edit or delete their own posts and comments.
- Confirmation dialogs require explicit confirmation before deleting content.
