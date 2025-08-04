# Wellness Session Platform

A **robust, production-ready full-stack wellness platform** designed with advanced features, security, and scalability in mind. This project is ideal as a SaaS foundation for a modern wellness business.

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

### High-Level Overview

```mermaid
flowchart LR
  FE[React Frontend\n(Zustand, Tailwind, Axios)]
  BE[Express API\n(JWT, Validation, Middleware)]
  DB[MongoDB Atlas\n(Mongoose ODM)]
  FE <--> BE <--> DB
  subgraph Middleware
    SEC[Helmet, Rate Limit, CORS]
  end
  BE -- uses --> SEC
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
Wellness-Session-Platform/
├── Backend/
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middlewares/
│       ├── utils/
│       ├── db/
│       ├── app.js
│       └── index.js
├── Frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── store/
│       ├── App.jsx
│       └── main.jsx
├── .gitignore
└── README.md
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
