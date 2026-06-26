
// ==============================|| LOGO SVG ||============================== //

import settings from "settings";

const LogoMain = ({ reverse, ...others }: { reverse?: boolean }) => {
  return <img src={settings.logoDefault} alt="VTC Telecom" className="w-60" />;
};

export default LogoMain;
