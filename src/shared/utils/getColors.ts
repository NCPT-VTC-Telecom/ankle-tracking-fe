// material-ui
import { Theme } from '@mui/material/styles';

// types
import { ColorProps } from 'shared/types/extended';

// ==============================|| CUSTOM FUNCTION - COLORS ||============================== //

export const getColors = (theme: Theme, color?: ColorProps) => {
  switch (color!) {
    case 'secondary':
      return theme.palette.secondary;
    case 'error':
      return theme.palette.error;
    case 'warning':
      return theme.palette.warning;
    case 'info':
      return theme.palette.info;
    case 'success':
      return theme.palette.success;
    default:
      return theme.palette.primary;
  }
};


export const getContrastingColor = (hexColor: string) => {
  // Loại bỏ ký tự # nếu có
  const color = hexColor.replace('#', '');

  // Chuyển màu từ HEX sang RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Tính độ sáng (luminance)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Nếu sáng thì trả về màu đen, nếu tối trả về màu trắng
  return luminance > 0.5 ? 'black' : 'white';
};

