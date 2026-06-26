import { GlobalStyles, useTheme } from '@mui/material';

export default function ScrollbarStyles() {
  const theme = useTheme();

  return (
    <GlobalStyles
      styles={{
        '::-webkit-scrollbar': {
          width: '4px',
          height: '4px'
        },
        '::-webkit-scrollbar-track': {
          background: 'transparent'
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[400],
          borderRadius: '9999px'
        },
        '::-webkit-scrollbar-thumb:hover': {
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[500]
        }
      }}
    />
  );
}
