// material-ui
import Drawer from '@mui/material/Drawer';
import { CSSObject, styled, Theme } from '@mui/material/styles';

// project-imports
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from 'config';

// types
import { ThemeMode } from 'shared/types/config';

const openedMixin = (theme: Theme): CSSObject => ({
  backgroundColor: theme.palette.mode === ThemeMode.DARK ? 'rgba(28, 28, 30, 0.65)' : 'rgba(255, 255, 255, 0.45)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  width: DRAWER_WIDTH,
  borderRight: 'none',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  overflowX: 'visible',
  overflowY: 'visible',
  boxShadow: theme.palette.mode === ThemeMode.DARK 
    ? '0 8px 32px 0 rgba(0, 0, 0, 0.35)' 
    : '0 8px 32px 0 rgba(31, 38, 135, 0.06)'
});

const closedMixin = (theme: Theme): CSSObject => ({
  backgroundColor: theme.palette.mode === ThemeMode.DARK ? 'rgba(28, 28, 30, 0.65)' : 'rgba(255, 255, 255, 0.45)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  overflowX: 'visible',
  overflowY: 'visible',
  width: MINI_DRAWER_WIDTH,
  borderRight: 'none',
  boxShadow: theme.palette.mode === ThemeMode.DARK 
    ? '0 8px 32px 0 rgba(0, 0, 0, 0.35)' 
    : '0 8px 32px 0 rgba(31, 38, 135, 0.06)'
});

// ==============================|| DRAWER - MINI STYLED ||============================== //

const MiniDrawerStyled = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme)
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme)
  })
}));

export default MiniDrawerStyled;
