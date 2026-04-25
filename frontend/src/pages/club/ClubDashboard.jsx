import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Edit, Groups, HourglassBottom, OpenInNew, Visibility } from '@mui/icons-material';

const stats = [
  { label: 'My Events', value: 12, color: 'primary.main' },
  { label: 'Total Registrations', value: 426, color: 'secondary.main' },
  { label: 'Pending Approvals', value: 9, color: 'warning.main' },
];

const myEvents = [
  { id: 'E101', name: 'Hack the Campus', date: '2026-07-18', status: 'Published' },
  { id: 'E102', name: 'ML Basics Workshop', date: '2026-07-21', status: 'Draft' },
  { id: 'E103', name: 'Open Source Sprint', date: '2026-07-28', status: 'Published' },
];

const recentRegs = [
  { name: 'Ananya R', event: 'Hack the Campus', date: '2026-06-20', status: 'Approved' },
  { name: 'Vikram S', event: 'Hack the Campus', date: '2026-06-20', status: 'Pending' },
  { name: 'Aditi K', event: 'ML Basics Workshop', date: '2026-06-19', status: 'Approved' },
];

const ClubDashboard = () => {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={800}>Club Admin Dashboard</Typography>
        <Typography color="text.secondary">Manage your events and registrations with ease.</Typography>
      </Box>

      <Grid container spacing={2}>
        {stats.map((s) => (
          <Grid key={s.label} item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary">{s.label}</Typography>
                <Typography variant="h4" fontWeight={800} color={s.color}>{s.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight={700}>My Events</Typography>
                <Button variant="contained" startIcon={<OpenInNew />}>Create Event</Button>
              </Stack>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myEvents.map((e) => (
                      <TableRow key={e.id} hover>
                        <TableCell>{e.name}</TableCell>
                        <TableCell>{e.date}</TableCell>
                        <TableCell><Chip size="small" label={e.status} color={e.status === 'Published' ? 'success' : 'warning'} /></TableCell>
                        <TableCell align="right">
                          <IconButton size="small"><Visibility fontSize="small" /></IconButton>
                          <IconButton size="small"><Edit fontSize="small" /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Recent Registrations</Typography>
              <Stack spacing={1.3}>
                {recentRegs.map((r) => (
                  <Card key={`${r.name}-${r.event}`} variant="outlined" sx={{ p: 1.2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography fontWeight={600}>{r.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{r.event}</Typography>
                      </Box>
                      <Chip size="small" label={r.status} color={r.status === 'Approved' ? 'success' : 'warning'} />
                    </Stack>
                  </Card>
                ))}
                <Button startIcon={<Groups />} variant="outlined">View All Registrations</Button>
                <Button startIcon={<HourglassBottom />} variant="outlined" color="warning">Pending Requests</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ClubDashboard;
