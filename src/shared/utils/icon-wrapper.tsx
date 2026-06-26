import { FC, SVGProps } from 'react';
import { Icon as IconsaxIcon } from 'iconsax-react';
import { SvgIcon } from '@mui/material';
import { OverrideIcon } from 'shared/types';

interface IconWrapperProps {
  icon: OverrideIcon;
  variant?: 'Linear' | 'Outline' | 'Broken' | 'Bold' | 'Bulk' | 'TwoTone';
  size?: number;
  color?: string;
}

// Kiểm tra xem icon có phải là Iconsax icon không
const isIconsaxIcon = (icon: any): icon is IconsaxIcon => {
  return (
    icon && typeof icon === 'object' && icon.$$typeof === Symbol.for('react.forward_ref')
    // && // Kiểm tra biểu tượng của React forwardRef
    // icon.displayName &&
    // icon.displayName.includes('Iconsax')
  );
};

const IconWrapper: FC<IconWrapperProps> = ({ icon: Icon, variant = 'Bulk', size = 22, color }) => {
  if (isIconsaxIcon(Icon)) {
    return <Icon variant={variant} size={size} color={color} />;
  }

  return (
    <SvgIcon sx={{ fontSize: size, color: color }}>
      <Icon />
    </SvgIcon>
  );
};

export default IconWrapper;

// Custom SVG Icon example
export const CustomSvgIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
