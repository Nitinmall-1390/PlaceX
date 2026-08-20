# PlaceX — AI-Powered Campus Placement Management System

> **Production-grade backend for a complete campus placement lifecycle management platform.**

---

## Overview

PlaceX manages the full campus recruitment process — from student registration and AI-powered resume analysis to company job postings, application workflows, placement drives, and analytics dashboards.

### Roles
| Role | Description |
|---|---|
| `STUDENT` | Registers, uploads resume, applies to jobs, tracks placement |
| `COMPANY` | Posts jobs, manages applications, schedules drives |
| `ADMIN` | Approves companies, manages platform, views analytics |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MongoDB Atlas + Mongoose |
| Authentication | JWT (access + refresh) with rotation |
| AI | Google Gemini API |
| File Storage | Cloudinary |
| Email | Nodemailer |
| Real-time | Socket.io |
| Docs | Swagger / OpenAPI 3.0 |
| Logging | Winston |
| Testing | Jest + Supertest |

---

## Architecture

```
HTTP Request
     ↓
Request ID Middleware
     ↓
Security (Helmet, CORS, Rate Limit, Sanitize)
     ↓
Authentication Middleware
     ↓
Authorization Middleware (RBAC + Ownership)
     ↓
Request Validation (Joi)
     ↓
Controller
     ↓
Service Layer (Business Logic)
     ↓
Repository (Data Access)
     ↓
Mongoose → MongoDB Atlas
```

---

## Features

- ✅ JWT authentication with refresh token rotation + reuse detection
- ✅ Role-based access control (STUDENT / COMPANY / ADMIN)
- ✅ Resource ownership enforcement
- ✅ Application state machine with status history
- ✅ AI resume ATS analysis (Gemini)
- ✅ Hybrid job recommendation engine
- ✅ Real-time notifications (Socket.io)
- ✅ Placement drive management
- ✅ MongoDB aggregation analytics
- ✅ Audit logging
- ✅ Rate limiting per endpoint
- ✅ Swagger/OpenAPI documentation
- ✅ Graceful shutdown
- ✅ Structured logging (never logs secrets)

---

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account
- (Optional) Cloudinary account
- (Optional) Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/placex-backend.git

# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
```

### Environment Variables

See [.env.example](.env.example) for full documentation.

**Required:**
- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

**Optional (features will be gracefully disabled if not set):**
- `CLOUDINARY_*` — File upload
- `GEMINI_API_KEY` — AI features
- `SMTP_*` — Email notifications

### Running Locally

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:5000`

| URL | Description |
|---|---|
| `GET /health` | Liveness check |
| `GET /ready` | Readiness check |
| `GET /api-docs` | Swagger UI (development only) |

---

## API Documentation

After starting the server, visit `http://localhost:5000/api-docs` for interactive Swagger documentation.

**Base URL:** `/api/v1`

---

## Security

- bcrypt password hashing (cost 12)
- Separate JWT access/refresh secrets
- Refresh tokens hashed at rest in database
- Refresh token rotation with reuse detection
- Helmet security headers
- CORS with allowlist
- MongoDB injection prevention
- XSS protection
- Per-endpoint rate limiting
- Input validation (Joi)
- No sensitive data in logs or responses

---

## Project Structure

```
backend/
├── src/
│   ├── config/          # env, database, cloudinary, swagger, logger
│   ├── controllers/     # Thin request handlers
│   ├── services/        # Business logic
│   ├── repositories/    # Data access layer
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── middlewares/     # Auth, RBAC, validation, error, rate limit
│   ├── validators/      # Joi schemas
│   ├── integrations/    # Gemini, Cloudinary, Mail
│   ├── utils/           # ApiError, ApiResponse, asyncHandler, crypto
│   ├── sockets/         # Socket.io handlers
│   ├── jobs/            # Background jobs
│   ├── app.js           # Express app factory
│   └── server.js        # HTTP server + graceful shutdown
├── tests/
├── docs/
├── .env.example
└── package.json
```

---

## License

ISC
