// material-ui
import { Theme } from '@mui/material/styles';

// ==============================|| OVERRIDES - TOOLTIP ||============================== //

export default function Tooltip(theme: Theme) {
  return {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          color: theme.palette.common.white,
          backgroundColor:
            theme.palette.mode === 'dark'
              ? theme.palette.grey[800]
              : theme.palette.grey[900],
        }
      }
    }
  };
}
