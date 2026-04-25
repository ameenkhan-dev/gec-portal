import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const MyRegistrations = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        🎫 My Registrations
      </Typography>

      {events.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
          You haven't registered for any events yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.event_id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {event.title}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {event.description}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    📍 {event.location}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    📅 {new Date(event.start_date).toLocaleDateString()}
                  </Typography>

                  <Typography variant="caption" color="success">
                    ✅ Registered on {new Date(event.registered_at).toLocaleDateString()}
                  </Typography>
                </CardContent>

                <Box sx={{ p: 2 }}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => navigate(`/events/${event.event_id}`)}
                  >
                    View Event
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

export default MyRegistrations;
