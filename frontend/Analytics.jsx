/**
 * Analytics.jsx
 * Detailed analytics page for super admin with comprehensive charts and statistics
 */

import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Stack,
    LinearProgress
} from '@mui/material';
import {
    Assessment as AssessmentIcon,
    TrendingUp as TrendingIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    ArrowBack as BackIcon,
    EventAvailable as EventIcon,
    Group as GroupIcon,
    CheckCircle as CheckIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Analytics = ({ onBack = () => window.history.back() }) => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError('');
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
            setError(
                err.response?.data?.message ||
                'Failed to load analytics data'
            );
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = () => {
        // Create CSV content
        let csvContent = 'GEC Event Portal - Analytics Report\n';
        csvContent += `Generated on: ${new Date().toLocaleString()}\n\n`;

        // Events by Status
        csvContent += 'Events by Status\n';
        csvContent += 'Status,Count\n';
        if (analyticsData?.eventsByStatus) {
            analyticsData.eventsByStatus.forEach(item => {
                csvContent += `${item.status},${item.count}\n`;
            });
        }
        csvContent += '\n';

        // User Statistics
        csvContent += 'Users by Role\n';
        csvContent += 'Role,Count\n';
        if (analyticsData?.userStats) {
            analyticsData.userStats.forEach(item => {
                csvContent += `${item.role},${item.count}\n`;
            });
        }
        csvContent += '\n';

        // Create and download file
        const element = document.createElement('a');
        element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
        element.setAttribute('download', `analytics-${new Date().toISOString().split('T')[0]}.csv`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssessmentIcon sx={{ fontSize: 32 }} />
                        Analytics & Reports
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        System-wide performance metrics and statistics
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchAnalytics}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={downloadReport}
                    >
                        Export Report
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Key Metrics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Average Registrations */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ boxShadow: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                        Avg. Registrations/Event
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                        {analyticsData?.averageRegistrations || 0}
                                    </Typography>
                                </Box>
                                <GroupIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.2 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Certificate Stats */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ boxShadow: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                        Total Certificates
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                        {analyticsData?.certStats?.total_certs || 0}
                                    </Typography>
                                </Box>
                                <CheckIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.2 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Events with Certificates */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ boxShadow: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                        Events with Certs
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                        {analyticsData?.certStats?.events_with_certs || 0}
                                    </Typography>
                                </Box>
                                <EventIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.2 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Users with Certificates */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ boxShadow: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                        Users with Certs
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                        {analyticsData?.certStats?.users_with_certs || 0}
                                    </Typography>
                                </Box>
                                <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.2 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Main Analytics Grid */}
            <Grid container spacing={3}>
                {/* Events by Status - Detailed */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ boxShadow: 2 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EventIcon color="primary" />
                                Events by Status
                            </Typography>

                            {analyticsData?.eventsByStatus && analyticsData.eventsByStatus.length > 0 ? (
                                <Stack spacing={2}>
                                    {analyticsData.eventsByStatus.map((item, index) => {
                                        const total = analyticsData.eventsByStatus.reduce((sum, s) => sum + s.count, 0);
                                        const percentage = ((item.count / total) * 100).toFixed(1);
                                        return (
                                            <Box key={index}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
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
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                        {item.count} ({percentage}%)
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={parseFloat(percentage)}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 1,
                                                        backgroundColor: '#e0e0e0'
                                                    }}
                                                />
                                            </Box>
                                        );
                                    })}
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
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <GroupIcon color="primary" />
                                Users by Role
                            </Typography>

                            {analyticsData?.userStats && analyticsData.userStats.length > 0 ? (
                                <Stack spacing={2}>
                                    {analyticsData.userStats.map((item, index) => {
                                        const total = analyticsData.userStats.reduce((sum, s) => sum + s.count, 0);
                                        const percentage = ((item.count / total) * 100).toFixed(1);
                                        return (
                                            <Box key={index}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: '500', textTransform: 'capitalize' }}>
                                                        {item.role}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                        {item.count} ({percentage}%)
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={parseFloat(percentage)}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 1,
                                                        backgroundColor: '#e0e0e0'
                                                    }}
                                                />
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            ) : (
                                <Alert severity="info">No data available</Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top Events by Registrations */}
                <Grid item xs={12}>
                    <Card sx={{ boxShadow: 2 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TrendingIcon color="primary" />
                                Top Events by Registrations
                            </Typography>

                            {analyticsData?.topEvents && analyticsData.topEvents.length > 0 ? (
                                <TableContainer component={Paper} variant="outlined">
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Event Title</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Club</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Registrations</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Fill Rate</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {analyticsData.topEvents.map((event, index) => {
                                                const fillRate = event.max_participants
                                                    ? Math.round((event.registration_count / event.max_participants) * 100)
                                                    : 0;
                                                return (
                                                    <TableRow key={event.event_id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>
                                                            #{index + 1}
                                                        </TableCell>
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
                                                                color="primary"
                                                                variant="filled"
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Typography variant="body2">
                                                                {event.max_participants || 'N/A'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={fillRate}
                                                                    sx={{
                                                                        width: 100,
                                                                        height: 6,
                                                                        borderRadius: 1,
                                                                        backgroundColor: '#e0e0e0'
                                                                    }}
                                                                />
                                                                <Typography variant="caption" sx={{ fontWeight: 'bold', minWidth: '35px' }}>
                                                                    {fillRate}%
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip
                                                                label={fillRate >= 80 ? 'High' : fillRate >= 50 ? 'Medium' : 'Low'}
                                                                size="small"
                                                                color={fillRate >= 80 ? 'success' : fillRate >= 50 ? 'warning' : 'default'}
                                                                variant="outlined"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Alert severity="info">No events data available</Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Attendance Breakdown */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ boxShadow: 2 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                                Attendance Breakdown
                            </Typography>

                            {analyticsData?.attendanceStats ? (
                                <Stack spacing={2}>
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Chip
                                                label="Present"
                                                color="success"
                                                variant="filled"
                                                size="small"
                                            />
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {analyticsData.attendanceStats.present_count || 0}
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={
                                                analyticsData.attendanceStats.present_count +
                                                    analyticsData.attendanceStats.absent_count +
                                                    analyticsData.attendanceStats.unmarked_count > 0
                                                    ? (analyticsData.attendanceStats.present_count /
                                                        (analyticsData.attendanceStats.present_count +
                                                            analyticsData.attendanceStats.absent_count +
                                                            analyticsData.attendanceStats.unmarked_count)) *
                                                    100
                                                    : 0
                                            }
                                            sx={{
                                                height: 8,
                                                borderRadius: 1,
                                                backgroundColor: '#e0e0e0',
                                                '& .MuiLinearProgress-bar': { backgroundColor: '#4caf50' }
                                            }}
                                        />
                                    </Box>

                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Chip
                                                label="Absent"
                                                color="error"
                                                variant="filled"
                                                size="small"
                                            />
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {analyticsData.attendanceStats.absent_count || 0}
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={
                                                analyticsData.attendanceStats.present_count +
                                                    analyticsData.attendanceStats.absent_count +
                                                    analyticsData.attendanceStats.unmarked_count > 0
                                                    ? (analyticsData.attendanceStats.absent_count /
                                                        (analyticsData.attendanceStats.present_count +
                                                            analyticsData.attendanceStats.absent_count +
                                                            analyticsData.attendanceStats.unmarked_count)) *
                                                    100
                                                    : 0
                                            }
                                            sx={{
                                                height: 8,
                                                borderRadius: 1,
                                                backgroundColor: '#e0e0e0',
                                                '& .MuiLinearProgress-bar': { backgroundColor: '#f44336' }
                                            }}
                                        />
                                    </Box>

                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Chip
                                                label="Unmarked"
                                                color="default"
                                                variant="filled"
                                                size="small"
                                            />
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {analyticsData.attendanceStats.unmarked_count || 0}
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={
                                                analyticsData.attendanceStats.present_count +
                                                    analyticsData.attendanceStats.absent_count +
                                                    analyticsData.attendanceStats.unmarked_count > 0
                                                    ? (analyticsData.attendanceStats.unmarked_count /
                                                        (analyticsData.attendanceStats.present_count +
                                                            analyticsData.attendanceStats.absent_count +
                                                            analyticsData.attendanceStats.unmarked_count)) *
                                                    100
                                                    : 0
                                            }
                                            sx={{
                                                height: 8,
                                                borderRadius: 1,
                                                backgroundColor: '#e0e0e0',
                                                '& .MuiLinearProgress-bar': { backgroundColor: '#9e9e9e' }
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{
                                        p: 2,
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: 1,
                                        textAlign: 'center'
                                    }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                            Total Records
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {(analyticsData.attendanceStats.present_count || 0) +
                                                (analyticsData.attendanceStats.absent_count || 0) +
                                                (analyticsData.attendanceStats.unmarked_count || 0)}
                                        </Typography>
                                    </Box>
                                </Stack>
                            ) : (
                                <Alert severity="info">No attendance data</Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Certificate Summary */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ boxShadow: 2 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                                Certificate Generation Summary
                            </Typography>

                            {analyticsData?.certStats ? (
                                <Stack spacing={2}>
                                    <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                            Total Certificates Issued
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                            {analyticsData.certStats.total_certs || 0}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ p: 2, backgroundColor: '#f3e5f5', borderRadius: 1 }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                            Events with Certificates Generated
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#7c4dff' }}>
                                            {analyticsData.certStats.events_with_certs || 0}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                            Unique Users with Certificates
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                                            {analyticsData.certStats.users_with_certs || 0}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ p: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                            Average Certificates per Event
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                                            {analyticsData.certStats.events_with_certs > 0
                                                ? (analyticsData.certStats.total_certs / analyticsData.certStats.events_with_certs).toFixed(1)
                                                : 0}
                                        </Typography>
                                    </Box>
                                </Stack>
                            ) : (
                                <Alert severity="info">No certificate data available</Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Analytics;
