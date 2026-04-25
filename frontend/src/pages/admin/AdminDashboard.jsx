import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import {
  Event,
  PendingActions,
  Groups,
  HowToReg,
  WorkspacePremium,
} from '@mui/icons-material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const defaultStats = [
  { key: 'totalEvents', label: 'Total Events', value: 0, color: '#2563EB', icon: <Event /> },
  { key: 'pendingApprovals', label: 'Pending Approvals', value: 0, color: '#F59E0B', icon: <PendingActions /> },
  { key: 'totalUsers', label: 'Total Users', value: 1, color: '#14B8A6', icon: <Groups /> },
  { key: 'totalRegistrations', label: 'Total Registrations', value: 0, color: '#8B5CF6', icon: <HowToReg /> },
  { key: 'totalCertificates', label: 'Total Certificates', value: 0, color: '#10B981', icon: <WorkspacePremium /> },
];

const defaultEventsByClub = [
  { name: 'Tech', count: 22 },
  { name: 'Robotics', count: 14 },
  { name: 'Design', count: 17 },
  { name: 'Cultural', count: 11 },
  { name: 'Sports', count: 14 },
];

const defaultUserStats = [
  { name: 'Students', value: 1 },
  { name: 'Club Admins', value: 0 },
  { name: 'Admins', value: 1 },
];

const pieColors = ['#0B5ED7', '#14B8A6', '#F59E0B'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(defaultStats);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [eventsByClub, setEventsByClub] = useState(defaultEventsByClub);
  const [userStats, setUserStats] = useState(defaultUserStats);
  const [loading, setLoading] = useState({
    stats: true,
    pending: true,
    charts: true,
    recent: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      const [statsRes, pendingRes, recentRes, chartsRes] = await Promise.allSettled([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/events/pending'),
        api.get('/admin/events/recent'),
        api.get('/admin/dashboard/charts'),
      ]);

      if (!mounted) return;

      const failedCalls = [];

      if (statsRes.status === 'fulfilled') {
        const payload = statsRes.value?.data?.data || statsRes.value?.data || {};
        setStats((prev) => prev.map((item) => ({
          ...item,
          value: payload[item.key] ?? item.value,
        })));
      } else {
        failedCalls.push('stats');
      }
      setLoading((prev) => ({ ...prev, stats: false }));

      if (pendingRes.status === 'fulfilled') {
        const payload = pendingRes.value?.data?.data || pendingRes.value?.data;
        setPendingEvents(Array.isArray(payload) ? payload : []);
      } else {
        failedCalls.push('pending events');
      }
      setLoading((prev) => ({ ...prev, pending: false }));

      if (recentRes.status === 'fulfilled') {
        const payload = recentRes.value?.data?.data || recentRes.value?.data;
        setRecentEvents(Array.isArray(payload) ? payload : []);
      } else {
        failedCalls.push('recent events');
      }
      setLoading((prev) => ({ ...prev, recent: false }));

      if (chartsRes.status === 'fulfilled') {
        const payload = chartsRes.value?.data?.data || chartsRes.value?.data || {};
        if (Array.isArray(payload.eventsByClub) && payload.eventsByClub.length > 0) {
          setEventsByClub(payload.eventsByClub);
        }
        if (Array.isArray(payload.userStats) && payload.userStats.length > 0) {
          setUserStats(payload.userStats);
        }
      } else {
        failedCalls.push('charts');
      }
      setLoading((prev) => ({ ...prev, charts: false }));

      if (failedCalls.length > 0) {
        setError(`Some dashboard data couldn't be loaded (${failedCalls.join(', ')}). Showing fallback data.`);
      }
    };

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const adminName = useMemo(() => user?.name || 'Admin', [user?.name]);

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.2, md: 3 },
          borderRadius: 3,
          background: 'linear-gradient(135deg,#0B5ED7 0%,#14B8A6 100%)',
          color: 'white',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h5" fontWeight={800}>Welcome, {adminName} 👋</Typography>
        <Typography sx={{ opacity: 0.95, mt: 0.6 }}>
          Manage platform activity, review events, and monitor system statistics in one place.
        </Typography>
      </Paper>

      {error && <Alert severity="warning">{error}</Alert>}

      <Grid container spacing={2}>
        {stats.map((s) => (
          <Grid key={s.label} item xs={12} sm={6} md={4} lg={2.4}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography color="text.secondary">{s.label}</Typography>
                  <Box sx={{ color: s.color }}>{s.icon}</Box>
                </Stack>
                {loading.stats ? (
                  <Skeleton variant="rounded" height={40} width="60%" />
                ) : (
                  <Typography variant="h4" fontWeight={800} sx={{ color: s.color }}>
                    {s.value}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={1.5}>Pending Events</Typography>
              <Divider sx={{ mb: 1.5 }} />
              {loading.pending ? (
                <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 180 }}>
                  <CircularProgress size={28} />
                  <Typography variant="body2" color="text.secondary" mt={1}>Loading pending events...</Typography>
                </Stack>
              ) : pendingEvents.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                  <Typography color="text.secondary">No pending events right now.</Typography>
                </Paper>
              ) : (
                <List disablePadding>
                  {pendingEvents.map((item, idx) => (
                    <ListItem
                      key={item.id || `${item.title}-${idx}`}
                      sx={{ px: 0, py: 1.2, borderBottom: idx !== pendingEvents.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}
                    >
                      <ListItemText
                        primary={item.title || item.eventName || 'Untitled Event'}
                        secondary={`${item.clubName || item.club || 'Unknown Club'} • ${item.submittedBy || item.createdBy || 'Unknown User'}`}
                      />
                      <Chip size="small" color="warning" label="Pending" />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>User Statistics</Typography>
              {loading.charts ? (
                <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 250 }}>
                  <CircularProgress size={28} />
                </Stack>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={userStats} dataKey="value" nameKey="name" outerRadius={90} label>
                      {userStats.map((entry, index) => (
                        <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight={700}>Events by Club</Typography>
                <Chip label="Sample + Live" color="primary" variant="outlined" />
              </Stack>
              {loading.charts ? (
                <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 320 }}>
                  <CircularProgress size={28} />
                </Stack>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={eventsByClub}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0B5ED7" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={1.5}>Recent Events</Typography>
              <Divider sx={{ mb: 1.5 }} />
              {loading.recent ? (
                <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 220 }}>
                  <CircularProgress size={28} />
                  <Typography variant="body2" color="text.secondary" mt={1}>Loading recent events...</Typography>
                </Stack>
              ) : recentEvents.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                  <Typography color="text.secondary">No recent events to display.</Typography>
                </Paper>
              ) : (
                <List disablePadding>
                  {recentEvents.map((event, idx) => (
                    <ListItem
                      key={event.id || `${event.title}-${idx}`}
                      sx={{ px: 0, py: 1.2, borderBottom: idx !== recentEvents.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}
                    >
                      <ListItemText
                        primary={event.title || event.eventName || 'Untitled Event'}
                        secondary={`${event.clubName || event.club || 'Unknown Club'} • ${event.date || event.createdAt || 'No date'}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Tip: This dashboard always renders with fallback values so admins can use the interface immediately, even when APIs are slow or unavailable.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default AdminDashboard;
