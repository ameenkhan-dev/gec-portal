import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Typography,
  Box,
  CircularProgress,
  Chip,
  useTheme,
  alpha,
  Stack,
  InputBase,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, GroupOutlined, LocationOnOutlined, DateRangeOutlined } from '@mui/icons-material';
import api from '../../utils/api';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      setEvents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Loading events...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4, position: 'relative' }}>
      {/* Background gradient */}
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
        {/* Header Section */}
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
            🎉 Discover Events
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 300 }}>
            Find and register for amazing events happening at your college
          </Typography>
        </Box>

        {/* Search Bar */}
        <Paper
          sx={{
            mb: 6,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: '16px',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <SearchOutlined sx={{ color: 'textSecondary', ml: 1 }} />
          <InputBase
            placeholder="Search events by name or description..."
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              fontSize: '1rem',
              '& input': {
                py: 1,
              }
            }}
          />
        </Paper>

        {filteredEvents.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="textSecondary" sx={{ mb: 2 }}>
              {searchTerm ? 'No events found matching your search' : 'No events available right now'}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Check back soon for more exciting events!
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            </Typography>
            
            <Grid container spacing={3}>
              {filteredEvents.map((event, index) => (
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
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      overflow: 'hidden',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.1)}, transparent)`,
                        transition: 'left 0.5s',
                      },
                      '&:hover': { 
                        transform: 'translateY(-12px)',
                        boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        '&::before': {
                          left: '100%',
                        }
                      }
                    }}
                    onClick={() => navigate(`/events/${event.event_id}`)}
                  >
                    {/* Image Container */}
                    <Box
                      sx={{
                        position: 'relative',
                        height: 220,
                        overflow: 'hidden',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={event.poster_url}
                        alt={event.title}
                        sx={{ 
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
                          background: `linear-gradient(to top, ${alpha(theme.palette.common.black, 0.4)} 0%, transparent 100%)`,
                        }}
                      />
                      {/* Status Badge */}
                      <Chip
                        label={event.registered_count >= event.capacity ? '🔴 Full' : '🟢 Open'}
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          background: event.registered_count >= event.capacity 
                            ? alpha(theme.palette.error.main, 0.9)
                            : alpha(theme.palette.success.main, 0.9),
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      />
                    </Box>

                    {/* Content */}
                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                      <Typography 
                        gutterBottom 
                        variant="h6" 
                        component="div"
                        sx={{
                          fontWeight: 'bold',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          mb: 1.5
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
                      <Stack spacing={1.5} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DateRangeOutlined sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                          <Typography variant="body2" color="textSecondary">
                            {new Date(event.start_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnOutlined sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
                          <Typography variant="body2" color="textSecondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {event.location}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GroupOutlined sx={{ fontSize: 18, color: theme.palette.info.main }} />
                          <Typography variant="body2" color="textSecondary">
                            {event.registered_count}/{event.capacity} registered
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Club Badge */}
                      <Chip 
                        label={event.club_name} 
                        size="small"
                        sx={{
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                          fontWeight: 'bold',
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
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
                        View Details
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

export default EventsList;
