import { useMemo } from 'react';

// material-ui
import { alpha, Box, Drawer, Tooltip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project-imports
import DrawerContent from './DrawerContent';
import DrawerHeader from './DrawerHeader';
import MiniDrawerStyled from './MiniDrawerStyled';

import { DRAWER_WIDTH } from 'config';
import { ArrowLeft2, ArrowRight2 } from 'iconsax-react';
import { dispatch, useSelector } from 'shared/store';
import { openDrawer } from 'shared/store/reducers/menu';
import { ThemeMode } from 'shared/types/config';

// ==============================|| MAIN LAYOUT - DRAWER ||============================== //

interface Props {
  window?: () => Window;
}

const MainDrawer = ({ window }: Props) => {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));

  const { drawerOpen } = useSelector((state) => state.menu);

  // responsive drawer container
  const container = window !== undefined ? () => window().document.body : undefined;

  // header content
  const drawerContent = useMemo(() => <DrawerContent />, []);
  const drawerHeader = useMemo(() => <DrawerHeader open={drawerOpen} />, [drawerOpen]);

  return (
    <div className="lg:pl-5">
      {!downLG ? (
        <MiniDrawerStyled
          variant="permanent"
          open={drawerOpen}
          sx={{
            '& .MuiDrawer-paper': {
              position: 'fixed',
              top: '16px',
              left: '16px',
              bottom: '16px',
              height: 'calc(100vh - 32px)',
              borderRadius: '24px',
              boxShadow: theme.palette.mode === ThemeMode.DARK 
                ? '0 8px 32px 0 rgba(0, 0, 0, 0.35)' 
                : '0 8px 32px 0 rgba(31, 38, 135, 0.06)',
              border: `1px solid ${
                theme.palette.mode === ThemeMode.DARK 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(255, 255, 255, 0.45)'
              }`,
              background: theme.palette.mode === ThemeMode.DARK 
                ? 'rgba(28, 28, 30, 0.65)' 
                : 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }
          }}
        >
          {/* Toggle Button */}
          <Tooltip title={drawerOpen ? 'Thu gọn menu' : 'Mở rộng menu'} placement="right" arrow>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                right: -18,
                zIndex: 20,
                transform: 'translateY(-50%)',
                background: theme.palette.mode === ThemeMode.DARK 
                  ? 'rgba(40, 40, 42, 0.75)' 
                  : 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${
                  theme.palette.mode === ThemeMode.DARK 
                    ? 'rgba(255, 255, 255, 0.12)' 
                    : 'rgba(0, 0, 0, 0.08)'
                }`,
                borderRadius: '50%',
                boxShadow: theme.palette.mode === ThemeMode.DARK 
                  ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.08)',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                color: theme.palette.mode === ThemeMode.DARK ? '#fff' : '#1c1c1e',
                '&:hover': {
                  transform: 'translateY(-50%) scale(1.1)',
                  background: theme.palette.primary.main,
                  color: '#fff',
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.45)}`
                },
                '&:active': {
                  transform: 'translateY(-50%) scale(0.95)'
                }
              }}
              onClick={() => dispatch(openDrawer(!drawerOpen))}
            >
              {!drawerOpen ? (
                <ArrowRight2 size={18} color="currentColor" />
              ) : (
                <ArrowLeft2 size={18} color="currentColor" />
              )}
            </Box>
          </Tooltip>
          {drawerHeader}
          {drawerContent}
        </MiniDrawerStyled>
      ) : (
        <Drawer
          container={container}
          variant="temporary"
          open={drawerOpen}
          onClose={() => dispatch(openDrawer(!drawerOpen))}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: `1px solid ${theme.palette.divider}`,
              backgroundImage: 'none',
              boxShadow: 'inherit',
              overflowX: 'hidden'
            }
          }}
        >
          {drawerHeader}
          {drawerContent}
        </Drawer>
      )}
    </div>
  );
};

export default MainDrawer;
