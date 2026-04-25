import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, loading, error, clearError } = useAuth();

  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const getDashboardPath = (role) => {
    if (role === 'admin') return '/admin';
    if (role === 'club_admin') return '/club';
    return '/dashboard';
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(location.state?.from?.pathname || getDashboardPath(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  useEffect(() => clearError(), [clearError]);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const res = await login(form.email, form.password, form.remember);
    setSubmitting(false);
    if (res.success) {
      navigate(location.state?.from?.pathname || getDashboardPath(res.user.role), { replace: true });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(135deg,#e0ecff 0%,#f6f8fb 45%,#d8fff8 100%)'
            : 'linear-gradient(135deg,#0f172a 0%,#111827 45%,#042f2e 100%)',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 450, boxShadow: 12 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Sign In
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Access your GEC Event Portal account
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Email /></InputAdornment>,
                }}
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((v) => !v)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.remember}
                      onChange={(e) => setForm((p) => ({ ...p, remember: e.target.checked }))}
                    />
                  }
                  label="Remember me"
                />
                <MuiLink component={Link} to="#" underline="hover" variant="body2">
                  Forgot password?
                </MuiLink>
              </Stack>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting || loading}
                startIcon={submitting ? <CircularProgress size={18} /> : <LoginIcon />}
                sx={{ py: 1.2 }}
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </Stack>
          </form>

          <Typography textAlign="center" sx={{ mt: 3 }}>
            New here? <MuiLink component={Link} to="/register" underline="hover">Create account</MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
