/**
 * ClubDashboard.jsx
 * Comprehensive dashboard for club admins showing events, registrations, and pending approvals
 */

import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Box,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Stack
} from '@mui/material';
import {
    Event as EventIcon,
    Group as GroupIcon,
    Pending as PendingIcon,
    CalendarToday as CalendarIcon,
    LocationOn as LocationIcon,
    PersonAdd as PersonIcon,
    Edit as EditIcon,
    MoreVert as MoreIcon,
    ArrowForward as ArrowIcon,
    Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ClubDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({});

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');

            const response = await axios.get(
                `${API_BASE_URL}/dashboard/club-admin`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setDashboardData(response.data.data);
                setStats(response.data.data.stats);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to load dashboard data'
            );
            console.error('Error fetching dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'success';
            case 'pending':
                return 'warning';
            case 'rejected':
                return 'error';
            case 'completed':
                return 'info';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    const userName = dashboardData?.user?.name || 'Club Admin';

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Welcome, {userName}! 📋
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Manage your club events, registrations, and approvals
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* My Events Card */}
                <Grid item xs={12} sm={6} md={4}>
                    <Card
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            boxShadow: 3,
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                                        My Events
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {stats.myEventsCount || 0}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                                    <EventIcon sx={{ fontSize: 32 }} />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Total Registrations Card */}
                <Grid item xs={12} sm={6} md={4}>
                    <Card
                        sx={{
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white',
                            boxShadow: 3,
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                                        Total Registrations
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {stats.totalRegistrationsCount || 0}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                                    <GroupIcon sx={{ fontSize: 32 }} />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Pending Approvals Card */}
                <Grid item xs={12} sm={6} md={4}>
                    <Card
                        sx={{
                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            color: 'white',
                            boxShadow: 3,
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                                        Events Pending Approval
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {stats.pendingApprovalsCount || 0}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                                    <PendingIcon sx={{ fontSize: 32 }} />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Main Content Grid */}
            <Grid container spacing={3}>
                {/* My Events */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ boxShadow: 2 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EventIcon color="primary" />
                                My Events
                            </Typography>

                            {dashboardData?.myEventsList && dashboardData.myEventsList.length > 0 ? (
                                <Stack spacing={2}>
                                    {dashboardData.myEventsList.map((event) => (
                                        <Card
                                            key={event.event_id}
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                borderLeft: '4px solid',
                                                borderLeftColor: getStatusColor(event.status) === 'success' ? 'green' :
                                                    getStatusColor(event.status) === 'warning' ? 'orange' :
                                                    getStatusColor(event.status) === 'error' ? 'red' : '#ccc',
                                                '&:hover': { boxShadow: 2 },
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                        {event.title}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                                        <Chip
                                                            label={event.status}
                                                            size="small"
                                                            color={getStatusColor(event.status)}
                                                            variant="filled"
                                                        />
                                                        {event.status === 'rejected' && (
                                                            <Chip
                                                                label={`Reason: ${event.rejection_reason}`}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ maxWidth: '200px' }}
                                                            />
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2, fontSize: '0.9rem' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                    <CalendarIcon sx={{ fontSize: 18 }} />
                                                    {new Date(event.event_date).toLocaleDateString()}
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                    <GroupIcon sx={{ fontSize: 18 }} />
                                                    {event.registered_count} registered
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                                <Button size="small" variant="outlined" startIcon={<EditIcon />}>
                                                    Edit
                                                </Button>
                                                <Button size="small" variant="outlined" startIcon={<GroupIcon />}>
                                                    Registrations
                                                </Button>
                                            </Box>
                                        </Card>
                                    ))}
                                </Stack>
                            ) : (
                                <Alert severity="info">No events created yet</Alert>
                            )}
                        </CardContent>
                        <CardActions>
                            <Button
                                size="small"
                                endIcon={<AddIcon />}
                            >
                                Create Event
                            </Button>
                            <Button
                                size="small"
                                endIcon={<ArrowIcon />}
                                href="/events"
                            >
                                View All
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                {/* Pending Approvals */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ boxShadow: 2 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PendingIcon color="primary" />
                                Events Pending Approval
                            </Typography>

                            {dashboardData?.pendingApprovals && dashboardData.pendingApprovals.length > 0 ? (
                                <Stack spacing={2}>
                                    {dashboardData.pendingApprovals.map((event) => (
                                        <Card
                                            key={event.event_id}
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                borderLeft: '4px solid orange',
                                                backgroundColor: '#fff8f0'
                                            }}
                                        >
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                {event.title}
                                            </Typography>
                                            <Box sx={{ fontSize: '0.9rem', color: 'text.secondary', mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                    <CalendarIcon sx={{ fontSize: 16 }} />
                                                    {new Date(event.event_date).toLocaleDateString()}
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <GroupIcon sx={{ fontSize: 16 }} />
                                                    {event.registered_count} registrations
                                                </Box>
                                            </Box>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="warning"
                                                fullWidth
                                            >
                                                View Details
                                            </Button>
                                        </Card>
                                    ))}
                                </Stack>
                            ) : (
                                <Alert severity="success">All your events are approved!</Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Registrations */}
                <Grid item xs={12}>
                    <Card sx={{ boxShadow: 2 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon color="primary" />
                                Recent Registrations
                            </Typography>

                            {dashboardData?.recentRegistrations && dashboardData.recentRegistrations.length > 0 ? (
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Event</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Attendance</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {dashboardData.recentRegistrations.slice(0, 5).map((reg) => (
                                                <TableRow key={reg.reg_id}>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                                {reg.student_name}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                {reg.email}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {reg.title}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={reg.attendance_status || 'Unmarked'}
                                                            size="small"
                                                            color={
                                                                reg.attendance_status === 'present'
                                                                    ? 'success'
                                                                    : reg.attendance_status === 'absent'
                                                                    ? 'error'
                                                                    : 'default'
                                                            }
                                                            variant={reg.attendance_status ? 'filled' : 'outlined'}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Button size="small" variant="text">
                                                            <MoreIcon sx={{ fontSize: 20 }} />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Alert severity="info">No registrations yet</Alert>
                            )}
                        </CardContent>
                        <CardActions>
                            <Button size="small" endIcon={<ArrowIcon />}>
                                View All Registrations
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>

            {/* Quick Actions */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Quick Actions
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            sx={{ py: 1.5, textTransform: 'none' }}
                        >
                            Create Event
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="secondary"
                            startIcon={<EventIcon />}
                            sx={{ py: 1.5, textTransform: 'none' }}
                        >
                            View All Events
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="primary"
                            startIcon={<GroupIcon />}
                            sx={{ py: 1.5, textTransform: 'none' }}
                        >
                            Manage Registrations
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={fetchDashboardData}
                            sx={{ py: 1.5, textTransform: 'none' }}
                        >
                            Refresh
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default ClubDashboard;
