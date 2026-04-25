import { createTheme, alpha } from '@mui/material/styles';

const getDesignTokens = (mode = 'light') => ({
  palette: {
    mode,
    primary: {
      main: '#0B5ED7',
      light: '#4D8EF7',
      dark: '#003C9E',
    },
    secondary: {
      main: '#14B8A6',
      light: '#5EEAD4',
      dark: '#0F766E',
    },
    background: {
      default: mode === 'light' ? '#F4F7FB' : '#0F172A',
      paper: mode === 'light' ? '#FFFFFF' : '#111827',
    },
    success: { main: '#22C55E' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
  },
  typography: {
    fontFamily: "'Inter', 'Poppins', 'Roboto', sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 16,
          transition: 'all 0.25s ease',
          border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 16,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'medium',
      },
    },
  },
});

export const createAppTheme = (mode = 'light') => createTheme(getDesignTokens(mode));
