import { useEffect, useMemo, useState } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import useConfig from 'shared/hooks/useConfig';
import { ThemeMode } from 'shared/types/config';

import SimulatorSection from './SimulatorSection';

/**
 * Trang GPS Simulator — route riêng /gosafe/simulator (AuthGuard, KHÔNG hiện ở sidebar).
 * Tái sử dụng bản đồ + store theo dõi (useTracking) nhưng cho phép chỉnh marker và
 * cập nhật dữ liệu giả qua GPS Simulator API (position / sos / route).
 */
export default function GosafeSimulator() {
  const { mode } = useConfig();
  const [isDark, setIsDark] = useState(() => {
    if (mode === ThemeMode.AUTO) return window.matchMedia('(prefers-color-scheme: dark)').matches;
    return mode === ThemeMode.DARK;
  });
  const primaryColor = '#2772ed';
  const secondaryColor = '#4a90e2';

  useEffect(() => {
    const updateTheme = () => {
      if (mode === ThemeMode.AUTO) setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      else setIsDark(mode === ThemeMode.DARK);
    };
    updateTheme();
    if (mode === ThemeMode.AUTO) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => updateTheme();
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? 'dark' : 'light',
          primary: { main: '#2d5eaf' },
          secondary: { main: secondaryColor },
          background: {
            default: isDark ? '#020617' : '#ffffff',
            paper: isDark ? '#0f172a' : '#ffffff'
          },
          text: {
            primary: isDark ? '#f8fafc' : '#0f172a',
            secondary: isDark ? '#94a3b8' : '#64748b'
          }
        },
        typography: { fontFamily: 'Inter var' },
        shape: { borderRadius: 6 },
        components: {
          MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 8 } } }
        }
      }),
    [isDark]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: 'background.default', height: '100vh', overflow: 'hidden' }}>
        <SimulatorSection isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />
      </Box>
    </ThemeProvider>
  );
}
