import { Box, useTheme } from '@mui/material';
import { Tooltip } from '@mui/material';
import useConfig from 'hooks/useConfig';
import { Moon, Sun1 } from 'iconsax-react';
import { ThemeMode } from 'types';

export default function ToggleThemeButton() {
  const { mode, onChangeMode } = useConfig();
  const theme = useTheme();
  const handleToggle = () => {
    if (mode === ThemeMode.LIGHT) {
      onChangeMode(ThemeMode.DARK);
    } else if (mode === ThemeMode.DARK) {
      onChangeMode(ThemeMode.AUTO);
    } else {
      onChangeMode(ThemeMode.LIGHT);
    }
  };

  const getTooltipTitle = () => {
    if (mode === ThemeMode.LIGHT) return 'Chuyển sang chế độ tối';
    if (mode === ThemeMode.DARK) return 'Chuyển sang chế độ hệ thống';
    return 'Chuyển sang chế độ sáng';
  };

  const isCurrentLight = theme.palette.mode === 'light';

  return (
    <Tooltip disableInteractive enterTouchDelay={0} leaveTouchDelay={200} title={getTooltipTitle()}>
      <Box
        onClick={handleToggle}
        sx={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 44,
          width: 44,
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
      >
        {isCurrentLight ? (
          <Moon variant="Bold" size={24} color={theme.palette.secondary.main} />
        ) : (
          <Sun1 variant="Bold" size={24} color={theme.palette.warning.dark} />
        )}
      </Box>
    </Tooltip>
  );
}
