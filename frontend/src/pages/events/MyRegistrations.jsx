import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Typography, 
  Button,
  Box,
  CircularProgress,
  useTheme,
  alpha,
  Stack,
  Paper,
  Chip
} from '@mui/material';
import { 
  useNavigate 
} from 'react-router-dom';
import { 
  CheckCircle,
  ArrowForward,
  CalendarMonth,
  LocationOn,
  EventNote
} from '@mui/icons-material';
import api from '../../utils/api';

const MyRegistrations = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events/my/registrations');
      setEvents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Loading your registrations...
        </Typography>
      </Box>
    );
  }

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
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 900,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            🎫 My Registrations
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 300 }}>
            All the events you've registered for
          </Typography>
        </Box>

        {events.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
              border: `2px dashed ${alpha(theme.palette.info.main, 0.3)}`,
              borderRadius: '16px',
              py: 8,
              textAlign: 'center',
              transition: 'all 0.3s ease-in-out'
            }}
          >
            <EventNote sx={{ fontSize: 64, color: theme.palette.info.main, mb: 2, opacity: 0.3 }} />
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
              No Registrations Yet
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              You haven't registered for any events. Explore upcoming events and join the community!
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/events')}
              endIcon={<ArrowForward />}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                fontWeight: 'bold',
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                }
              }}
            >
              Explore Events
            </Button>
          </Paper>
        ) : (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                You're registered for {events.length} event{events.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {events.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.event_id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      '&:hover': {
                        transform: 'translateY(-12px)',
                        boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      }
                    }}
                    onClick={() => navigate(`/events/${event.event_id}`)}
                  >
                    {/* Image */}
                    <Box
                      sx={{
                        position: 'relative',
                        height: 180,
                        overflow: 'hidden',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={event.poster_url}
                        alt={event.title}
                        sx={{
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease-in-out',
                          '&:hover': { transform: 'scale(1.08)' }
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `linear-gradient(to top, ${alpha(theme.palette.common.black, 0.3)} 0%, transparent 100%)`,
                        }}
                      />
                      {/* Registered Badge */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${alpha(theme.palette.success.main, 0.7)} 100%)`,
                          color: 'white',
                          px: 2,
                          py: 0.75,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          fontWeight: 'bold',
                          fontSize: '0.85rem',
                          backdropFilter: 'blur(5px)',
                          border: `1px solid ${alpha('white', 0.2)}`,
                        }}
                      >
                        <CheckCircle sx={{ fontSize: 16 }} />
                        Registered
                      </Box>
                    </Box>

                    {/* Content */}
                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{
                          fontWeight: 'bold',
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {event.title}
                      </Typography>

                      <Typography 
                        variant="body2" 
                        color="textSecondary" 
                        sx={{
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: '2.8em'
                        }}
                      >
                        {event.description}
                      </Typography>

                      {/* Meta Info */}
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarMonth sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.9rem' }}>
                            {new Date(event.start_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 16, color: theme.palette.secondary.main }} />
                          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {event.location}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Registered Date Badge */}
                      <Chip
                        size="small"
                        label={`Registered ${new Date(event.registered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        icon={<CheckCircle />}
                        sx={{
                          background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.2)} 0%, ${alpha(theme.palette.success.main, 0.1)} 100%)`,
                          color: theme.palette.success.main,
                          fontWeight: 'bold',
                          border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`
                        }}
                      />
                    </CardContent>

                    {/* Button */}
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button 
                        variant="contained" 
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/events/${event.event_id}`);
                        }}
                        sx={{
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          fontWeight: 'bold',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                          }
                        }}
                      >
                        View Event
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default MyRegistrations;
