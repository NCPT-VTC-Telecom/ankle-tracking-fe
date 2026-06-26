/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoIconDark from 'assets/images/logo-icon-dark.svg';
 * import logoIcon from 'assets/images/logo-icon.svg';
 *
 */

import settings from 'settings';

// ==============================|| LOGO ICON SVG ||============================== //

const LogoIcon = () => {
  return <img src={settings.logoDefault} alt="VTC Telecom" className="w-full" />;
};

export default LogoIcon;
