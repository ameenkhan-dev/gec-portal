import React, { useEffect } from 'react';
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
  alpha,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  EventNote, 
  AppRegistration, 
  EmojiEvents, 
  Security,
  ArrowForward,
  VerifiedUser
} from '@mui/icons-material';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (user) return null;

  return (
    <Box sx={{ minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Animated gradient background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(-45deg, 
            ${theme.palette.primary.main}, 
            ${theme.palette.secondary.main}, 
            ${theme.palette.success.main}, 
            ${theme.palette.info.main})`,
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
          zIndex: -1,
          '@keyframes gradientShift': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
        }}
      />

      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 6, md: 12 },
          color: '#fff',
          backdropFilter: 'blur(5px)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 50%, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 50%),
                         radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.2)} 0%, transparent 50%)`,
            zIndex: -1,
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Animated badge */}
          <Box
            sx={{
              display: 'inline-block',
              mb: 3,
              animation: 'float 3s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-20px)' },
              },
            }}
          >
            <Chip
              icon={<VerifiedUser />}
              label="The Ultimate Event Portal"
              sx={{
                background: alpha(theme.palette.common.white, 0.2),
                backdropFilter: 'blur(10px)',
                border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
                color: '#fff',
                fontSize: '1rem',
                padding: '24px 12px',
                height: 'auto',
                '& .MuiChip-icon': { color: '#fff' },
              }}
            />
          </Box>

          {/* Main heading */}
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 3,
              textShadow: `0 0 30px ${alpha(theme.palette.common.white, 0.3)}`,
              letterSpacing: '-2px',
              animation: 'slideDown 0.8s ease-out',
              '@keyframes slideDown': {
                from: { opacity: 0, transform: 'translateY(-30px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            Discover & Connect
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 300,
              mb: 4,
              opacity: 0.95,
              animation: 'slideUp 0.8s ease-out 0.2s both',
              '@keyframes slideUp': {
                from: { opacity: 0, transform: 'translateY(30px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            Join thousands of students at exciting college events. Register, attend, and earn certificates.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{
              animation: 'slideUp 0.8s ease-out 0.4s both',
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              endIcon={<ArrowForward />}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                boxShadow: `0 8px 24px ${alpha('#667eea', 0.4)}`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 32px ${alpha('#667eea', 0.6)}`,
                },
              }}
            >
              Login Now
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: '#fff',
                borderColor: alpha('white', 0.5),
                background: alpha('white', 0.1),
                backdropFilter: 'blur(10px)',
                border: `2px solid ${alpha('white', 0.3)}`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  borderColor: 'white',
                  background: alpha('white', 0.15),
                  transform: 'translateY(-4px)',
                },
              }}
            >
              Sign Up
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            mb: 2,
            fontWeight: 'bold',
            color: theme.palette.text.primary,
          }}
        >
          Why Choose GEC Portal?
        </Typography>
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            mb: 6,
            color: alpha(theme.palette.text.primary, 0.7),
            fontWeight: 300,
          }}
        >
          Everything you need to make the most of your college experience
        </Typography>

        <Grid container spacing={3}>
          {[
            {
              icon: <EventNote sx={{ fontSize: 48 }} />,
              title: 'Event Discovery',
              description: 'Browse hundreds of college events with detailed information and real-time updates.',
              color: 'primary'
            },
            {
              icon: <AppRegistration sx={{ fontSize: 48 }} />,
              title: 'One-Click Registration',
              description: 'Register for events instantly and manage all registrations in one place.',
              color: 'secondary'
            },
            {
              icon: <EmojiEvents sx={{ fontSize: 48 }} />,
              title: 'Earn Certificates',
              description: 'Attend events and automatically receive digital certificates.',
              color: 'success'
            },
            {
              icon: <Security sx={{ fontSize: 48 }} />,
              title: 'Secure Platform',
              description: 'Your data is protected with modern security standards.',
              color: 'warning'
            },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette[feature.color].main, 0.1)} 0%, ${alpha(theme.palette[feature.color].main, 0.05)} 100%)`,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette[feature.color].main, 0.2)}`,
                  borderRadius: '16px',
                  p: 3,
                  textAlign: 'center',
                  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-16px)',
                    boxShadow: `0 20px 40px ${alpha(theme.palette[feature.color].main, 0.3)}`,
                    background: `linear-gradient(135deg, ${alpha(theme.palette[feature.color].main, 0.15)} 0%, ${alpha(theme.palette[feature.color].main, 0.08)} 100%)`,
                    borderColor: theme.palette[feature.color].main,
                  },
                }}
              >
                <Box
                  sx={{
                    color: theme.palette[feature.color].main,
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    animation: 'bounce 2s ease-in-out infinite',
                    animationDelay: `${index * 0.1}s`,
                    '@keyframes bounce': {
                      '0%, 100%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-12px)' },
                    },
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    mb: 1,
                    color: theme.palette.text.primary,
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: alpha(theme.palette.text.primary, 0.7),
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          position: 'relative',
          py: 8,
          backdropFilter: 'blur(5px)',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              color: theme.palette.text.primary,
            }}
          >
            Ready to Join the Community?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: alpha(theme.palette.text.primary, 0.7),
              fontWeight: 300,
            }}
          >
            Start exploring amazing events and make unforgettable memories with your college community.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              py: 1.5,
              px: 5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
              boxShadow: `0 8px 24px ${alpha('#667eea', 0.4)}`,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 32px ${alpha('#667eea', 0.6)}`,
              },
            }}
          >
            Create Account
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
