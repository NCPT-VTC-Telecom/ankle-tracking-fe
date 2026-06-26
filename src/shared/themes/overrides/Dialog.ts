// material-ui
import { alpha, Theme } from '@mui/material/styles';

// ==============================|| OVERRIDES - DIALOG ||============================== //

export default function Dialog(theme: Theme) {
  const isDark = theme.palette.mode === 'dark';


  return {
    MuiDialog: {
      styleOverrides: {
        root: {
          '& .MuiBackdrop-root': {
            backgroundColor: isDark
              ? alpha(theme.palette.common.black, 0.7)
              : alpha(theme.palette.common.black, 0.4)
          }
        },
        paper: {
          backgroundImage: "linear-gradient(rgba(255,255,255,0.05), rgba(255,255,255,0.05))",
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          padding: 0,
          borderRadius: theme.shape.borderRadius * 2,
          boxShadow: isDark
            ? '0 8px 24px rgba(0, 0, 0, 0.6)'
            : '0 8px 24px rgba(0, 0, 0, 0.15)',
          transition: 'transform 225ms, background-color 0.3s ease',
          [theme.breakpoints.down('sm')]: {
            margin: 8,
            width: 'calc(100% - 16px)',
            maxWidth: '100%'
          }
        }
      }
    }
  };
}
