/**
 * MyCertificates.jsx
 * Student page to view and download their certificates
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
    CardMedia
} from '@mui/material';
import {
    Download as DownloadIcon,
    School as SchoolIcon,
    CalendarToday as CalendarIcon,
    LocationOn as LocationIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const MyCertificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterEvent, setFilterEvent] = useState('');
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await axios.get(
                `${API_BASE_URL}/certificates/my-certificates`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setCertificates(response.data.data);
                setError('');
            } else {
                setError(response.data.message || 'Failed to fetch certificates');
            }
        } catch (err) {
            console.error('Error fetching certificates:', err);
            setError(err.response?.data?.message || 'Error fetching certificates');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (certId, eventName) => {
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

        } catch (err) {
            console.error('Error downloading certificate:', err);
            setError('Failed to download certificate');
        } finally {
            setDownloading(null);
        }
    };

    const filteredCertificates = certificates.filter(cert =>
        filterEvent === '' || cert.event_name.toLowerCase().includes(filterEvent.toLowerCase())
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                    <SchoolIcon sx={{ fontSize: 32 }} />
                    My Certificates
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    View and download your event attendance certificates
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
                    label="Search by event name"
                    variant="outlined"
                    fullWidth
                    value={filterEvent}
                    onChange={(e) => setFilterEvent(e.target.value)}
                    placeholder="Type event name..."
                />
            </Box>

            {/* Empty State */}
            {filteredCertificates.length === 0 ? (
                <Alert severity="info">
                    {certificates.length === 0
                        ? 'You don\'t have any certificates yet. Attend events to earn certificates!'
                        : 'No certificates match your search.'}
                </Alert>
            ) : (
                <>
                    {/* Certificate Count */}
                    <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Showing {filteredCertificates.length} certificate{filteredCertificates.length !== 1 ? 's' : ''}
                    </Typography>

                    {/* Certificates Grid */}
                    <Grid container spacing={3}>
                        {filteredCertificates.map((certificate) => (
                            <Grid item xs={12} sm={6} md={4} key={certificate.cert_id}>
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
                                    {/* Card Header with Club */}
                                    <CardContent sx={{ pb: 1 }}>
                                        <Chip
                                            label={certificate.club_name}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            sx={{ mb: 1 }}
                                        />
                                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            {certificate.event_name}
                                        </Typography>
                                    </CardContent>

                                    {/* Event Details */}
                                    <CardContent sx={{ flex: 1, pt: 0 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <CalendarIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                            <Typography variant="body2" color="textSecondary">
                                                {formatDate(certificate.event_date)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocationIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                            <Typography variant="body2" color="textSecondary">
                                                {certificate.venue}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                                            Issued: {formatDate(certificate.issued_at)}
                                        </Typography>
                                    </CardContent>

                                    {/* Actions */}
                                    <CardActions>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<DownloadIcon />}
                                            onClick={() => handleDownload(certificate.cert_id, certificate.event_name)}
                                            disabled={downloading === certificate.cert_id}
                                        >
                                            {downloading === certificate.cert_id ? 'Downloading...' : 'Download'}
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
        </Container>
    );
};

export default MyCertificates;
