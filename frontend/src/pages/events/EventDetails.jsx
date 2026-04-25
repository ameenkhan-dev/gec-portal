import { Box, Button, Card, CardContent, CardMedia, Chip, Grid, Stack, Typography } from '@mui/material';
import { AccessTime, CalendarMonth, Group, Place } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const event = {
  id: 1,
  title: 'AI Bootcamp 2026',
  description:
    'An immersive hands-on bootcamp designed to help students build practical AI applications using modern tools, APIs, and deployment strategies.',
  date: '2026-07-15',
  time: '10:00 AM - 4:00 PM',
  venue: 'Seminar Hall A',
  club: 'Tech Club',
  spotsRemaining: 25,
  deadline: '2026-07-12',
  poster: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1400&auto=format&fit=crop',
};

const EventDetails = () => {
  const { user } = useAuth();
  const canRegister = user?.role === 'student';

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardMedia component="img" image={event.poster} height="340" alt={event.title} />
          <CardContent>
            <Typography variant="h4" fontWeight={800} gutterBottom>{event.title}</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>{event.description}</Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip icon={<CalendarMonth />} label={event.date} />
              <Chip icon={<AccessTime />} label={event.time} />
              <Chip icon={<Place />} label={event.venue} />
              <Chip icon={<Group />} label={`${event.spotsRemaining} spots remaining`} color={event.spotsRemaining < 20 ? 'warning' : 'success'} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Club Information</Typography>
              <Typography>{event.club}</Typography>
              <Typography variant="body2" color="text.secondary">Organizing this event for GEC students.</Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Registration Details</Typography>
              <Typography variant="body2" color="text.secondary">Deadline</Typography>
              <Typography fontWeight={600}>{event.deadline}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Available spots</Typography>
              <Typography fontWeight={700} color="success.main">{event.spotsRemaining}</Typography>

              <Box sx={{ mt: 2 }}>
                {canRegister ? (
                  <Button variant="contained" fullWidth size="large">Register Now</Button>
                ) : (
                  <Button variant="outlined" fullWidth size="large" disabled>
                    Only students can register
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default EventDetails;
