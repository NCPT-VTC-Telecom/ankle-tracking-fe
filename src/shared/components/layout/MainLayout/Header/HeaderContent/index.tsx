// material-ui
import { useMediaQuery } from '@mui/material';
import { Theme } from '@mui/material/styles';

// project-imports
// import Search from './Search';
// import Message from './Message';
import Localization from './Localization';
import Notification from './Notification';
import Profile from './Profile';
// import MegaMenuSection from './MegaMenuSection';

import useConfig from 'shared/hooks/useConfig';
import DrawerHeader from 'shared/components/layout/MainLayout/Drawer/DrawerHeader';

// type
import DateTimeDisplay from 'shared/components/atoms/DateTimeDisplay';
import { MenuOrientation } from 'shared/types/config';
import ToggleThemeButton from 'shared/components/molecules/button/ToggleThemeButton';

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const { menuOrientation } = useConfig();

  const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  return (
    <>
      <div>{menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}</div>
      {/* {!downLG && <NameApp />} */}
      {/* {!downLG && megaMenu} */}
      <div className="flex items-center gap-2 md:gap-3">
        <DateTimeDisplay />
        <Localization />
        <ToggleThemeButton />
        <Notification />
        <Profile />
      </div>
    </>
  );
};

export default HeaderContent;
