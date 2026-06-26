// material-ui
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

// project-imports
import DrawerHeaderStyled from './DrawerHeaderStyled';

import Logo from 'shared/components/atoms/logo';
import { DRAWER_WIDTH, HEADER_HEIGHT } from 'config';
import useConfig from 'shared/hooks/useConfig';

// types
import { MenuOrientation } from 'shared/types/config';

// ==============================|| DRAWER HEADER ||============================== //

interface Props {
  open: boolean;
}

const DrawerHeader = ({ open }: Props) => {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));

  const { menuOrientation } = useConfig();
  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  return (
    <DrawerHeaderStyled
      theme={theme}
      open={open}
      sx={{
        minHeight: isHorizontal ? 'unset' : HEADER_HEIGHT,
        width: isHorizontal ? { xs: '100%', lg: DRAWER_WIDTH + 50 } : 'inherit',
        paddingTop: isHorizontal ? { xs: '10px', lg: '0' } : '8px',
        paddingBottom: isHorizontal ? { xs: '18px', lg: '0' } : '8px',
        paddingLeft: isHorizontal ? { xs: '24px', lg: '0' } : open ? '24px' : 0,
        paddingRight: isHorizontal ? { xs: '24px', lg: '0' } : open ? '24px' : 0
      }}
    >
      <Logo isIcon={!open} sx={{ margin: 'auto', width: open ? 'auto' : 52, height: 'auto' }} />
    </DrawerHeaderStyled>
  );
};

export default DrawerHeader;
