/**
 * EventRegistrations.jsx
 * Club admin page to view event registrations and generate certificates
 */

import React, { useState, useEffect } from 'react';
import {
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    CircularProgress,
    Alert,
    Box,
    Typography,
    TablePagination,
    TextField,
    MenuItem,
    Card,
    CardContent,
    CardHeader
} from '@mui/material';
import {
    Description as DescriptionIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Download as DownloadIcon,
    Autorenew as AutorenewIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EventRegistrations = () => {
    const { eventId } = useParams();
    const [registrations, setRegistrations] = useState([]);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filterStatus, setFilterStatus] = useState('all');
    const [generating, setGenerating] = useState(null);
    const [bulkGenerating, setBulkGenerating] = useState(false);
    const [openBulkDialog, setOpenBulkDialog] = useState(false);

    useEffect(() => {
        fetchEventAndRegistrations();
    }, [eventId]);

    const fetchEventAndRegistrations = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Fetch event details and registrations
            const response = await axios.get(
                `${API_BASE_URL}/events/${eventId}/registrations`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setEvent(response.data.event);
                // Map registrations with certificate status
                const registrationsWithStatus = response.data.registrations.map(reg => ({
                    ...reg,
                    hasCertificate: response.data.certificates?.some(cert => cert.user_id === reg.user_id)
                }));
                setRegistrations(registrationsWithStatus);
                setError('');
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Error fetching registrations');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCertificate = async (userId, userName) => {
        try {
            setGenerating(userId);
            const token = localStorage.getItem('token');

            const response = await axios.post(
                `${API_BASE_URL}/certificates/generate/${eventId}/${userId}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setSuccessMessage(`Certificate generated for ${userName}`);
                // Update registration to show certificate is generated
                setRegistrations(prev =>
                    prev.map(reg =>
                        reg.user_id === userId ? { ...reg, hasCertificate: true } : reg
                    )
                );
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err) {
            console.error('Error generating certificate:', err);
            setError(err.response?.data?.message || 'Error generating certificate');
        } finally {
            setGenerating(null);
        }
    };

    const handleBulkGenerate = async () => {
        try {
            setBulkGenerating(true);
            const token = localStorage.getItem('token');

            const response = await axios.post(
                `${API_BASE_URL}/certificates/bulk-generate/${eventId}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setSuccessMessage(`Certificates generated: ${response.data.data.successful} successful, ${response.data.data.failed} failed`);
                // Refresh registrations to show updated certificate status
                fetchEventAndRegistrations();
                setOpenBulkDialog(false);
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        } catch (err) {
            console.error('Error bulk generating certificates:', err);
            setError(err.response?.data?.message || 'Error bulk generating certificates');
        } finally {
            setBulkGenerating(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getAttendanceColor = (status) => {
        return status === 'present' ? 'success' : status === 'absent' ? 'error' : 'default';
    };

    const getAttendanceIcon = (status) => {
        return status === 'present' ? <CheckCircleIcon /> : <CancelIcon />;
    };

    const filteredRegistrations = registrations.filter(reg => {
        if (filterStatus === 'present') return reg.attendance_status === 'present';
        if (filterStatus === 'absent') return reg.attendance_status === 'absent';
        if (filterStatus === 'with-cert') return reg.hasCertificate;
        if (filterStatus === 'without-cert') return !reg.hasCertificate && reg.attendance_status === 'present';
        return true;
    });

    const paginatedRegistrations = filteredRegistrations.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

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
            {event && (
                <Card sx={{ mb: 4 }}>
                    <CardHeader
                        title={event.title}
                        subheader={`${event.registrationCount || 0} registrations`}
                    />
                    <CardContent>
                        <Typography variant="body2" color="textSecondary">
                            <strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            <strong>Venue:</strong> {event.venue}
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* Success Alert */}
            {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
                    {successMessage}
                </Alert>
            )}

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Filter and Action Bar */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    select
                    label="Filter by status"
                    value={filterStatus}
                    onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setPage(0);
                    }}
                    variant="outlined"
                    size="small"
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="present">Present</MenuItem>
                    <MenuItem value="absent">Absent</MenuItem>
                    <MenuItem value="with-cert">With Certificate</MenuItem>
                    <MenuItem value="without-cert">Without Certificate</MenuItem>
                </TextField>

                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AutorenewIcon />}
                    onClick={() => setOpenBulkDialog(true)}
                    disabled={registrations.every(r => r.attendance_status !== 'present' || r.hasCertificate)}
                >
                    Bulk Generate Certificates
                </Button>
            </Box>

            {/* Registrations Table */}
            {filteredRegistrations.length === 0 ? (
                <Alert severity="info">
                    {filterStatus === 'all'
                        ? 'No registrations found'
                        : 'No registrations match the selected filter'}
                </Alert>
            ) : (
                <>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Attendance</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Certificate</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedRegistrations.map((registration) => (
                                    <TableRow key={registration.reg_id}>
                                        <TableCell sx={{ fontWeight: 500 }}>
                                            {registration.user_name}
                                        </TableCell>
                                        <TableCell>{registration.user_email}</TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                icon={getAttendanceIcon(registration.attendance_status)}
                                                label={registration.attendance_status?.toUpperCase() || 'N/A'}
                                                color={getAttendanceColor(registration.attendance_status)}
                                                variant="outlined"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            {registration.hasCertificate ? (
                                                <Chip
                                                    icon={<CheckCircleIcon />}
                                                    label="Generated"
                                                    color="success"
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            ) : registration.attendance_status === 'present' ? (
                                                <Chip
                                                    label="Pending"
                                                    color="warning"
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            ) : (
                                                <Chip
                                                    label="N/A"
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {registration.attendance_status === 'present' && !registration.hasCertificate && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<DescriptionIcon />}
                                                    onClick={() => handleGenerateCertificate(registration.user_id, registration.user_name)}
                                                    disabled={generating === registration.user_id}
                                                >
                                                    {generating === registration.user_id ? 'Generating...' : 'Generate'}
                                                </Button>
                                            )}
                                            {registration.hasCertificate && (
                                                <Chip
                                                    label="✓ Generated"
                                                    color="success"
                                                    size="small"
                                                />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredRegistrations.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </>
            )}

            {/* Bulk Generate Confirmation Dialog */}
            <Dialog open={openBulkDialog} onClose={() => setOpenBulkDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Bulk Generate Certificates</DialogTitle>
                <DialogContent>
                    <Typography>
                        This will generate certificates for all attendees who don't have one yet.
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                        Only students marked as "present" will receive certificates.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBulkDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleBulkGenerate}
                        variant="contained"
                        disabled={bulkGenerating}
                        startIcon={bulkGenerating ? <CircularProgress size={20} /> : <AutorenewIcon />}
                    >
                        {bulkGenerating ? 'Generating...' : 'Generate'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default EventRegistrations;
