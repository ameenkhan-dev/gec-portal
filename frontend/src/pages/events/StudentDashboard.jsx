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
  useTheme,
  Stack,
  Paper,
  LinearProgress
} from '@mui/material';
import { 
  useNavigate 
} from 'react-router-dom';
import { 
  useAuth 
} from '../../context/AuthContext';
import { 
  EventNote,
  CheckCircle,
  EmojiEvents,
  ArrowForward,
  Lightbulb,
  TrendingUp
} from '@mui/icons-material';
import api from '../../utils/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [stats, setStats] = React.useState({ registeredEvents: 0, upcomingEvents: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: IconComponent, label, value, color = 'primary', progress = 0 }) => (
    <Paper
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.15)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
        border: `2px solid ${alpha(theme.palette[color].main, 0.2)}`,
        borderRadius: '16px',
        p: 3,
        height: '100%',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: alpha(theme.palette[color].main, 0.1),
        },
        '&:hover': {
          transform: 'translateY(-12px)',
          boxShadow: `0 20px 40px ${alpha(theme.palette[color].main, 0.25)}`,
          border: `2px solid ${alpha(theme.palette[color].main, 0.4)}`,
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
          <Box sx={{
            background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${alpha(theme.palette[color].main, 0.7)} 100%)`,
            p: 1.5,
            borderRadius: '12px',
            display: 'flex',
            color: '#fff'
          }}>
            <IconComponent sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              {label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              {value}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ minHeight: '100vh', py: 4, position: 'relative' }}>
      {/* Background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          zIndex: -1,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Header */}
        <Box sx={{ mb: 6, animation: 'slideDown 0.6s ease-out' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ fontSize: 48 }}>👋</Box>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-1px'
                }}
              >
                Welcome back, {user?.name}!
              </Typography>
            </Box>
          </Box>
          <Typography 
            variant="h6" 
            color="textSecondary" 
            sx={{ fontWeight: 300 }}
          >
            Discover amazing events, register, and make unforgettable memories
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              IconComponent={EventNote}
              label="Events Registered" 
              value={stats.registeredEvents} 
              color="success" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              IconComponent={CheckCircle}
              label="Upcoming Events" 
              value={stats.upcomingEvents} 
              color="info" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              IconComponent={EmojiEvents}
              label="Certificates Earned" 
              value="0" 
              color="warning" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              IconComponent={TrendingUp}
              label="Participation Points" 
              value="0" 
              color="secondary" 
            />
          </Grid>
        </Grid>

        {/* CTA Section */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                borderRadius: '16px',
                p: 4,
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                overflow: 'hidden',
                position: 'relative',
                border: `1px solid ${alpha('white', 0.2)}`,
                backdropFilter: 'blur(10px)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: -100,
                  width: 300,
                  height: 300,
                  borderRadius: '50%',
                  background: alpha('white', 0.1),
                },
                '&:hover': { 
                  transform: 'translateY(-12px)',
                  boxShadow: `0 24px 48px ${alpha(theme.palette.primary.main, 0.4)}`
                }
              }}
              onClick={() => navigate('/events')}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ fontSize: 48, mb: 2 }}>🎯</Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Browse All Events
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 3, maxWidth: '300px' }}>
                  Explore hundreds of amazing college events and find the perfect ones to join
                </Typography>
                <Button
                  endIcon={<ArrowForward />}
                  sx={{
                    background: alpha('white', 0.2),
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    border: `1px solid ${alpha('white', 0.3)}`,
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s',
                    '&:hover': {
                      background: alpha('white', 0.3),
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  Explore Now
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                color: 'white',
                borderRadius: '16px',
                p: 4,
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                overflow: 'hidden',
                position: 'relative',
                border: `1px solid ${alpha('white', 0.2)}`,
                backdropFilter: 'blur(10px)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: -100,
                  width: 300,
                  height: 300,
                  borderRadius: '50%',
                  background: alpha('white', 0.1),
                },
                '&:hover': { 
                  transform: 'translateY(-12px)',
                  boxShadow: `0 24px 48px ${alpha(theme.palette.secondary.main, 0.4)}`
                }
              }}
              onClick={() => navigate('/my-registrations')}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ fontSize: 48, mb: 2 }}>🎫</Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  My Registrations
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 3, maxWidth: '300px' }}>
                  View all the events you've registered for and manage your attendance
                </Typography>
                <Button
                  endIcon={<ArrowForward />}
                  sx={{
                    background: alpha('white', 0.2),
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    border: `1px solid ${alpha('white', 0.3)}`,
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s',
                    '&:hover': {
                      background: alpha('white', 0.3),
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  View Registrations
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Getting Started Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lightbulb sx={{ color: theme.palette.warning.main }} />
            Getting Started
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {[
            { 
              step: 1, 
              title: 'Browse Events', 
              desc: 'Explore all upcoming events happening at your college',
              icon: '📚',
              color: 'primary'
            },
            { 
              step: 2, 
              title: 'Register Fast', 
              desc: 'Click register to instantly join events you\'re interested in',
              icon: '⚡',
              color: 'secondary'
            },
            { 
              step: 3, 
              title: 'Earn Certificates', 
              desc: 'Attend events and receive digital certificates for your participation',
              icon: '🏆',
              color: 'success'
            },
          ].map((item, idx) => (
            <Grid item xs={12} md={4} key={item.step}>
              <Paper
                elevation={0}
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette[item.color].main, 0.12)} 0%, ${alpha(theme.palette[item.color].main, 0.04)} 100%)`,
                  border: `2px solid ${alpha(theme.palette[item.color].main, 0.2)}`,
                  borderRadius: '16px',
                  p: 3,
                  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 16px 32px ${alpha(theme.palette[item.color].main, 0.2)}`,
                    borderColor: theme.palette[item.color].main,
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Chip 
                    label={`Step ${item.step}`}
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette[item.color].main} 0%, ${alpha(theme.palette[item.color].main, 0.7)} 100%)`,
                      color: 'white',
                      fontWeight: 'bold',
                      mb: 2,
                    }}
                  />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box sx={{ fontSize: 24 }}>{item.icon}</Box>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.6 }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default StudentDashboard;
