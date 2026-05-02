# GEC Event Portal - Complete Project Structure

## 📋 Project Overview

The **GEC Event Portal** is a full-stack web application for managing university events and clubs. It features role-based access (students, club admins, super admins), event registration, attendance tracking, and certificate generation.

**Tech Stack:**
- **Backend**: Node.js + Express.js
- **Frontend**: React 18 + Vite
- **Database**: PostgreSQL (primary) / MySQL (fallback) / In-Memory Store (testing)
- **Authentication**: JWT (JSON Web Tokens)
- **UI Framework**: Material-UI (MUI)
- **Deployment**: Render (backend), Netlify/Vercel (frontend)

---

## 🗂️ ROOT-LEVEL FILES & STRUCTURE

### Documentation & Setup Files

| File | Purpose |
|------|---------|
| **START_HERE.md** | Project entry point (currently empty - needs documentation) |
| **RUN_LOCALLY.md** | Local development setup guide (empty) |
| **SETUP_LOCAL.md** | Local environment configuration (empty) |
| **TROUBLESHOOTING.md** | Common issues and fixes |
| **README.md** | Frontend-specific documentation |
| **DEPLOYMENT.md** | Frontend deployment instructions |
| **RENDER_SETUP.md** | Backend deployment guide for Render |
| **POSTGRES_SETUP.sql** | PostgreSQL database schema and table definitions |

### Setup & Configuration Scripts

| File | Purpose |
|------|---------|
| **setup-all.bat** | Windows batch script - runs all setup steps |
| **setup-database.bat** | Initializes database tables and schema |
| **start-backend.bat** | Starts backend server |
| **start-frontend.bat** | Starts frontend dev server |
| **create-dirs.js / .bat / .py** | Creates necessary directory structure |
| **setup-auth.js** | JWT and authentication initialization |
| **setup-registration-complete.js** | Complete registration system setup |
| **complete_registration_setup.py** | Python alternative for registration setup |

### Deployment Configuration Files

| File | Purpose |
|------|---------|
| **netlify.toml** | Netlify frontend deployment config - sets build command, environment variables, redirects |
| **vercel.json** | Vercel frontend deployment config - alternative to Netlify |
| **backend/render.yaml** | Render backend deployment blueprint - auto-deploys Node + PostgreSQL |

### Git & Misc

| File | Purpose |
|------|---------|
| **.gitignore** | Excludes node_modules, env files, logs from version control |
| **verify-local.sh** | Shell script to verify local setup |

---

## 🔧 BACKEND STRUCTURE (`/backend`)

### Core Files

#### **server.js** (Main Entry Point)
- Initializes Express.js app with CORS configuration
- Loads environment variables via dotenv
- Configures CORS for localhost dev, Netlify, and Render domains
- Mounts route handlers for auth, events, dashboard
- Sets up `/api/health` endpoint to check database connectivity
- Serves frontend dist folder for production

#### **db.js** (Database Configuration)
- Implements connection pooling for PostgreSQL or MySQL
- Priority: **PostgreSQL** (via DATABASE_URL) → **MySQL** → **In-Memory Store**
- Supports SSL for secure connections
- Exports `getPool()` and `isPostgres()` functions
- Auto-falls back to memory store if database unavailable

#### **auth.middleware.js** (Authentication)
- `verifyToken()` - Validates JWT tokens from Authorization header
- `authorize(...roles)` - Role-based access control middleware
- Checks token signature and expiration

#### **memoryStore.js** (Testing Store)
- In-memory user database for testing without PostgreSQL/MySQL
- Pre-loaded with test users: admin@gec.ac.in, student@gec.ac.in, clubadmin@gec.ac.in
- Fallback when database unavailable

#### **migrations.js** (Database Schema)
- Auto-creates tables on app startup for both PostgreSQL and MySQL
- Tables created:
  - `users` - user accounts with roles
  - `clubs` - club information
  - `events` - event details
  - `registrations` - event registrations
  - `attendance` - attendance tracking

#### **pdfGenerator.js** (Certificate Generation)
- Generates professional A4 landscape PDF certificates
- Uses PDFKit library
- Creates certificates with decorated bordes, student name, event details
- Saves to `/uploads/certificates` directory

#### **seed.js** & **migrate.js**
- Database seeding and migration utilities
- Populate initial data or reset database

#### **test-login.js**
- Test script for login functionality

### Controllers (`/backend/controllers`)

#### **authController.js**
- `register()` - User registration with email validation (gec.ac.in domain)
- `login()` - Authentication with password hashing and JWT token generation
- `getProfile()` - Retrieve authenticated user's profile
- `logout()` - Invalidate session
- Uses bcryptjs for password hashing

