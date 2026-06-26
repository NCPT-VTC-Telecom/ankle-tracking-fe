import { ReactNode, useMemo } from 'react';

// material-ui
import { AppBar, AppBarProps, Toolbar, useMediaQuery } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

// project-imports
import AppBarStyled from './AppBarStyled';
import HeaderContent from './HeaderContent';

import { MINI_DRAWER_WIDTH, NAV_WIDTH } from 'config';
import useConfig from 'shared/hooks/useConfig';
import { dispatch, useSelector } from 'shared/store';
import { openDrawer } from 'shared/store/reducers/menu';

// assets

// types
import { HambergerMenu } from 'iconsax-react';
import { MenuOrientation } from 'shared/types/config';
import NameApp from './HeaderContent/NameApp';
import { Box } from '@mui/material';

const Header = () => {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));

  const { menuOrientation } = useConfig();
  const { drawerOpen } = useSelector((state) => state.menu);

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  // header content
  const headerContent = useMemo(() => <HeaderContent />, []);

  // const iconBackColorOpen = theme.palette.mode === ThemeMode.DARK ? 'secondary.200' : 'secondary.200';
  // const iconBackColor = theme.palette.mode === ThemeMode.DARK ? 'background.default' : 'secondary.100';

  // common header
  //bg - [url('assets/images/header/new-bg-header.jpg')];
  const mainHeader: ReactNode = (
    <Toolbar sx={{ px: downLG ? 2 : 3, py: 2 }} className="flex items-center justify-between">
      {!isHorizontal ? (
        <Box sx={{ color: 'text.secondary' }} className="flex items-center gap-2">
          <HambergerMenu size={24} className={`cursor-pointer xl:hidden`} onClick={() => dispatch(openDrawer(!drawerOpen))} />
          <NameApp />
        </Box>
      ) : null}
      {headerContent}
    </Toolbar>
  );

  // app-bar params
  const appBar: AppBarProps = {
    position: 'fixed',
    elevation: 0,
    sx: {
      bgcolor: alpha(theme.palette.background.default, 0.8),
      backdropFilter: 'blur(8px)',
      zIndex: 1200,
      width: isHorizontal
        ? '100%'
        : { xs: '100%', lg: drawerOpen ? `calc(100% - ${NAV_WIDTH}px)` : `calc(100% - ${MINI_DRAWER_WIDTH + 20}px)` }
    }
  };

  return (
    <>
      {!downLG ? (
        <AppBarStyled open={drawerOpen} {...appBar}>
          {mainHeader}
        </AppBarStyled>
      ) : (
        <AppBar {...appBar}>{mainHeader}</AppBar>
      )}
    </>
  );
};

export default Header;
