import { Box, useTheme } from '@mui/material';
import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/vi';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

const DateTimeDisplay = () => {
  const intl = useIntl();
  const i18n = intl.locale; // 'vi' hoặc 'en'
  const theme = useTheme();

  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = i18n === 'vi' ? now.format('HH:mm:ss') : now.format('hh:mm:ss A');

  return (
    <Box
      sx={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 1.5,
        borderRadius: '50%',
        backdropFilter: 'blur(6px)',
        bgcolor: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(30,30,30,0.8)',
        border: `1px solid ${theme.palette.mode === 'light' ? theme.palette.divider : 'rgba(255,255,255,0.12)'}`,
        boxShadow: theme.palette.mode === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.4)',
        '&:hover': {
          bgcolor: theme.palette.mode === 'light' ? 'rgba(255,255,255,1)' : 'rgba(50,50,50,0.9)',
          boxShadow: theme.palette.mode === 'light' ? '0 2px 6px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.6)'
        }
      }}
      className="hidden
        md:flex items-center justify-center
        px-3 h-11 
       rounded-full hover:shadow-md transition-shadow duration-300
      "
    >
      <div>
        <Typography
          sx={{
            color: theme.palette.mode === 'light' ? theme.palette.text.secondary : theme.palette.text.primary
          }}
          variant="body2"
          className="text-base font-semibold tracking-wide font-mono"
        >
          {timeStr}
        </Typography>
      </div>
    </Box>
  );
};

export default DateTimeDisplay;
