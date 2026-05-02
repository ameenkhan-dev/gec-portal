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
  useTheme,
  alpha,
  Paper,
  Divider,
  Container
} from '@mui/material';
import { 
  Email, 
  Lock, 
  Visibility, 
  VisibilityOff, 
  Login as LoginIcon,
  ArrowBack,
  EmojiEvents
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -50,
          right: -50,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: alpha(theme.palette.primary.main, 0.1),
          animation: 'float 20s ease-in-out infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: alpha(theme.palette.secondary.main, 0.1),
          animation: 'float 25s ease-in-out infinite reverse',
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(40px)' },
        }
      }}
    >
      {/* Animated gradient background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(-45deg, 
            ${alpha(theme.palette.primary.main, 0.1)}, 
            ${alpha(theme.palette.secondary.main, 0.1)}, 
            ${alpha(theme.palette.info.main, 0.1)}, 
            ${alpha(theme.palette.success.main, 0.1)})`,
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
          '@keyframes gradientShift': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
          zIndex: -1,
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Back Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            sx={{
              color: theme.palette.text.primary,
              textTransform: 'none',
              fontSize: '1rem',
              transition: 'all 0.3s',
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.1),
              }
            }}
          >
            Back to Home
          </Button>
        </Box>

        <Paper
          elevation={0}
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
            backdropFilter: 'blur(20px) saturate(180%)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: '24px',
            p: 4,
            boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.2)}`,
            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            '&:hover': {
              boxShadow: `0 30px 80px ${alpha(theme.palette.primary.main, 0.25)}`,
            }
          }}
        >
          {/* Logo/Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                mb: 2,
                color: 'white',
                animation: 'bounce 2s ease-in-out infinite',
                '@keyframes bounce': {
                  '0%, 100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(-12px)' },
                },
              }}
            >
              <EmojiEvents sx={{ fontSize: 32 }} />
            </Box>

            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 900,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                letterSpacing: '-1px'
              }}
            >
              Welcome Back
            </Typography>
            <Typography color="textSecondary" sx={{ fontWeight: 300 }}>
              Sign in to access the GEC Event Portal
            </Typography>
          </Box>

          <Divider sx={{ my: 3, opacity: 0.5 }} />

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: '12px',
                background: alpha(theme.palette.error.main, 0.1),
                border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              {/* Email Field */}
              <Box>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  error={Boolean(fieldErrors.email)}
                  helperText={fieldErrors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      background: alpha(theme.palette.background.paper, 0.5),
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        background: alpha(theme.palette.background.paper, 0.7),
                      },
                      '&.Mui-focused': {
                        background: alpha(theme.palette.background.paper, 0.8),
                        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                    },
                  }}
                />
              </Box>

              {/* Password Field */}
              <Box>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  error={Boolean(fieldErrors.password)}
                  helperText={fieldErrors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                          sx={{
                            color: theme.palette.text.secondary,
                            transition: 'all 0.3s',
                            '&:hover': {
                              color: theme.palette.primary.main,
                            }
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      background: alpha(theme.palette.background.paper, 0.5),
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        background: alpha(theme.palette.background.paper, 0.7),
                      },
                      '&.Mui-focused': {
                        background: alpha(theme.palette.background.paper, 0.8),
                        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                    },
                  }}
                />
              </Box>

              {/* Remember & Forgot Password */}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.remember}
                      onChange={(e) => setForm((p) => ({ ...p, remember: e.target.checked }))}
                    />
                  }
                  label="Remember me"
                  sx={{
                    '& .MuiCheckbox-root': {
                      transition: 'all 0.3s',
                      '&:hover': {
                        color: theme.palette.primary.main,
                      }
                    }
                  }}
                />
                <MuiLink 
                  component={Link} 
                  to="#" 
                  underline="hover" 
                  variant="body2"
                  sx={{
                    transition: 'all 0.3s',
                    '&:hover': {
                      color: theme.palette.primary.main,
                    }
                  }}
                >
                  Forgot password?
                </MuiLink>
              </Stack>

              {/* Sign In Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting || loading}
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <LoginIcon />}
                sx={{
                  py: 1.5,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '&:hover:not(:disabled)': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 12px 36px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                  '&:active:not(:disabled)': {
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3, opacity: 0.5 }} />

          {/* Register Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography color="textSecondary" sx={{ mb: 1 }}>
              New to GEC Portal?
            </Typography>
            <MuiLink 
              component={Link} 
              to="/register" 
              underline="none"
              sx={{
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                transition: 'all 0.3s',
                '&:hover': {
                  textDecoration: 'underline',
                  color: theme.palette.secondary.main,
                }
              }}
            >
              Create a new account
            </MuiLink>
          </Box>

          {/* Test Credentials Info */}
          <Paper
            sx={{
              mt: 3,
              p: 2,
              background: alpha(theme.palette.info.main, 0.1),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="caption" color="info.main" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
              📧 Test Credentials:
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', fontSize: '0.75rem', opacity: 0.8 }}>
              student@gec.ac.in / Student123
            </Typography>
          </Paper>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
