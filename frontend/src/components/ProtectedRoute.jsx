import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role === 'super_admin' ? children : <Navigate to="/login" />;
};

export const ClubAdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role === 'club_admin' ? children : <Navigate to="/login" />;
};

export const StudentRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role === 'student' ? children : <Navigate to="/login" />;
};
