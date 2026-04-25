import React from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
        upcomingEvents: eventsResponse.data.data?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Welcome, {user?.name}! 👋
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                My Registrations
              </Typography>
              <Typography variant="h5">{stats.registeredEvents}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Available Events
              </Typography>
              <Typography variant="h5">{stats.upcomingEvents}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Button 
            variant="contained" 
            fullWidth 
            size="large"
            onClick={() => navigate('/events')}
            sx={{ py: 2 }}
          >
            Browse All Events
          </Button>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Button 
            variant="outlined" 
            fullWidth 
            size="large"
            onClick={() => navigate('/my-registrations')}
            sx={{ py: 2 }}
          >
            My Registrations
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentDashboard;
