import { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
  Button,
} from '@mui/material';
import { CalendarMonth, Group } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const eventsSeed = [
  { id: 1, title: 'AI Bootcamp 2026', club: 'Tech Club', date: '2026-07-15', category: 'Technical', spots: 25, poster: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop' },
  { id: 2, title: 'Hack the Campus', club: 'Coding Society', date: '2026-07-18', category: 'Hackathon', spots: 12, poster: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop' },
  { id: 3, title: 'Design Sprint', club: 'Design Club', date: '2026-07-21', category: 'Design', spots: 31, poster: 'https://images.unsplash.com/photo-1456324463128-7ff6903988d8?q=80&w=1200&auto=format&fit=crop' },
  { id: 4, title: 'Robotics Expo', club: 'Robotics Club', date: '2026-07-25', category: 'Exhibition', spots: 18, poster: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1200&auto=format&fit=crop' },
  { id: 5, title: 'Startup Talk', club: 'Entrepreneurship Cell', date: '2026-07-29', category: 'Talk', spots: 43, poster: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop' },
  { id: 6, title: 'Cultural Night', club: 'Cultural Club', date: '2026-08-02', category: 'Cultural', spots: 70, poster: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1200&auto=format&fit=crop' },
];

const Events = () => {
  const [query, setQuery] = useState('');
  const [club, setClub] = useState('all');
  const [category, setCategory] = useState('all');
  const [date, setDate] = useState('');
  const [loading] = useState(false);

  const clubs = [...new Set(eventsSeed.map((e) => e.club))];
  const categories = [...new Set(eventsSeed.map((e) => e.category))];

  const filtered = useMemo(() => {
    return eventsSeed.filter((event) => {
      const q = query.toLowerCase();
      const matchesQuery = event.title.toLowerCase().includes(q) || event.club.toLowerCase().includes(q);
      const matchesClub = club === 'all' || event.club === club;
      const matchesCategory = category === 'all' || event.category === category;
      const matchesDate = !date || event.date === date;
      return matchesQuery && matchesClub && matchesCategory && matchesDate;
    });
  }, [query, club, category, date]);

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={800}>Discover Events</Typography>

      <Card sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth placeholder="Search events, clubs..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={4} md={2.5}>
            <FormControl fullWidth>
              <InputLabel>Club</InputLabel>
              <Select value={club} label="Club" onChange={(e) => setClub(e.target.value)}>
                <MenuItem value="all">All Clubs</MenuItem>
                {clubs.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2.5}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} />
          </Grid>
        </Grid>
      </Card>

      <Grid container spacing={2}>
        {(loading ? Array.from({ length: 6 }) : filtered).map((event, index) => (
          <Grid key={loading ? index : event.id} item xs={12} sm={6} md={4}>
            {loading ? (
              <Card>
                <Skeleton variant="rectangular" height={180} />
                <CardContent>
                  <Skeleton height={28} />
                  <Skeleton height={20} width="70%" />
                  <Skeleton height={20} width="50%" />
                </CardContent>
              </Card>
            ) : (
              <Card sx={{ overflow: 'hidden' }}>
                <CardMedia component="img" height="180" image={event.poster} alt={event.title} />
                <CardContent>
                  <Typography variant="h6" fontWeight={700}>{event.title}</Typography>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>{event.club}</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip size="small" icon={<CalendarMonth />} label={event.date} />
                    <Chip size="small" icon={<Group />} label={`${event.spots} spots left`} color={event.spots < 20 ? 'warning' : 'success'} />
                  </Stack>
                </CardContent>
                <CardActions>
                  <Button component={Link} to={`/events/${event.id}`} fullWidth variant="contained">View Details</Button>
                </CardActions>
              </Card>
            )}
          </Grid>
        ))}
      </Grid>

      {!loading && filtered.length === 0 && (
        <Box textAlign="center" py={6}>
          <Typography variant="h6">No events found</Typography>
          <Typography color="text.secondary">Try adjusting your search or filters.</Typography>
        </Box>
      )}
    </Stack>
  );
};

export default Events;
