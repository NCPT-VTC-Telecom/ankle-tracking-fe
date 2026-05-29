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
import { dispatch, useSelector } from 'store';
import { openDrawer } from 'store/reducers/menu';

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
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
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
                right: -20,
                zIndex: 20,
                transform: 'translateY(-50%)',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                borderRadius: '50%',
                boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.45)}`,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-50%) scale(1.12)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`
                },
                '&:active': {
                  transform: 'translateY(-50%) scale(0.95)'
                }
              }}
              onClick={() => dispatch(openDrawer(!drawerOpen))}
            >
              {!drawerOpen ? (
                <ArrowRight2 size={20} color="#fff" />
              ) : (
                <ArrowLeft2 size={20} color="#fff" />
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
