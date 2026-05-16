# TeamFlow — Team Task Manager

A production-ready full-stack project management SaaS platform built with React, Node.js, Express, and MongoDB.

## 🚀 Features

- **Auth**: JWT login/register, bcrypt hashing, persistent sessions
- **Role-Based Access**: Admin (full control) & Member (view/update status only)
- **Projects**: Create, edit, delete with members, deadlines, priorities, colors
- **Tasks**: Kanban board, assign, comment, activity tracking, overdue alerts
- **Dashboard**: Charts (Recharts), stats, progress bars, recent activity
- **Dark/Light Mode**, responsive design, animations (Framer Motion)
- **Avatar Upload** via Cloudinary
- **Search & Filter** across tasks and projects

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | Password@123 |
| Member | member@test.com | Password@123 |

## 🛠 Tech Stack

**Frontend:** React 18 + Vite, Tailwind CSS, Framer Motion, Recharts, React Router, Axios, React Hot Toast

**Backend:** Node.js, Express.js, MongoDB + Mongoose, JWT, bcryptjs, Cloudinary

## 📦 Local Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd team-task-manager

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Environment Variables

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/teamtaskmanager
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Demo Data

```bash
cd backend && npm run seed
```

### 4. Run Locally

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

App runs at: http://localhost:5173

## ☁️ MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com
2. Create free cluster (M0)
3. Create DB user under Security → Database Access
4. Whitelist IP `0.0.0.0/0` under Network Access
5. Click Connect → Drivers → Copy connection string
6. Replace `MONGODB_URI` in your `.env`

## 🚂 Railway Deployment

### Deploy Backend

1. Go to https://railway.app → New Project → Deploy from GitHub
2. Select your repo → Set root directory to `backend`
3. Add environment variables from `backend/.env.example`
4. Set `NODE_ENV=production`
5. Railway auto-detects `npm start`

### Deploy Frontend

1. New Service → Deploy from GitHub (same repo)
2. Set root directory to `frontend`
3. Set build command: `npm run build`
4. Set start command: `npx serve dist -s -p $PORT`
5. Add env: `VITE_API_URL=https://your-backend.railway.app/api`

### Or Full-Stack on One Service

Set backend to serve frontend build:
```js
// In server.js, add after routes:
const path = require('path')
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')))
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')))
}
```

## 📁 Folder Structure

```
team-task-manager/
├── backend/
│   ├── config/         # Cloudinary config
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Auth, error middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── utils/          # Seed script
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/ # Reusable UI
│       ├── context/    # Auth & Theme context
│       ├── pages/      # Route pages
│       └── services/   # API layer
└── README.md
```

## 🔌 API Documentation

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |

### Projects
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | /api/projects | ✅ | All |
| POST | /api/projects | ✅ | Admin |
| PUT | /api/projects/:id | ✅ | Admin/Creator |
| DELETE | /api/projects/:id | ✅ | Admin/Creator |
| POST | /api/projects/:id/members | ✅ | Admin/Creator |
| DELETE | /api/projects/:id/members/:userId | ✅ | Admin/Creator |

### Tasks
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /api/tasks | ✅ |
| POST | /api/tasks | ✅ |
| PUT | /api/tasks/:id | ✅ |
| DELETE | /api/tasks/:id | ✅ |
| POST | /api/tasks/:id/comment | ✅ |

## 🐙 GitHub Push

```bash
git init
git add .
git commit -m "Initial commit: TeamFlow task manager"
git remote add origin https://github.com/yourusername/team-task-manager.git
git push -u origin main
```
