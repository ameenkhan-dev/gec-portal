import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  LinearProgress,
  Link as MuiLink,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Badge, Email, Lock, Person, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const ALLOWED_DOMAIN = 'gec.ac.in';

const getPasswordStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score += 25;
  if (/[A-Z]/.test(pwd)) score += 25;
  if (/[0-9]/.test(pwd)) score += 25;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
  if (score <= 25) return { score, label: 'Weak', color: 'error' };
  if (score <= 50) return { score, label: 'Fair', color: 'warning' };
  if (score <= 75) return { score, label: 'Good', color: 'info' };
  return { score, label: 'Strong', color: 'success' };
};

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, user, error, clearError } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student', terms: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : user.role === 'club_admin' ? '/club' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => clearError(), [clearError]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!form.email.endsWith(`@${ALLOWED_DOMAIN}`)) e.email = `Use @${ALLOWED_DOMAIN} email`;
    if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (!form.terms) e.terms = 'You must accept terms and conditions';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const res = await register({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role: form.role,
    });
    setSubmitting(false);
    if (res.success) navigate(res.user.role === 'club_admin' ? '/club' : '/dashboard', { replace: true });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, background: 'linear-gradient(135deg,#f0f7ff,#f8fffd)' }}>
      <Card sx={{ width: '100%', maxWidth: 520, boxShadow: 12 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={800}>Create Account</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Join GEC Event Portal today</Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Full Name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                error={Boolean(errors.name)}
                helperText={errors.name}
                InputProps={{ startAdornment: <InputAdornment position="start"><Person /></InputAdornment> }}
              />
              <TextField
                label="Email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                error={Boolean(errors.email)}
                helperText={errors.email || `Only @${ALLOWED_DOMAIN} allowed`}
                InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }}
              />
              <TextField
                select
                label="Role"
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start"><Badge /></InputAdornment> }}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="club_admin">Club Admin</MenuItem>
              </TextField>
              <TextField
                label="Password"
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                error={Boolean(errors.password)}
                helperText={errors.password || 'Use uppercase, number, symbol for strong password'}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd((v) => !v)}>{showPwd ? <VisibilityOff /> : <Visibility />}</IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {Boolean(form.password) && (
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
                    <Typography variant="caption">Password strength</Typography>
                    <Typography variant="caption" color={`${strength.color}.main`}>{strength.label}</Typography>
                  </Stack>
                  <LinearProgress value={strength.score} color={strength.color} variant="determinate" sx={{ height: 7, borderRadius: 99 }} />
                </Box>
              )}
              <FormControlLabel
                control={<Checkbox checked={form.terms} onChange={(e) => setForm((p) => ({ ...p, terms: e.target.checked }))} />}
                label="I agree to Terms & Conditions"
              />
              {errors.terms && <Alert severity="warning">{errors.terms}</Alert>}
              <Button disabled={submitting} type="submit" variant="contained" size="large" sx={{ py: 1.2 }}>
                {submitting ? 'Creating account...' : 'Create Account'}
              </Button>
            </Stack>
          </form>

          <Typography textAlign="center" sx={{ mt: 3 }}>
            Already have an account? <MuiLink component={Link} to="/login">Login</MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
