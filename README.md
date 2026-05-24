# Habit Tracker API

A production-ready RESTful API for tracking daily and weekly habits, built with **Node.js**, **Express**, **TypeScript**, and **MongoDB Atlas**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express 5 |
| Language | TypeScript (strict mode) |
| Database | MongoDB Atlas via Mongoose |
| Auth | JWT (jsonwebtoken) |
| Password hashing | bcrypt (10 salt rounds) |
| Validation | express-validator |
| Rate limiting | express-rate-limit |
| Date utilities | dayjs |

---

## Project Structure

```
src/
├── app.ts                  # Entry point — wires middleware, routes, starts server
├── config/
│   ├── env.ts              # Loads & validates environment variables
│   └── database.ts         # Mongoose connection
├── controllers/
│   ├── authController.ts   # register, login
│   ├── habitController.ts  # CRUD for habits
│   └── trackingController.ts # track today, get history
├── middlewares/
│   ├── authMiddleware.ts   # JWT protect middleware
│   ├── errorMiddleware.ts  # Centralised error handler + 404
│   ├── rateLimitMiddleware.ts # 100 req/hour per user
│   └── validationMiddleware.ts # express-validator result handler
├── models/
│   ├── User.ts             # User schema + bcrypt hook
│   ├── Habit.ts            # Habit schema
│   └── TrackingLog.ts      # Daily completion log
├── routes/
│   ├── authRoutes.ts       # POST /api/auth/*
│   └── habitRoutes.ts      # /api/habits/* (protected)
├── services/
│   ├── authService.ts      # JWT sign/verify
│   └── streakService.ts    # Streak calculation, 7-day history
└── utils/
    ├── dateUtils.ts        # UTC date helpers (dayjs)
    └── response.ts         # Consistent JSON response helpers
```

---

## Setup & Run

### Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works fine)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/habit-tracker?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
```

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default: 5000) |
| `MONGO_URI` | Full MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens — keep this long and random |
| `JWT_EXPIRES_IN` | Token expiry duration (e.g. `7d`, `24h`, `1h`) |

### 3. Run in development

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
npm start
```

---

## JWT Usage

1. Register a user via `POST /api/auth/register`
2. Log in via `POST /api/auth/login` — you'll receive a `token`
3. Include the token in the `Authorization` header for all `/api/habits/*` requests:

```
Authorization: Bearer <your_token_here>
```

---

## API Reference

All responses follow this shape:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... }   // present on success
}
```

---

### Auth

#### `POST /api/auth/register`

Register a new user.

**Request body:**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Registration successful. You can now log in."
}
```

---

#### `POST /api/auth/login`

Log in and receive a JWT.

