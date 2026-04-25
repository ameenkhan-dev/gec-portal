import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useMemo, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { AdminRoute, ClubAdminRoute, StudentRoute } from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import ClubDashboard from './pages/club/ClubDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import TestDashboard from './pages/admin/TestDashboard';
import Events from './pages/events/Events';
import EventDetails from './pages/events/EventDetails';
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
                <StudentRoute>
                  <LayoutRoute mode={mode} toggleTheme={toggleTheme}>
                    <Events />
                  </LayoutRoute>
                </StudentRoute>
              }
            />

            <Route
              path="/events/:id"
              element={
                <StudentRoute>
                  <LayoutRoute mode={mode} toggleTheme={toggleTheme}>
                    <EventDetails />
                  </LayoutRoute>
                </StudentRoute>
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
