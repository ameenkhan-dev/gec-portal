/**
 * AdminDashboard.jsx
 * Comprehensive dashboard for super admins with system-wide analytics and controls
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
    Stack,
    Tabs,
    Tab
} from '@mui/material';
import {
    Event as EventIcon,
    Group as GroupIcon,
    Pending as PendingIcon,
    CalendarToday as CalendarIcon,
    LocationOn as LocationIcon,
    VerifiedUser as VerifiedIcon,
    Assessment as AssessmentIcon,
    People as PeopleIcon,
    CheckCircle as CheckIcon,
    Close as CloseIcon,
    ArrowForward as ArrowIcon,
    TrendingUp as TrendingIcon,
    Download as DownloadIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({});
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');

            const response = await axios.get(
                `${API_BASE_URL}/dashboard/super-admin`,
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

    const fetchAnalytics = async () => {
        try {
            setAnalyticsLoading(true);
            const token = localStorage.getItem('token');

            const response = await axios.get(
                `${API_BASE_URL}/dashboard/analytics`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setAnalyticsData(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        if (newValue === 1 && !analyticsData) {
            fetchAnalytics();
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    const userName = dashboardData?.user?.name || 'Super Admin';

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    System Dashboard, {userName}! 🎯
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Monitor and manage the entire event portal
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="dashboard tabs"
                >
                    <Tab label="Overview" id="tab-0" aria-controls="tabpanel-0" />
                    <Tab label="Analytics" id="tab-1" aria-controls="tabpanel-1" />
                </Tabs>
            </Box>

            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Total Events Card */}
                    <Grid item xs={12} sm={6} md={4} lg={2.4}>
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
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                    <EventIcon sx={{ fontSize: 32, mb: 1, opacity: 0.8 }} />
                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                                        Total Events
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {stats.totalEventsCount || 0}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Pending Approvals Card */}
                    <Grid item xs={12} sm={6} md={4} lg={2.4}>
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
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                    <PendingIcon sx={{ fontSize: 32, mb: 1, opacity: 0.8 }} />
                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                                        Pending Approvals
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {stats.pendingApprovalsCount || 0}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Total Users Card */}
                    <Grid item xs={12} sm={6} md={4} lg={2.4}>
                        <Card
                            sx={{
                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                color: 'white',
                                boxShadow: 3,
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                    <PeopleIcon sx={{ fontSize: 32, mb: 1, opacity: 0.8 }} />
                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                                        Total Users
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {stats.totalUsersCount || 0}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Total Registrations Card */}
                    <Grid item xs={12} sm={6} md={4} lg={2.4}>
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
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                    <GroupIcon sx={{ fontSize: 32, mb: 1, opacity: 0.8 }} />
                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                                        Total Registrations
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {stats.totalRegistrationsCount || 0}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Total Certificates Card */}
                    <Grid item xs={12} sm={6} md={4} lg={2.4}>
                        <Card
                            sx={{
                                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                color: 'white',
                                boxShadow: 3,
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                    <VerifiedIcon sx={{ fontSize: 32, mb: 1, opacity: 0.8 }} />
                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                                        Total Certificates
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {stats.totalCertificatesCount || 0}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Main Content Grid */}
                <Grid container spacing={3}>
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
                                        {dashboardData.pendingApprovals.slice(0, 5).map((event) => (
                                            <Card
                                                key={event.event_id}
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                    borderLeft: '4px solid orange',
                                                    backgroundColor: '#fff8f0'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                            {event.title}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            {event.club_name}
                                                        </Typography>
                                                    </Box>
                                                    <Chip label={event.registered_count || 0} size="small" />
                                                </Box>
                                                <Box sx={{ fontSize: '0.85rem', color: 'text.secondary', mb: 1.5 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <CalendarIcon sx={{ fontSize: 16 }} />
                                                        {new Date(event.event_date).toLocaleDateString()}
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button size="small" variant="contained" color="success" startIcon={<CheckIcon />}>
                                                        Approve
                                                    </Button>
                                                    <Button size="small" variant="outlined" color="error" startIcon={<CloseIcon />}>
                                                        Reject
                                                    </Button>
                                                </Box>
                                            </Card>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Alert severity="success">All events are approved!</Alert>
                                )}
                            </CardContent>
                            <CardActions>
                                <Button size="small" endIcon={<ArrowIcon />}>
                                    View All Pending
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>

                    {/* Events by Club */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ boxShadow: 2 }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TrendingIcon color="primary" />
                                    Events by Club
                                </Typography>

                                {dashboardData?.eventsByClub && dashboardData.eventsByClub.length > 0 ? (
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Club Name</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Events</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {dashboardData.eventsByClub.map((club, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <Typography variant="body2">
                                                                {club.club_name}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Chip
                                                                label={club.event_count || 0}
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Alert severity="info">No clubs yet</Alert>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Recent Events */}
                    <Grid item xs={12}>
                        <Card sx={{ boxShadow: 2 }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EventIcon color="primary" />
                                    Recent Events
                                </Typography>

                                {dashboardData?.recentEvents && dashboardData.recentEvents.length > 0 ? (
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Event Title</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Club</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Registrations</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {dashboardData.recentEvents.slice(0, 8).map((event) => (
                                                    <TableRow key={event.event_id}>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: '500' }}>
                                                                {event.title}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2">
                                                                {event.club_name}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Typography variant="body2">
                                                                {new Date(event.event_date).toLocaleDateString()}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip
                                                                label={event.status}
                                                                size="small"
                                                                color={
                                                                    event.status === 'approved' ? 'success' :
                                                                    event.status === 'pending' ? 'warning' :
                                                                    event.status === 'rejected' ? 'error' :
                                                                    'default'
                                                                }
                                                                variant="filled"
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Chip
                                                                label={event.registered_count || 0}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Alert severity="info">No events yet</Alert>
                                )}
                            </CardContent>
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
                                startIcon={<CheckIcon />}
                                sx={{ py: 1.5, textTransform: 'none' }}
                            >
                                Review Pending Events
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="secondary"
                                startIcon={<PeopleIcon />}
                                sx={{ py: 1.5, textTransform: 'none' }}
                            >
                                Manage Users
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="primary"
                                startIcon={<TrendingIcon />}
                                onClick={() => setTabValue(1)}
                                sx={{ py: 1.5, textTransform: 'none' }}
                            >
                                View Analytics
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="primary"
                                startIcon={<DownloadIcon />}
                                onClick={fetchDashboardData}
                                sx={{ py: 1.5, textTransform: 'none' }}
                            >
                                Refresh
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </TabPanel>

            {/* Analytics Tab */}
            <TabPanel value={tabValue} index={1}>
                {analyticsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : analyticsData ? (
                    <Grid container spacing={3}>
                        {/* Events by Status */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ boxShadow: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                        Events by Status
                                    </Typography>
                                    {analyticsData.eventsByStatus && analyticsData.eventsByStatus.length > 0 ? (
                                        <Stack spacing={1}>
                                            {analyticsData.eventsByStatus.map((item, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        p: 1.5,
                                                        backgroundColor: '#f5f5f5',
                                                        borderRadius: 1
                                                    }}
                                                >
                                                    <Chip
                                                        label={item.status}
                                                        color={
                                                            item.status === 'approved' ? 'success' :
                                                            item.status === 'pending' ? 'warning' :
                                                            item.status === 'rejected' ? 'error' :
                                                            'default'
                                                        }
                                                        variant="filled"
                                                    />
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                        {item.count || 0}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Alert severity="info">No data available</Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* User Statistics */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ boxShadow: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                        Users by Role
                                    </Typography>
                                    {analyticsData.userStats && analyticsData.userStats.length > 0 ? (
                                        <Stack spacing={1}>
                                            {analyticsData.userStats.map((item, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        p: 1.5,
                                                        backgroundColor: '#f5f5f5',
                                                        borderRadius: 1
                                                    }}
                                                >
                                                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                                        {item.role}
                                                    </Typography>
                                                    <Chip
                                                        label={item.count || 0}
                                                        color="primary"
                                                        variant="filled"
                                                    />
                                                </Box>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Alert severity="info">No data available</Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Top Events */}
                        <Grid item xs={12}>
                            <Card sx={{ boxShadow: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                        Top Events by Registrations
                                    </Typography>
                                    {analyticsData.topEvents && analyticsData.topEvents.length > 0 ? (
                                        <TableContainer component={Paper} variant="outlined">
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Event Title</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Club</TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Registrations</TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Fill Rate</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {analyticsData.topEvents.map((event, index) => {
                                                        const fillRate = event.max_participants
                                                            ? Math.round((event.registration_count / event.max_participants) * 100)
                                                            : 0;
                                                        return (
                                                            <TableRow key={index}>
                                                                <TableCell>
                                                                    <Typography variant="body2" sx={{ fontWeight: '500' }}>
                                                                        {event.title}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="body2">
                                                                        {event.club_name}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Chip
                                                                        label={event.registration_count || 0}
                                                                        size="small"
                                                                        color="primary"
                                                                        variant="filled"
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Typography variant="body2">
                                                                        {event.max_participants || 'N/A'}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Chip
                                                                        label={`${fillRate}%`}
                                                                        size="small"
                                                                        color={fillRate >= 80 ? 'success' : fillRate >= 50 ? 'warning' : 'default'}
                                                                        variant="filled"
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Alert severity="info">No data available</Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Certificate Statistics */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ boxShadow: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                        Certificate Statistics
                                    </Typography>
                                    {analyticsData.certStats ? (
                                        <Stack spacing={2}>
                                            <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                    Total Certificates Issued
                                                </Typography>
                                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                                    {analyticsData.certStats.total_certs || 0}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                    Events with Certificates
                                                </Typography>
                                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                                    {analyticsData.certStats.events_with_certs || 0}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                    Users with Certificates
                                                </Typography>
                                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                                    {analyticsData.certStats.users_with_certs || 0}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    ) : (
                                        <Alert severity="info">No certificate data</Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Attendance Statistics */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ boxShadow: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                        Attendance Statistics
                                    </Typography>
                                    {analyticsData.attendanceStats ? (
                                        <Stack spacing={2}>
                                            <Box sx={{ p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                    Present
                                                </Typography>
                                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                                    {analyticsData.attendanceStats.present_count || 0}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ p: 2, backgroundColor: '#ffebee', borderRadius: 1 }}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                    Absent
                                                </Typography>
                                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                                    {analyticsData.attendanceStats.absent_count || 0}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                    Unmarked
                                                </Typography>
                                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                                    {analyticsData.attendanceStats.unmarked_count || 0}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    ) : (
                                        <Alert severity="info">No attendance data</Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                ) : (
                    <Alert severity="error">Failed to load analytics data</Alert>
                )}
            </TabPanel>
        </Container>
    );
};

export default AdminDashboard;