**Request body:**
```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Habits

> All habit routes require `Authorization: Bearer <token>`

#### `POST /api/habits`

Create a new habit. Duplicate titles (case-insensitive) are rejected per user.

**Request body:**
```json
{
  "title": "Morning Run",
  "description": "Run 5km every morning",
  "frequency": "daily",
  "tags": ["fitness", "health"],
  "reminderTime": "07:00"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Habit created successfully.",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "userId": "665f1a2b3c4d5e6f7a8b9c01",
    "title": "Morning Run",
    "description": "Run 5km every morning",
    "frequency": "daily",
    "tags": ["fitness", "health"],
    "reminderTime": "07:00",
    "createdAt": "2024-06-04T07:00:00.000Z",
    "updatedAt": "2024-06-04T07:00:00.000Z"
  }
}
```

**Response `409` (duplicate title):**
```json
{
  "success": false,
  "message": "You already have a habit called \"Morning Run\"."
}
```

---

#### `GET /api/habits`

Get all habits for the logged-in user. Supports pagination and tag filtering.

**Query parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 100) |
| `tag` | string | — | Filter by tag (e.g. `?tag=health`) |

**Response `200`:**
```json
{
  "success": true,
  "message": "Habits retrieved successfully.",
  "data": {
    "habits": [ { ... }, { ... } ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

---

#### `GET /api/habits/:id`

Get a single habit by ID.

**Response `200`:**
```json
{
  "success": true,
  "message": "Habit retrieved successfully.",
  "data": { ... }
}
```

---

#### `PUT /api/habits/:id`

Update a habit. All fields are optional. If `title` is changed, it is checked for duplicates (case-insensitive) against the user's other habits.

**Request body:**
```json
{
  "title": "Evening Run",
  "frequency": "weekly",
  "tags": ["fitness"]
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Habit updated successfully.",
  "data": { ... }
}
```

**Response `409` (title already used by another habit):**
```json
{
  "success": false,
  "message": "You already have a habit called \"Evening Run\"."
}
```

---

#### `DELETE /api/habits/:id`

Delete a habit.

**Response `200`:**
```json
{
  "success": true,
  "message": "Habit deleted successfully."
}
```

---

### Tracking

#### `POST /api/habits/:id/track`

Mark a habit as completed for today. Only one log per habit per day is allowed.

**Response `201`:**
```json
{
  "success": true,
  "message": "Habit marked as completed for today.",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c10",
    "habitId": "665f1a2b3c4d5e6f7a8b9c0d",
    "userId": "665f1a2b3c4d5e6f7a8b9c01",
    "completedOn": "2024-06-04T00:00:00.000Z"
  }
}
```

**Response `409` (already tracked today):**
```json
{
  "success": false,
  "message": "Habit already marked as done for today."
}
```

---

#### `GET /api/habits/:id/history`

Get the last 7 days of completion history and the current streak count.

**Response `200`:**
```json
{
  "success": true,
  "message": "Habit history retrieved successfully.",
  "data": {
    "habit": {
      "id": "665f1a2b3c4d5e6f7a8b9c0d",
      "title": "Morning Run",
      "frequency": "daily"
    },
    "streak": 5,
    "history": [
      { "date": "2024-05-29", "completed": true },
      { "date": "2024-05-30", "completed": true },
      { "date": "2024-05-31", "completed": true },
      { "date": "2024-06-01", "completed": true },
      { "date": "2024-06-02", "completed": true },
      { "date": "2024-06-03", "completed": false },
      { "date": "2024-06-04", "completed": true }
    ]
  }
}
```

---

## HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicate entry) |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |

---

## MongoDB Schema Overview

### User
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required, max 100 chars |
| `email` | String | Required, unique, lowercase |
| `password` | String | Hashed with bcrypt (10 rounds), excluded from queries |
| `createdAt` | Date | Auto-managed |
| `updatedAt` | Date | Auto-managed |

### Habit
| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | Ref: User |
| `title` | String | Required, max 200 chars, unique per user (case-insensitive) |
| `description` | String | Optional, max 1000 chars |
| `frequency` | String | Enum: `daily` \| `weekly` |
| `tags` | String[] | Default: `[]` |
| `reminderTime` | String | Optional, format `HH:MM` |
| `createdAt` | Date | Auto-managed |
| `updatedAt` | Date | Auto-managed |

### TrackingLog
| Field | Type | Notes |
|---|---|---|
| `habitId` | ObjectId | Ref: Habit |
| `userId` | ObjectId | Ref: User |
| `completedOn` | Date | UTC midnight — unique per habit per day |
| `createdAt` | Date | Auto-managed |
| `updatedAt` | Date | Auto-managed |

---

## Rate Limiting

- **100 requests per hour** per authenticated user
- Enforced server-side using the `Authorization` header — the JWT is verified first, `userId` is extracted, and that `userId` is used as the counter key
- Same user on different devices shares the same counter
- Different users on the same IP get separate counters
- Unauthenticated requests fall back to IP-based counting
- Returns `429 Too Many Requests` when the limit is exceeded

Every response from a habit route includes these headers so the client knows where they stand:

| Header | Description |
|---|---|
| `RateLimit-Limit` | Max requests allowed per window (100) |
| `RateLimit-Remaining` | Requests left before being blocked |
| `RateLimit-Reset` | Seconds until the window resets |

---

## Health Check

```
GET /health
```

```json
{ "success": true, "message": "Habit Tracker API is running." }
```
