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
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        📅 Upcoming Events
      </Typography>

      {events.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
          No events available right now. Check back soon!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.event_id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}
                onClick={() => navigate(`/events/${event.event_id}`)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={event.poster_url}
                  alt={event.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {event.title}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {event.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={event.club_name} 
                      size="small" 
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={`${event.registered_count}/${event.capacity}`}
                      size="small"
                      color={event.registered_count >= event.capacity ? 'error' : 'default'}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    📍 {event.location}
                  </Typography>

                  <Typography variant="body2">
                    📅 {new Date(event.start_date).toLocaleDateString()}
                  </Typography>
                </CardContent>

                <Box sx={{ p: 2 }}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/events/${event.event_id}`);
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default EventsList;
