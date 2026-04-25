/**
 * MyRegistrations.jsx
 * Student page to view their event registrations with certificate download
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
    TextField,
    Box,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import {
    Download as DownloadIcon,
    CheckCircle as CheckCircleIcon,
    Event as EventIcon,
    CalendarToday as CalendarIcon,
    LocationOn as LocationIcon,
    School as SchoolIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const MyRegistrations = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [downloading, setDownloading] = useState(null);
    const [openCertDialog, setOpenCertDialog] = useState(false);
    const [selectedCert, setSelectedCert] = useState(null);

    useEffect(() => {
        fetchMyRegistrations();
    }, []);

    const fetchMyRegistrations = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await axios.get(
                `${API_BASE_URL}/events/my-registrations`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setRegistrations(response.data.data);
                setError('');
            } else {
                setError(response.data.message || 'Failed to fetch registrations');
            }
        } catch (err) {
            console.error('Error fetching registrations:', err);
            setError(err.response?.data?.message || 'Error fetching registrations');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCertificate = async (certId, eventName) => {
        try {
            setDownloading(certId);
            const token = localStorage.getItem('token');

            const response = await axios.get(
                `${API_BASE_URL}/certificates/download/${certId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    responseType: 'blob'
                }
            );

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${eventName}_Certificate.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            setOpenCertDialog(false);
        } catch (err) {
            console.error('Error downloading certificate:', err);
            setError('Failed to download certificate');
        } finally {
            setDownloading(null);
        }
    };

    const filteredRegistrations = registrations.filter(reg => {
        if (filterStatus === 'attended') return reg.attendance_status === 'present';
        if (filterStatus === 'absent') return reg.attendance_status === 'absent';
        if (filterStatus === 'pending') return reg.attendance_status === null;
        if (filterStatus === 'with-cert') return reg.certificate_id !== null;
        return true;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getAttendanceColor = (status) => {
        if (status === 'present') return 'success';
        if (status === 'absent') return 'error';
        return 'default';
    };

    const getAttendanceLabel = (status) => {
        if (status === 'present') return 'Attended ✓';
        if (status === 'absent') return 'Absent ✗';
        return 'Pending';
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
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon sx={{ fontSize: 32 }} />
                    My Event Registrations
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    View your registered events and download certificates
                </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Filter */}
            <Box sx={{ mb: 4 }}>
                <TextField
                    select
                    label="Filter by status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    variant="outlined"
                    size="small"
                    SelectProps={{
                        native: true,
                    }}
                >
                    <option value="all">All Registrations</option>
                    <option value="attended">Attended</option>
                    <option value="absent">Absent</option>
                    <option value="pending">Pending</option>
                    <option value="with-cert">With Certificate</option>
                </TextField>
            </Box>

            {/* Empty State */}
            {filteredRegistrations.length === 0 ? (
                <Alert severity="info">
                    {registrations.length === 0
                        ? 'You haven\'t registered for any events yet.'
                        : 'No registrations match your filter.'}
                </Alert>
            ) : (
                <>
                    {/* Registration Count */}
                    <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Showing {filteredRegistrations.length} registration{filteredRegistrations.length !== 1 ? 's' : ''}
                    </Typography>

                    {/* Registrations Grid */}
                    <Grid container spacing={3}>
                        {filteredRegistrations.map((registration) => (
                            <Grid item xs={12} sm={6} md={4} key={registration.reg_id}>
                                <Card sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    }
                                }}>
                                    {/* Card Header */}
                                    <CardContent sx={{ pb: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                            <Chip
                                                label={registration.club_name}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                            <Chip
                                                label={getAttendanceLabel(registration.attendance_status)}
                                                size="small"
                                                color={getAttendanceColor(registration.attendance_status)}
                                            />
                                        </Box>
                                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            {registration.event_title}
                                        </Typography>
                                    </CardContent>

                                    {/* Event Details */}
                                    <CardContent sx={{ flex: 1, pt: 0 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <CalendarIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                            <Typography variant="body2" color="textSecondary">
                                                {formatDate(registration.event_date)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocationIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                            <Typography variant="body2" color="textSecondary">
                                                {registration.venue}
                                            </Typography>
                                        </Box>

                                        {/* Certificate Status */}
                                        {registration.attendance_status === 'present' && (
                                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                                                {registration.certificate_id ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                                                        <CheckCircleIcon sx={{ fontSize: 18 }} />
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            Certificate Available
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body2" color="textSecondary">
                                                        Certificate not yet generated
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </CardContent>

                                    {/* Actions */}
                                    <CardActions>
                                        {registration.attendance_status === 'present' && registration.certificate_id && (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                color="success"
                                                startIcon={<DownloadIcon />}
                                                onClick={() => {
                                                    setSelectedCert({
                                                        id: registration.certificate_id,
                                                        eventName: registration.event_title
                                                    });
                                                    setOpenCertDialog(true);
                                                }}
                                            >
                                                Download Certificate
                                            </Button>
                                        )}
                                        {registration.attendance_status !== 'present' && (
                                            <Typography variant="caption" color="textSecondary" sx={{ width: '100%', textAlign: 'center', py: 1 }}>
                                                {registration.attendance_status === 'absent'
                                                    ? 'Certificates not available for absent attendees'
                                                    : 'Attendance not yet marked'}
                                            </Typography>
                                        )}
                                        {registration.attendance_status === 'present' && !registration.certificate_id && (
                                            <Typography variant="caption" color="textSecondary" sx={{ width: '100%', textAlign: 'center', py: 1 }}>
                                                Certificate will be generated by the event organizer
                                            </Typography>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}

            {/* Certificate Download Confirmation Dialog */}
            <Dialog open={openCertDialog} onClose={() => setOpenCertDialog(false)}>
                <DialogTitle>Download Certificate</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {selectedCert && `Download your certificate for ${selectedCert.eventName}?`}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCertDialog(false)}>Cancel</Button>
                    <Button
                        onClick={() => selectedCert && handleDownloadCertificate(selectedCert.id, selectedCert.eventName)}
                        variant="contained"
                        disabled={downloading === selectedCert?.id}
                        startIcon={<DownloadIcon />}
                    >
                        {downloading === selectedCert?.id ? 'Downloading...' : 'Download'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MyRegistrations;
