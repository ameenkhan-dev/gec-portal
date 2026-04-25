# GEC Event Portal - Frontend

React-based frontend for the GEC Event Portal with role-based authentication and Material-UI.

## Quick Start

### Option 1: Using Node.js (Recommended)
```bash
cd frontend
node create-structure.js
npm install
npm run dev
```

### Option 2: Using PowerShell
```powershell
cd frontend
.\setup-dirs.ps1
npm install
npm run dev
```

## Features

- 🔐 **Role-based Authentication** - Student, Club, Admin roles
- 📱 **Responsive Design** - Material-UI components
- 🛣️ **React Router** - Client-side routing with protected routes
- 📡 **API Integration** - Axios with interceptors (proxy to port 5000)
- 🎨 **Theming** - Customizable Material-UI theme

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   └── layout/          # Layout components (MainLayout, AuthLayout)
│   ├── pages/
│   │   ├── auth/            # Login, Register
│   │   ├── student/         # Student Dashboard
│   │   ├── club/            # Club Dashboard
│   │   ├── admin/           # Admin Dashboard
│   │   └── events/          # Events list and details
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication state management
│   ├── utils/
│   │   ├── api.js           # Axios instance with interceptors
│   │   └── theme.js         # Material-UI theme configuration
│   ├── assets/              # Static assets (images, etc.)
│   ├── App.jsx              # Main app with routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/
├── package.json
├── vite.config.js           # Vite config with API proxy
└── index.html
```

## User Roles

| Role | Access |
|------|--------|
| **Student** | View events, register for events, view registrations |
| **Club** | All student access + Create/manage events |
| **Admin** | Full access + User management, approvals |

## API Proxy

The frontend proxies API calls to the backend:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- API calls to `/api/*` are proxied to the backend

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Dependencies

- React 18
- React Router DOM 6
- Material-UI 5
- Axios
- Vite 5