#### **eventsController.js**
- `getAllEvents()` - Fetch all events (public)
- `getEventById()` - Get event details by ID
- `getMyRegistrations()` - Get events user is registered for
- `createEvent()` - Create new event (protected)
- `updateEvent()` - Modify event details
- `deleteEvent()` - Remove event
- `registerForEvent()` - Register user for event
- `unregisterEvent()` - Cancel registration

#### **dashboardController.js**
- Dashboard statistics and analytics
- Event management metrics
- User attendance data

#### **eventController.js** (Legacy)
- Duplicate/alternative events controller

### Routes (`/backend/routes`)

#### **auth.js**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile (protected)
- `POST /api/auth/logout` - Logout (protected)

#### **events.js**
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event by ID
- `GET /api/events/my/registrations` - User's event registrations (protected)
- `POST /api/events` - Create event (protected)
- `PUT /api/events/:id` - Update event (protected)
- `DELETE /api/events/:id` - Delete event (protected)
- `POST /api/events/register` - Register for event (protected)
- `DELETE /api/events/register/:id` - Unregister from event (protected)

#### **dashboard.js**
- Analytics and statistics endpoints
- Admin dashboard data

### Node Packages

```json
{
  "express": "^4.18.2",         // Web framework
  "cors": "^2.8.5",             // Cross-origin requests
  "dotenv": "^16.0.3",          // Environment variables
  "mysql2": "^3.2.0",           // MySQL driver
  "pg": "^8.10.0",              // PostgreSQL driver
  "bcryptjs": "^2.4.3",         // Password hashing
  "jsonwebtoken": "^9.0.0",     // JWT tokens
  "multer": "^1.4.5-lts.1",     // File upload handling
  "pdfkit": "^0.13.0"           // PDF generation
}
```

### Logs & Data

