import React from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Chip,
  alpha,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [stats, setStats] = React.useState({ registeredEvents: 0, upcomingEvents: 0 });

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [regResponse, eventsResponse] = await Promise.all([
        api.get('/events/my/registrations'),
        api.get('/events')
      ]);
      setStats({
        registeredEvents: regResponse.data.data?.length || 0,
        upcomingEvents: eventsResponse.data.data?.length || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const StatCard = ({ icon, label, value, color = 'primary' }) => (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
        border: `2px solid ${alpha(theme.palette[color].main, 0.2)}`,
        height: '100%',
      }}
    >
      <CardContent sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ fontSize: '40px' }}>{icon}</Box>
          <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
              {label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: `${color}.main` }}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            mb: 1,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome back, {user?.name}! 👋
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Explore and register for amazing college events
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard icon="📝" label="Events Registered" value={stats.registeredEvents} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard icon="📅" label="Upcoming Events" value={stats.upcomingEvents} color="info" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard icon="🏆" label="Certificates" value="0" color="warning" />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Quick Actions
      </Typography>

      <Grid container spacing={2} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-5px)' },
              height: '100%',
            }}
            onClick={() => navigate('/events')}
          >
            <CardContent sx={{ py: 4, textAlign: 'center' }}>
              <Box sx={{ fontSize: '48px', mb: 2 }}>🎯</Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Browse All Events
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Discover and register for upcoming events
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: 'white',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-5px)' },
              height: '100%',
            }}
            onClick={() => navigate('/my-registrations')}
          >
            <CardContent sx={{ py: 4, textAlign: 'center' }}>
              <Box sx={{ fontSize: '48px', mb: 2 }}>🎫</Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                My Registrations
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                View your registered events
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Getting Started */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Getting Started
      </Typography>

      <Grid container spacing={2}>
        {[
          { step: 1, title: 'Browse Events', desc: 'Explore all upcoming events at your college' },
          { step: 2, title: 'Register', desc: 'Click register to join events you\'re interested in' },
          { step: 3, title: 'Attend', desc: 'Attend the event and earn certificates' },
        ].map((item) => (
          <Grid item xs={12} md={4} key={item.step}>
            <Card>
              <CardContent>
                <Chip 
                  label={`Step ${item.step}`} 
                  color="primary" 
                  sx={{ mb: 2, fontWeight: 'bold' }}
                />
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {item.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default StudentDashboard;
