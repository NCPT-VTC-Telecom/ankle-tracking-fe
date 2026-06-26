import { ComponentClass, FunctionComponent } from 'react';

// material-ui
import { SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';

// third-party
import { Icon } from 'iconsax-react';

// ==============================|| TYPES - ROOT  ||============================== //

export type KeyedObject = {
  [key: string]: string | number | KeyedObject | any;
};

export type OverrideIcon =
  | (OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & {
      muiName: string;
    })
  | ComponentClass<any>
  | FunctionComponent<any>
  | Icon;

export interface GenericCardProps {
  title?: string;
  primary?: string;
  secondary?: string | number | any;
  content?: string;
  image?: string;
  dateTime?: string;
  iconPrimary?: OverrideIcon;
  color?: string;
  size?: string;
  revenueBefore?: string | number;
  revenueAfter?: string | number;
  percentage?: number | string;
  isLoss?: boolean;
  isShowRevenue?: boolean;
  url?: string;
  unit?: string;
}
