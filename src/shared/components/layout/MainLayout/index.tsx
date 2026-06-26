import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

// material-ui
import { Box, Container, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project-imports
import Drawer from './Drawer';
import Header from './Header';
// import Footer from './Footer';
import Breadcrumbs from 'shared/components/@extended/Breadcrumbs';
import HorizontalBar from './Drawer/HorizontalBar';

import useConfig from 'shared/hooks/useConfig';
import navigation from 'shared/menu-items';
import { dispatch } from 'shared/store';
import { openDrawer } from 'shared/store/reducers/menu';

// types
import { MenuOrientation } from 'shared/types/config';

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
  const theme = useTheme();
  const downXL = useMediaQuery(theme.breakpoints.down('xl'));
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));

  const { container, miniDrawer, menuOrientation } = useConfig();

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  // set media wise responsive drawer
  useEffect(() => {
    if (!miniDrawer) {
      dispatch(openDrawer(!downXL));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downXL]);

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Header />
      {!isHorizontal ? <Drawer /> : <HorizontalBar />}

      <Box
        component="main"
        sx={{
          width: '100%',
          flexGrow: 1,
          pt: '76px',
          pb: 2,
          px: downLG ? 2 : 3,
          transition: theme.transitions.create('padding', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
          }),
          overflow: 'hidden'
        }}
      >
        <Container
          maxWidth={container ? 'xl' : false}
          sx={{
            px: '0px !important',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Breadcrumbs navigation={navigation} title titleBottom card={false} divider={false} />
          <Outlet />
          {/* <Footer /> */}
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