| File | Purpose |
|------|---------|
| **backend.log** | Server operation logs |
| **node_modules/** | Dependencies (not version controlled) |

---

## ⚛️ FRONTEND STRUCTURE (`/frontend`)

### Root Files

#### **index.html**
- Single-page application entry point
- Contains root div for React
- Loads Vite development server

#### **vite.config.js**
- Vite configuration for development/production builds
- React plugin integration
- Build output targeting

#### **package.json**
- Dependencies: React, React Router, Axios, MUI, Recharts
- Scripts: `dev`, `build`, `lint`, `preview`
- Production build target: `/dist` folder

### Configuration Files

#### **.env** & **.env.example** & **.env.production**
- `VITE_API_BASE_URL` - Backend API URL (dev: localhost, prod: Render)
- `VITE_ALLOWED_EMAIL_DOMAIN` - Email domain restriction (gec.ac.in)

#### **ESLint Config (.eslintrc.cjs)**
- Code quality rules
- React and React Hooks linting

### Source Code (`/frontend/src`)

#### **main.jsx**
- React entry point
- Mounts React app to DOM

#### **App.jsx**
- Main router setup with React Router
- Route definitions for all pages
- Theme provider setup
- Protected routes based on user role

#### **theme.js**
- Material-UI theme customization
- Color scheme and typography

#### **index.css**
- Global styles

### Context (`/frontend/src/context`)

#### **AuthContext.jsx**
- Global authentication state management
- Provides `login()`, `logout()`, `register()` functions
- Manages user object, token, loading, and error states
- Stores token in localStorage for persistence

### Components (`/frontend/src/components`)

#### **Layout/MainLayout.jsx**
- Main application wrapper
- Navigation bar and layout structure

#### **ProtectedRoute.jsx**
- Route guards for role-based access
- `AdminRoute` - Super admin only
- `ClubAdminRoute` - Club admin access
- `StudentRoute` - Student access

### Pages (`/frontend/src/pages`)

#### **Landing.jsx**
- Homepage/landing page

#### **Auth Pages** (`/pages/auth`)
- **Login.jsx** - User login form
- **Register.jsx** - User registration form

#### **Student Pages** (`/pages/student`)
- **StudentDashboard.jsx** - Student view with event listings and registrations

#### **Admin Pages** (`/pages/admin`)
- **AdminDashboard.jsx** - Super admin dashboard
- **TestDashboard.jsx** - Testing/debug dashboard

#### **Club Pages** (`/pages/club`)
- **ClubDashboard.jsx** - Club admin dashboard for managing club events

#### **Root-Level Pages**
- **AdminDashboard.jsx** - Alternative admin view
- **Analytics.jsx** - Statistics and trends
- **ClubDashboard.jsx** - Club management
- **EventRegistrations.jsx** - Event registration management
- **MyCertificates.jsx** - Download earned certificates
- **MyRegistrations.jsx** - User's registered events

### Utilities (`/frontend/src/utils`)

#### **api.js**
- Axios HTTP client configuration
- Base URL setup from env variables
- Authentication headers (Bearer token)
- Request/response interceptors

### Styling & Assets

| File | Purpose |
|------|---------|
| **public/** | Static assets (images, icons) |
| **dist/** | Production build output (generated) |

### Node Packages

```json
{
  "react": "^18.2.0",              // UI library
  "react-dom": "^18.2.0",          // DOM rendering
  "react-router-dom": "^6.18.0",   // Routing
  "axios": "^1.6.0",               // HTTP client
  "@mui/material": "^5.14.17",     // UI components
  "@mui/icons-material": "^5.14.16", // Icons
  "@emotion/react": "^11.11.1",    // Styling
  "@emotion/styled": "^11.11.0",   // Styled components
  "recharts": "^3.8.1",            // Charts/analytics
  "vite": "^5.0.0",                // Build tool
  "eslint": "^8.53.0"              // Code linting
}
```

---

## 🔐 AUTHENTICATION SYSTEM

### Flow
1. User registers with **gec.ac.in email** and password
2. Backend validates email domain, hashes password with bcryptjs
3. User logs in with credentials
4. Backend verifies password, generates JWT token
5. Frontend stores token in localStorage
6. Token sent in Authorization header for protected routes
7. Backend middleware verifies token signature and expiration

### Roles

| Role | Permissions |
|------|-------------|
| **student** | View events, register for events, view certificates |
| **club_admin** | Create/manage club events, view attendance |
| **super_admin** | Full system access, user management |

---

## 💾 DATABASE SCHEMA

### Users Table
```sql
user_id (PK), name, email (UNIQUE), password (hashed), role, created_at, updated_at
```

### Clubs Table
```sql
club_id (PK), name, description, admin_id (FK), created_at, updated_at
```

### Events Table
```sql
event_id (PK), title, description, club_id (FK), start_date, end_date, 
location, poster_url, status, created_at, updated_at
```

### Registrations Table
```sql
registration_id (PK), event_id (FK), user_id (FK), registered_at
UNIQUE(event_id, user_id) - prevents duplicate registrations
```

### Attendance Table
```sql
attendance_id (PK), event_id (FK), user_id (FK), marked_at
UNIQUE(event_id, user_id) - tracks who attended
```

---

## 🚀 DEPLOYMENT CONFIGURATION

### Frontend (Netlify or Vercel)
- Build command: `cd frontend && npm install && npm run build`
- Output directory: `frontend/dist`
- Environment variables:
  - `VITE_API_BASE_URL` = Backend API URL
  - `VITE_ALLOWED_EMAIL_DOMAIN` = gec.ac.in

### Backend (Render)
- Uses PostgreSQL database
- Environment variables:
  - `DATABASE_URL` - PostgreSQL connection string
  - `JWT_SECRET` - Token signing key
  - `ALLOWED_EMAIL_DOMAIN` - Email domain (gec.ac.in)
  - `NODE_ENV` - production/development
- Auto-runs migrations on deployment

### Database Fallback Strategy
1. **Primary**: PostgreSQL (Render)
2. **Secondary**: MySQL (with valid config)
3. **Fallback**: In-Memory Store (testing/demo)

---

## 🔄 API ENDPOINTS SUMMARY

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile
- `POST /api/auth/logout` - Logout

### Events
- `GET /api/events` - List events
- `GET /api/events/:id` - Event details
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/register` - Register
- `DELETE /api/events/register/:id` - Unregister
- `GET /api/events/my/registrations` - User's registrations

### Dashboard
- `GET /api/dashboard/*` - Analytics & stats

### Health
- `GET /api/health` - Server status & DB connection

---

## 📦 Key Dependencies

**Backend:**
- Express (web framework)
- PostgreSQL/MySQL (database)
- JWT (authentication)
- PDFKit (certificate generation)

**Frontend:**
- React (UI)
- MUI (component library)
- Recharts (data visualization)
- Axios (API client)
- React Router (navigation)

---

## 🎯 Current Functionality

✅ User registration & login (email validation)
✅ Role-based access control (student, club admin, super admin)
✅ Event creation and management
✅ Event registration and unregistration
✅ Attendance tracking
✅ Certificate generation (PDF)
✅ Dashboard with analytics
✅ JWT-based authentication
✅ Database with fallback to in-memory store
✅ Multi-database support (PostgreSQL, MySQL)
✅ Production deployment ready (Render, Netlify, Vercel)

---

## 📝 Notes

1. **Empty Documentation**: START_HERE.md, RUN_LOCALLY.md, SETUP_LOCAL.md are empty - need to be populated
2. **Database Priority**: PostgreSQL is preferred; fallback chain ensures app works even without database
3. **Email Restriction**: Only gec.ac.in email addresses can register
4. **JWT Secret**: Should be changed in production (currently has default)
5. **CORS Configuration**: Allows localhost dev, Netlify, and Render production domains
6. **PDF Certificates**: Generated with professional formatting and unique IDs

