import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  Chip, 
  Grid, 
  Stack, 
  Typography,
  useTheme,
  alpha,
  Alert,
  CircularProgress,
  Container,
  Divider,
  Paper
} from '@mui/material';
import { 
  AccessTime, 
  CalendarMonth, 
  Group, 
  Place,
  Person,
  Email,
  CheckCircle,
  Event,
  LocationCity,
  School
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data.data);
      
      // Check if user is registered
      if (user) {
        const regResponse = await api.get(`/events/${eventId}/registrations`);
        const userReg = regResponse.data.data?.find(r => r.user_id === user.id);
        setIsRegistered(!!userReg);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setMessage({ type: 'error', text: 'Failed to load event details' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      await api.post(`/events/${eventId}/register`);
      setIsRegistered(true);
      setMessage({ type: 'success', text: '✅ Successfully registered for this event!' });
      setTimeout(() => navigate('/my-registrations'), 2000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to register. Please try again.' 
      });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!event) {
    return (
      <Container>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="error">Event not found</Typography>
        </Box>
      </Container>
    );
  }

  const canRegister = user?.role === 'student' && !isRegistered && event.registered_count < event.capacity;

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
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {message && (
              <Alert 
                severity={message.type} 
                sx={{ mb: 3, borderRadius: '12px' }}
                onClose={() => setMessage(null)}
              >
                {message.text}
              </Alert>
            )}

            {/* Event Image */}
            <Card 
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                mb: 3,
                transition: 'all 0.3s ease-in-out',
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Box sx={{ position: 'relative', height: 400, overflow: 'hidden' }}>
                <CardMedia 
                  component="img" 
                  image={event.poster_url} 
                  alt={event.title}
                  sx={{ 
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease-in-out',
                    '&:hover': { transform: 'scale(1.05)' }
                  }} 
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(to top, ${alpha(theme.palette.common.black, 0.5)} 0%, transparent 100%)`,
                  }}
                />
              </Box>

              <CardContent sx={{ p: 4 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 900,
                    mb: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {event.title}
                </Typography>

                <Typography 
                  variant="h6" 
                  color="textSecondary" 
                  sx={{ mb: 3, fontWeight: 300, lineHeight: 1.8 }}
                >
                  {event.description}
                </Typography>

                <Divider sx={{ my: 3 }} />

                {/* Event Info Grid */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      sx={{
                        p: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        borderRadius: '12px',
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center'
                      }}
                    >
                      <CalendarMonth sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary">Date & Time</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {new Date(event.start_date).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper
                      sx={{
                        p: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                        borderRadius: '12px',
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center'
                      }}
                    >
                      <Place sx={{ color: theme.palette.secondary.main, fontSize: 32 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary">Location</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {event.location}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper
                      sx={{
                        p: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                        borderRadius: '12px',
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center'
                      }}
                    >
                      <Group sx={{ color: theme.palette.success.main, fontSize: 32 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary">Participants</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {event.registered_count}/{event.capacity} registered
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper
                      sx={{
                        p: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        borderRadius: '12px',
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center'
                      }}
                    >
                      <School sx={{ color: theme.palette.info.main, fontSize: 32 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary">Organized by</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {event.club_name}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3} sx={{ position: 'sticky', top: 20 }}>
              {/* Status Card */}
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${event.registered_count >= event.capacity ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.success.main, 0.1)} 0%, ${event.registered_count >= event.capacity ? alpha(theme.palette.error.main, 0.05) : alpha(theme.palette.success.main, 0.05)} 100%)`,
                  border: `1px solid ${event.registered_count >= event.capacity ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.success.main, 0.2)}`,
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ mb: 2, fontSize: 48 }}>
                    {event.registered_count >= event.capacity ? '🔴' : '🟢'}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {event.registered_count >= event.capacity ? 'Event Full' : 'Spots Available'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {event.capacity - event.registered_count} spot{event.capacity - event.registered_count !== 1 ? 's' : ''} remaining
                  </Typography>
                </CardContent>
              </Card>

              {/* Registration Card */}
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {isRegistered ? '✅ You\'re Registered' : 'Register Now'}
                  </Typography>

                  {isRegistered ? (
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle sx={{ color: theme.palette.success.main }} />
                        <Typography variant="body2" color="success.main">
                          Registration confirmed
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => navigate('/my-registrations')}
                        sx={{
                          borderColor: theme.palette.primary.main,
                          color: theme.palette.primary.main,
                          fontWeight: 'bold',
                          transition: 'all 0.3s',
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.1),
                            transform: 'translateY(-2px)',
                          }
                        }}
                      >
                        View My Registrations
                      </Button>
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      {user?.role !== 'student' && (
                        <Alert severity="info" sx={{ borderRadius: '8px' }}>
                          Only students can register for events.
                        </Alert>
                      )}
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={!canRegister || registering}
                        onClick={handleRegister}
                        sx={{
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          fontWeight: 'bold',
                          py: 1.5,
                          transition: 'all 0.3s ease-in-out',
                          '&:hover:not(:disabled)': {
                            transform: 'translateY(-3px)',
                            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                          },
                          '&:disabled': {
                            opacity: 0.6,
                          }
                        }}
                      >
                        {registering ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          'Register for Event'
                        )}
                      </Button>
                      {event.registered_count >= event.capacity && (
                        <Typography variant="body2" color="error" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                          This event is full
                        </Typography>
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>

              {/* User Info */}
              {user && (
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      👤 Your Info
                    </Typography>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person sx={{ color: theme.palette.info.main, fontSize: 20 }} />
                        <Typography variant="body2">{user.name}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email sx={{ color: theme.palette.info.main, fontSize: 20 }} />
                        <Typography variant="body2">{user.email}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default EventDetails;
