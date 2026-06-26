// material-ui
import { useTheme } from '@mui/material/styles';
import { SxProps, Theme } from '@mui/system';

import { Box } from '@mui/material';

// project-imports
import { ColorProps } from 'shared/types/extended';
import { getColors } from 'shared/utils/getColors';

// ==============================|| DOT - EXTENDED ||============================== //

interface Props {
  color?: ColorProps;
  size?: number;
  variant?: string;
  sx?: SxProps<Theme>; // update this line
  componentDiv?: boolean;
}

const Dot = ({ color, size, variant, sx, componentDiv }: Props) => {
  const theme = useTheme();
  const colors = getColors(theme, color || 'primary');
  const { main } = colors;

  return (
    <Box
      component={componentDiv ? 'div' : 'span'}
      sx={
        {
          width: size || 8,
          height: size || 8,
          borderRadius: '50%',
          bgcolor: variant === 'outlined' ? 'transparent' : main, // changed from '' to 'transparent'
          ...(variant === 'outlined' ? { border: `1px solid ${main}` } : {}),
          ...sx
        } as SxProps<Theme>
      }
    />
  );
};

export default Dot;
