import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Landing = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();

  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: alpha('#fff', 0.1),
            top: '-100px',
            right: '-100px',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: alpha('#fff', 0.05),
            bottom: '-50px',
            left: '-50px',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                }}
              >
                GEC Event Portal
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  opacity: 0.95,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  fontWeight: 300,
                }}
              >
                Discover, Register & Manage College Events Seamlessly
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: 'white',
                    color: theme.palette.primary.main,
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: theme.palette.grey[100],
                    },
                  }}
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: alpha('#fff', 0.1),
                    },
                  }}
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  fontSize: '120px',
                  textAlign: 'center',
                  opacity: 0.8,
                }}
              >
                📅
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            mb: 6,
            fontWeight: 'bold',
          }}
        >
          Why Choose GEC Portal?
        </Typography>

        <Grid container spacing={3}>
          {[
            {
              icon: '🎯',
              title: 'Discover Events',
              description: 'Browse upcoming college events and find what interests you',
            },
            {
              icon: '🎫',
              title: 'Easy Registration',
              description: 'Register for events with just one click',
            },
            {
              icon: '📊',
              title: 'Track Attendance',
              description: 'Keep track of your event attendance and certificates',
            },
            {
              icon: '🏆',
              title: 'Get Certificates',
              description: 'Earn and download certificates for completed events',
            },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  },
                }}
              >
                <CardContent sx={{ py: 4 }}>
                  <Box sx={{ fontSize: '48px', mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          py: 8,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
            Ready to Join?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem' }}>
            Start discovering amazing events at your college today!
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ px: 4, py: 1.5 }}
            onClick={() => navigate('/register')}
          >
            Get Started
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
