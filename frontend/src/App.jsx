import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useMemo, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { AdminRoute, ClubAdminRoute, StudentRoute } from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/events/StudentDashboard';
import ClubDashboard from './pages/club/ClubDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import TestDashboard from './pages/admin/TestDashboard';
import EventsList from './pages/events/EventsList';
import EventDetails from './pages/events/EventDetails';
import MyRegistrations from './pages/events/MyRegistrations';
import { createAppTheme } from './theme';

const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'super_admin') {
    return <TestDashboard />;
  } else if (user.role === 'club_admin') {
    return <ClubDashboard />;
  } else {
    return <StudentDashboard />;
  }
};

const LayoutRoute = ({ children, mode, toggleTheme }) => (
  <MainLayout mode={mode} onToggleTheme={toggleTheme}>
    {children}
  </MainLayout>
);

function App() {
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
      return next;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/dashboard"
              element={
                <LayoutRoute mode={mode} toggleTheme={toggleTheme}>
                  <DashboardRouter />
                </LayoutRoute>
              }
            />

            <Route
              path="/club"
              element={
                <ClubAdminRoute>
                  <LayoutRoute mode={mode} toggleTheme={toggleTheme}>
                    <ClubDashboard />
                  </LayoutRoute>
                </ClubAdminRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <LayoutRoute mode={mode} toggleTheme={toggleTheme}>
                    <TestDashboard />
                  </LayoutRoute>
                </AdminRoute>
              }
            />

            <Route
              path="/events"
              element={
                <LayoutRoute mode={mode} toggleTheme={toggleTheme}>
                  <EventsList />
                </LayoutRoute>
              }
            />

            <Route
              path="/events/:id"
              element={
                <LayoutRoute mode={mode} toggleTheme={toggleTheme}>
                  <EventDetails />
                </LayoutRoute>
              }
            />

            <Route
              path="/my-registrations"
              element={
                <LayoutRoute mode={mode} toggleTheme={toggleTheme}>
                  <MyRegistrations />
                </LayoutRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
// Rebuild trigger
