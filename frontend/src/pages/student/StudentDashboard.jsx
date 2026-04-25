import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  CalendarMonth,
  EventAvailable,
  FileDownload,
  HowToReg,
  OpenInNew,
} from '@mui/icons-material';

const stats = [
  { label: 'Upcoming Events', value: 8, icon: <CalendarMonth />, color: 'primary.main' },
  { label: 'My Registrations', value: 14, icon: <HowToReg />, color: 'secondary.main' },
  { label: 'Certificates', value: 6, icon: <FileDownload />, color: 'success.main' },
];

const upcomingEvents = [
  { id: 1, title: 'AI Bootcamp', date: '2026-07-15', club: 'Tech Club' },
  { id: 2, title: 'Hack the Campus', date: '2026-07-18', club: 'Coding Society' },
  { id: 3, title: 'Design Sprint', date: '2026-07-21', club: 'Design Club' },
  { id: 4, title: 'Robotics Expo', date: '2026-07-25', club: 'Robotics Club' },
  { id: 5, title: 'Startup Talk', date: '2026-07-29', club: 'Entrepreneurship Cell' },
];

const registrations = [
  { event: 'Web3 Workshop', status: 'Confirmed', date: '2026-06-20' },
  { event: 'Cloud Essentials', status: 'Waitlisted', date: '2026-06-17' },
  { event: 'Career Fair', status: 'Confirmed', date: '2026-06-12' },
  { event: 'Python Masterclass', status: 'Completed', date: '2026-06-01' },
];

const StudentDashboard = () => {
  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          p: { xs: 2.2, md: 3 },
          background: 'linear-gradient(135deg,#0B5ED7 0%,#14B8A6 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h5" fontWeight={800} gutterBottom>
          Welcome back 👋
        </Typography>
        <Typography sx={{ opacity: 0.9 }}>
          Track your registrations, discover upcoming events, and download certificates in one place.
        </Typography>
      </Paper>

      <Grid container spacing={2}>
        {stats.map((item) => (
          <Grid key={item.label} item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary">{item.label}</Typography>
                    <Typography variant="h4" fontWeight={800}>{item.value}</Typography>
                  </Box>
                  <Box sx={{ color: item.color }}>{item.icon}</Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Upcoming Events</Typography>
              <Stack spacing={1.2}>
                {upcomingEvents.map((event) => (
                  <Paper key={event.id} variant="outlined" sx={{ p: 1.4, borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography fontWeight={600}>{event.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{event.club}</Typography>
                      </Box>
                      <Chip icon={<EventAvailable />} label={event.date} color="primary" variant="outlined" />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Quick Actions</Typography>
              <Stack spacing={1.2}>
                <Button variant="contained" startIcon={<CalendarMonth />} href="/events">Explore Events</Button>
                <Button variant="outlined" startIcon={<FileDownload />}>Download Certificates</Button>
                <Button variant="outlined" startIcon={<OpenInNew />}>View My Profile</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>Recent Registrations</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registrations.map((row) => (
                  <TableRow key={row.event} hover>
                    <TableCell>{row.event}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.status}
                        color={row.status === 'Confirmed' ? 'success' : row.status === 'Completed' ? 'info' : 'warning'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default StudentDashboard;
