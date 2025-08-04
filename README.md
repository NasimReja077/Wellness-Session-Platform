# 🌿 Wellness Session Platform (WSP)

A robust, full-stack platform for creating, managing, and tracking wellness sessions (e.g., yoga, meditation, fitness). Built with secure JWT authentication, session draft auto-save, analytics dashboards, social engagement features (likes, comments, follows), and a responsive, mobile-first UI.

---

## 📖 Table of Contents

1. [What's Been Built](#whats-been-built)
2. [Prerequisites](#prerequisites)
3. [Quick Setup](#quick-setup)
4. [Core Requirements Met](#core-requirements-met)
5. [System Architecture](#system-architecture)
6. [Tech Stack](#tech-stack)
7. [Project Structure](#project-structure)
8. [API Documentation](#api-documentation)
9. [Key Features](#key-features)
10. [Security Implementation](#security-implementation)
11. [Testing Guide](#testing-guide)
12. [Project Roadmap](#project-roadmap)
13. [Summary](#summary)

---

## 🎯 What's Been Built

An advanced, feature-rich wellness platform that exceeds standard requirements, offering:

| Feature                        | Status         | Description                                                   |
|--------------------------------|:--------------:|---------------------------------------------------------------|
| Secure JWT Authentication      | ✅ Complete    | Secure login, register, refresh, bcrypt password hashing      |
| Session Management             | ✅ Complete    | Draft, publish, edit, delete, auto-save, analytics            |
| Analytics Dashboard            | ✅ Complete    | Streaks, category stats, weekly activity, goals               |
| Social Features                | ✅ Complete    | Follow/unfollow, likes, comments, user profiles               |
| Advanced Filtering             | ✅ Complete    | Category, difficulty, duration, tags, and search              |
| Progress Tracking              | ✅ Complete    | Track session completion, history, streaks                    |
| File Uploads                   | ✅ Complete    | Image/video support via Cloudinary                            |
| Rate Limiting & Security       | ✅ Complete    | Helmet, CORS, rate-limit, comprehensive validation            |
| Responsive UI                  | ✅ Complete    | Modern, accessible, state-managed UI with real-time feedback  |

---

## 📋 Prerequisites

**Required:**
- [Node.js](https://nodejs.org/) >= 16.x
- [npm](https://npmjs.com/) >= 8.x
- [Git](https://git-scm.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (or local MongoDB)

**Recommended:**
- [Postman](https://www.postman.com/) for API testing
- [VS Code](https://code.visualstudio.com/) with desirable extensions

---

## 🚀 Quick Setup

### 1. Clone & Install

```bash
git clone https://github.com/NasimReja077/Wellness-Session-Platform.git
cd Wellness-Session-Platform

# Backend
cd Backend
npm install

# Frontend
cd ../Frontend
npm install
```

### 2. Environment Configuration

#### Backend `.env`
```env
PORT=7000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/session_db
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=another-secret
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```
#### Frontend `.env`
```env
VITE_API_URL=http://localhost:7000/api
VITE_APP_NAME=Wellness Session Platform
VITE_APP_VERSION=1.0.0
NODE_ENV=development
```

### 3. Start the Development Servers

```bash
# Backend
cd Backend
npm run dev

# Frontend
cd ../Frontend
npm run dev
```

### 4. Verify Installation

- Visit [http://localhost:5173](http://localhost:5173)
- Register a user
- Create a draft session and try auto-save

---

## ✅ Core Requirements Met

| Requirement         | Status      | Details                                |
|---------------------|:----------:|----------------------------------------|
| 🔐 Authentication   | ✅         | JWT, bcrypt, httpOnly cookies          |
| 📘 Session API      | ✅         | Full CRUD, draft/publish workflow      |
| 🧘 Frontend Pages   | ✅         | All required + extra features          |
| 📦 Database Schema  | ✅         | Optimized, indexed MongoDB schemas     |
| ✨ Auto-save        | ✅         | 5s debounce, live feedback             |
| 🛡️ Route Protection| ✅         | JWT middleware, RBAC ready             |
| 📊 Bonus Features   | ✅         | Analytics, social, deployment ready    |

---

## 🏗️ System Architecture


```plaintext
Client (React + Zustand)
     ↓
Vite Dev Server (Frontend)
     ↓
API Requests (Axios with Interceptors)
     ↓
Express.js Backend (Node.js)
     ↓
MongoDB Atlas (Database)
     ↓
Cloudinary (Media Storage)

### High-Level Overview

```
### High-Level Design (HLD)
```mermaid
graph TB
    A[Client Browser] --> B[React Frontend]
    B --> C[Express Backend]
    C --> D[MongoDB Database]
    C --> E[Cloudinary CDN]
    C --> F[JWT Auth]
    
    subgraph "Frontend"
        B1[Pages]
        B2[Components]
        B3[State Management]
        B4[API Services]
    end
    
    subgraph "Backend"
        C1[Controllers]
        C2[Middleware]
        C3[Routes]
        C4[Models]
    end
    
    subgraph "Database"
        D1[Users]
        D2[Sessions]
        D3[Analytics]
        D4[Comments]
    end
```

### Low-Level Design (LLD)
```mermaid
Frontend Architecture:
├── App.jsx (Router, Auth Guards)
├── Pages/
│   ├── Auth (Login/Register)
│   ├── Dashboard (Analytics)
│   ├── Sessions (CRUD)
│   └── Profile (User Management)
├── Components/
│   ├── Navbar (Navigation)
│   └── LoadingSpinner (UI)
├── Store/
│   ├── authStore (Zustand)
│   └── sessionStore (Zustand)
└── Services/
    └── api.js (Axios interceptors)

Backend Architecture:
├── Controllers/ (Business Logic)
├── Models/ (Mongoose Schemas)
├── Routes/ (API Endpoints)
├── Middleware/ (Auth, Validation, Error)
└── Utils/ (Helpers, Validators)
```
### Data Model Relationships

```mermaid
erDiagram
    USER ||--o{ SESSION : "creates"
    USER ||--o{ FOLLOW : "follows"
    USER ||--o{ LIKE : "likes"
    SESSION ||--o{ COMMENT : "has"
    SESSION ||--o{ LIKE : "liked by"
    SESSION ||--o{ SESSIONTRACKING : "tracked by"
    USER ||--o{ SESSIONTRACKING : "completes"
    COMMENT ||--o| COMMENT : "replies"
```

---

## 🛠️ Tech Stack

| Layer     | Tech Stack & Tools                                         |
|-----------|-----------------------------------------------------------|
| Frontend  | React 19, Vite, Zustand, Axios, Tailwind CSS, Framer Motion, Recharts |
| Backend   | Node.js 18, Express 5, MongoDB Atlas, Mongoose 8, JWT, bcryptjs, Cloudinary |
| Security  | Helmet, cors, express-rate-limit, express-validator       |
| DevOps    | MongoDB Atlas, Cloudinary, Morgan, dotenv, nodemon        |

---

## 📁 Project Structure

```
🌿 Wellness-Session-Platform/
├── 📁 Backend/
│   ├── 📁 src/
│   │   ├── 🎮 controllers/        # Business logic
│   │   │   ├── 🔐 auth.controller.js
│   │   │   ├── 📝 session.controller.js
│   │   │   ├── 📊 analytics.controller.js
│   │   │   ├── 👤 user.controller.js
│   │   │   └── 📋 category.controller.js
│   │   ├── 📋 models/             # Database schemas
│   │   │   ├── 👤 User.model.js
│   │   │   ├── 📝 Session.model.js
│   │   │   ├── 📈 SessionTracking.model.js
│   │   │   ├── 📂 Category.model.js
│   │   │   ├── 💬 Comment.model.js
│   │   │   ├── ❤️ Like.model.js
│   │   │   └── 👥 Follow.model.js
│   │   ├── 🛣️ routes/             # API endpoints
│   │   │   ├── 🔐 auth.routes.js
│   │   │   ├── 📝 session.routes.js
│   │   │   ├── 📊 analytics.routes.js
│   │   │   ├── 👤 user.routes.js
│   │   │   ├── 📂 category.routes.js
│   │   │   └── 📋 index.routes.js
│   │   ├── 🛡️ middlewares/        # Custom middleware
│   │   │   ├── 🔐 auth.middleware.js
│   │   │   ├── ❌ error.middleware.js
│   │   │   ├── 🚦 rateLimiter.middleware.js
│   │   │   ├── 📤 upload.middleware.js
│   │   │   └── ✅ validation.middleware.js
│   │   ├── 🔧 utils/              # Utilities
│   │   │   ├── ✅ validators.js
│   │   │   ├── ❌ ApiError.js
│   │   │   ├── ✅ ApiResponse.js
│   │   │   ├── 🔄 asyncHandler.js
│   │   │   ├── ☁️ cloudinary.js
│   │   │   └── 🔐 jwt.js
│   │   ├── 🗄️ db/                 # Database connection
│   │   │   └── 🔌 index.js
│   │   ├── 📱 app.js              # Express app setup
│   │   └── 🚀 index.js            # Server entry point
│   ├── 📦 package.json
│   └── 🔧 .env.example
└── 📁 Frontend/
    ├── 📁 src/
    │   ├── 🧩 components/         # Reusable components
    │   │   ├── 🧭 Navbar.jsx
    │   │   └── ⏳ LoadingSpinner.jsx
    │   ├── 📄 pages/              # Page components
    │   │   ├── 🏠 Home.jsx
    │   │   ├── 🔐 Login.jsx
    │   │   ├── 📝 Register.jsx
    │   │   ├── 📊 Dashboard.jsx
    │   │   ├── 🧘 Sessions.jsx
    │   │   ├── 📋 SessionDetail.jsx
    │   │   ├── ✏️ SessionEditor.jsx
    │   │   ├── 👤 Profile.jsx
    │   │   ├── 📈 Analytics.jsx
    │   │   └── 👥 UserProfile.jsx
    │   ├── 🏪 store/              # State management
    │   │   ├── 🔐 authStore.js
    │   │   └── 📝 sessionStore.js
    │   ├── 🔌 services/           # API services
    │   │   └── 📡 api.js
    │   ├── 📱 App.jsx             # Main app component
    │   ├── 🚀 main.jsx            # App entry point
    │   └── 🎨 index.css           # Global styles
    ├── 📦 package.json
    └── 🔧 .env.example
```

---

## 📚 API Documentation

### Authentication

```api
{
  "title": "Register User",
  "description": "Register a new user",
  "method": "POST",
  "baseUrl": "http://localhost:7000/api",
  "endpoint": "/auth/register",
  "bodyType": "json",
  "requestBody": "{\n  \"username\": \"johnsmith\",\n  \"email\": \"john@example.com\",\n  \"password\": \"SecurePass123\",\n  \"profile\": {\n    \"firstName\": \"John\",\n    \"lastName\": \"Smith\",\n    \"bio\": \"Wellness enthusiast\",\n    \"fitnessGoals\": [\"weight_loss\", \"flexibility\"],\n    \"experienceLevel\": \"beginner\"\n  }\n}",
  "responses": {
    "201": {
      "description": "User registered",
      "body": "{ \"data\": { \"user\": { \"_id\": \"...\", \"username\": \"johnsmith\" }, \"token\": \"...\" } }"
    },
    "409": {
      "description": "Conflict",
      "body": "{ \"message\": \"User with email or username already exists\" }"
    }
  }
}
```

```api
{
  "title": "Login User",
  "description": "Authenticate an existing user",
  "method": "POST",
  "baseUrl": "http://localhost:7000/api",
  "endpoint": "/auth/login",
  "bodyType": "json",
  "requestBody": "{\n  \"email\": \"john@example.com\",\n  \"password\": \"SecurePass123\"\n}",
  "responses": {
    "200": {
      "description": "Login successful",
      "body": "{ \"data\": { \"user\": { \"_id\": \"...\", \"username\": \"johnsmith\" }, \"token\": \"...\" } }"
    },
    "401": {
      "description": "Unauthorized",
      "body": "{ \"message\": \"Invalid user credentials\" }"
    }
  }
}
```

### Sessions

```api
{
  "title": "Get Public Sessions",
  "description": "Retrieve all published sessions with filtering and pagination",
  "method": "GET",
  "baseUrl": "http://localhost:7000/api",
  "endpoint": "/sessions",
  "queryParams": [
    { "key": "page", "value": "Page number", "required": false },
    { "key": "limit", "value": "Items per page", "required": false },
    { "key": "category", "value": "Category ID", "required": false },
    { "key": "difficulty", "value": "Difficulty", "required": false },
    { "key": "tags", "value": "Comma-separated tags", "required": false },
    { "key": "search", "value": "Search string", "required": false },
    { "key": "minDuration", "value": "Minimum duration", "required": false },
    { "key": "maxDuration", "value": "Maximum duration", "required": false }
  ],
  "bodyType": "none",
  "responses": {
    "200": {
      "description": "Sessions retrieved",
      "body": "{ \"data\": { \"sessions\": [...], \"pagination\": {...} } }"
    }
  }
}
```

```api
{
  "title": "Save Draft Session",
  "description": "Create or update a draft session",
  "method": "POST",
  "baseUrl": "http://localhost:7000/api",
  "endpoint": "/sessions/save-draft",
  "headers": [
    { "key": "Authorization", "value": "Bearer <token>", "required": true }
  ],
  "bodyType": "json",
  "requestBody": "{\n  \"title\": \"Morning Yoga Flow\",\n  \"description\": \"Energizing yoga sequence for morning practice\",\n  \"category\": \"60f1b2b3c4567890\",\n  \"difficulty\": \"beginner\",\n  \"duration\": 30,\n  \"tags\": [\"yoga\", \"morning\"],\n  \"json_file_url\": \"https://example.com/session.json\",\n  \"content\": { \"instructions\": [ ... ], ... },\n  \"privacy\": \"public\"\n}",
  "responses": {
    "200": {
      "description": "Draft saved",
      "body": "{ \"data\": { \"_id\": \"...\", ... } }"
    }
  }
}
```

```api
{
  "title": "Publish Session",
  "description": "Publish a session from draft",
  "method": "POST",
  "baseUrl": "http://localhost:7000/api",
  "endpoint": "/sessions/publish",
  "headers": [
    { "key": "Authorization", "value": "Bearer <token>", "required": true }
  ],
  "bodyType": "json",
  "requestBody": "{\n  \"sessionId\": \"60f1b2b3c4567891\"\n}",
  "responses": {
    "200": {
      "description": "Session published",
      "body": "{ \"data\": { \"_id\": \"...\", \"status\": \"published\", ... } }"
    }
  }
}
```

### Social Features

```api
{
  "title": "Follow/Unfollow User",
  "description": "Toggle following status for a user by ID",
  "method": "POST",
  "baseUrl": "http://localhost:7000/api",
  "endpoint": "/users/{id}/follow",
  "pathParams": [
    { "key": "id", "value": "User ID", "required": true }
  ],
  "headers": [
    { "key": "Authorization", "value": "Bearer <token>", "required": true }
  ],
  "bodyType": "none",
  "responses": {
    "200": {
      "description": "Follow/unfollow toggled",
      "body": "{ \"data\": { \"isFollowing\": true, \"followersCount\": 5 } }"
    }
  }
}
```

```api
{
  "title": "Like/Unlike Session",
  "description": "Like or unlike a session",
  "method": "POST",
  "baseUrl": "http://localhost:7000/api",
  "endpoint": "/sessions/{sessionId}/like",
  "pathParams": [
    { "key": "sessionId", "value": "Session ID", "required": true }
  ],
  "headers": [
    { "key": "Authorization", "value": "Bearer <token>", "required": true }
  ],
  "bodyType": "none",
  "responses": {
    "200": {
      "description": "Like toggled",
      "body": "{ \"data\": { \"isLiked\": true, \"likesCount\": 20 } }"
    }
  }
}
```

### Analytics

```api
{
  "title": "User Analytics Dashboard",
  "description": "Get analytics for the signed-in user",
  "method": "GET",
  "baseUrl": "http://localhost:7000/api",
  "endpoint": "/analytics/dashboard",
  "headers": [
    { "key": "Authorization", "value": "Bearer <token>", "required": true }
  ],
  "queryParams": [
    { "key": "timeRange", "value": "week|month|year", "required": false }
  ],
  "bodyType": "none",
  "responses": {
    "200": {
      "description": "Analytics data",
      "body": "{ \"data\": { \"user_stats\": {...}, \"current_streak\": 7, \"weekly_activity\": [...], \"category_stats\": [...], \"goals\": {...} } }"
    }
  }
}
```

---

## ✨ Key Features

### Auto-Save Drafts

- 5-second debounce auto-save logic in the session editor
- Visual feedback for "saving", "saved", and "error"
- Resilient to rapid typing or accidental navigation

### Advanced Filtering

- Backend filtering by category, difficulty, duration, tags, and fuzzy search
- Pagination and sorting by popularity, duration, recency
- Efficient MongoDB aggregation pipeline

### Analytics & Progress

- Weekly/monthly/yearly breakdown of user activity
- Streak calculation
- Goal progress bars
- Real-time charts on dashboard

---

## 🔐 Security Implementation

- **JWT Authentication:** Secure tokens with httpOnly cookies and middleware
- **bcrypt Password Hashing:** Robust, salted password storage
- **Validation:** All endpoints use `express-validator` for input sanitization
- **Rate Limiting:** Global and auth-specific rate limiting
- **Security Headers:** Helmet, CORS, compression

---

## 🧪 Testing Guide

**Backend:**
- Use Postman collections for all endpoints
- Test registration, login, and all session/social APIs
- Validate error handling for invalid input and edge cases

**Frontend:**
- Register, login, and logout flows
- Session creation, editing, auto-save
- Analytics dashboard and all charts
- All social features (follow, like, comment)
- Responsive layout checks

---

## 🗺️ Project Roadmap

| Phase             | Status   | Key Deliverables                                      |
|-------------------|:--------:|-------------------------------------------------------|
| Core Platform     | ✅       | Auth, session CRUD, draft/publish, auto-save          |
| Social Features   | ✅       | Profiles, follow, like, comment, discovery            |
| Analytics         | ✅       | Dashboard, streaks, stats, progress tracking          |
| Enhancement       | 🚧       | Performance, image CDN, mobile, caching, optimizations|
| Enterprise        | 📝       | Multi-tenancy, admin, ML, integrations                |

---

## 📊 Summary

- **15+ API Endpoints:** full CRUD and social features
- **Optimized Models:** with clear relationships and indexes
- **Modern UI:** responsive, accessible, and real-time feedback
- **Advanced Analytics:** streaks, goals, category, and progress
- **Security:** JWT, bcrypt, input validation, rate limiting
- **Scalable:** microservice-ready, deployable, and maintainable

> **Experience the full platform:** follow the Quick Setup instructions and get started with your wellness journey today!

home
<img width="1902" height="900" alt="image" src="https://github.com/user-attachments/assets/20747638-54f3-46c0-bc11-97ca2a816285" />
<img width="1902" height="906" alt="image" src="https://github.com/user-attachments/assets/5f2b8662-13bc-457e-89b9-626a26964a4c" />

sineup
<img width="1910" height="907" alt="image" src="https://github.com/user-attachments/assets/fa8df38a-d524-4d01-a2d3-0afe98d8f72f" />
sine in
<img width="1904" height="904" alt="image" src="https://github.com/user-attachments/assets/494f8f13-d358-4ac6-a142-8b58b63fae44" />

dashboard
<img width="1907" height="969" alt="image" src="https://github.com/user-attachments/assets/48238949-3b91-4965-b83d-6b762369bc24" />
<img width="1905" height="714" alt="image" src="https://github.com/user-attachments/assets/bf101106-c450-4820-915f-c80b57e90822" />
<img width="1902" height="904" alt="image" src="https://github.com/user-attachments/assets/0d3c9717-016b-4e96-aba4-62be6e4fa85c" />

analytics
<img width="1877" height="991" alt="image" src="https://github.com/user-attachments/assets/b5f72cd7-a295-4dfe-83a2-7319d4a8b0a9" />
<img width="1903" height="911" alt="image" src="https://github.com/user-attachments/assets/e0eac4f1-4517-4f13-ac1f-ceb1647c8631" />
<img width="980" height="918" alt="image" src="https://github.com/user-attachments/assets/702f4a00-32fd-453d-89a4-cf15e563d89d" />

<img width="1901" height="893" alt="image" src="https://github.com/user-attachments/assets/3c642267-aea2-44d6-89a2-176d4f404050" />
<img width="300" height="600" alt="image" src="https://github.com/user-attachments/assets/901c9604-be9c-4cf1-9629-361cfa650913" />

<img width="1357" height="646" alt="image" src="https://github.com/user-attachments/assets/c20a13b2-af9c-4261-98aa-888dff23d467" />
<img width="342" height="649" alt="image" src="https://github.com/user-attachments/assets/fc2bf6cc-3345-470a-9d3d-5151c1d3e383" />
<img width="323" height="637" alt="image" src="https://github.com/user-attachments/assets/b111aa34-e396-4f14-bdda-9df601ecd502" />

Create New Session
<img width="1906" height="896" alt="image" src="https://github.com/user-attachments/assets/be57524d-0284-43d1-b8cc-6f79bbd1b5aa" />
<img width="1908" height="905" alt="image" src="https://github.com/user-attachments/assets/a2688d47-2f77-437f-bbb7-a739707f36ee" />

<img width="1898" height="903" alt="image" src="https://github.com/user-attachments/assets/fb4878d1-d6af-4470-8448-eb4415c39f1e" />
<img width="1906" height="901" alt="image" src="https://github.com/user-attachments/assets/b9a8a809-b9b0-40e8-bb1f-068129193cce" />
<img width="1894" height="883" alt="image" src="https://github.com/user-attachments/assets/28c3733a-5f3f-47b8-beba-430de57165ee" />

<img width="1919" height="897" alt="image" src="https://github.com/user-attachments/assets/951739c6-aaab-4c8d-b87d-9a70c55a09b0" />
<img width="1898" height="900" alt="image" src="https://github.com/user-attachments/assets/d01f4b3e-4399-41d8-ae61-316f0aae4aa0" />
<img width="1484" height="112" alt="image" src="https://github.com/user-attachments/assets/f3b9b910-41eb-478b-a52f-4528d61d1757" />























