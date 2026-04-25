import React from 'react';
import { Container, Box, Typography, Paper, Grid, Card, CardContent, Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

export default function TestDashboard() {
    const { user } = useAuth();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Typography variant="h3">🎓 Admin Dashboard</Typography>
                <Typography variant="h6">Welcome, {user?.name || 'Admin'}!</Typography>
            </Paper>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Events
                            </Typography>
                            <Typography variant="h4">0</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Pending Approvals
                            </Typography>
                            <Typography variant="h4">0</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Users
                            </Typography>
                            <Typography variant="h4">1</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="h5">Dashboard is working! ✅</Typography>
                <Typography variant="body1">Your portal is ready to use.</Typography>
            </Box>
        </Container>
    );
}
