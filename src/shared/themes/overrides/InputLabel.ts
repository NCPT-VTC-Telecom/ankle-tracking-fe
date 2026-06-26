import { Theme } from '@mui/material/styles';

export default function InputLabel(theme: Theme) {
  return {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: theme.palette.secondary.main,
        },
        outlined: {
          // Vị trí khi bình thường (label chưa shrink)
          '&.MuiInputLabel-outlined': {
            transform: 'translate(14px, 10px) scale(1)',
            transition: 'transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms', // giữ animation
          },

          // Vị trí khi có size nhỏ
          '&.MuiInputLabel-sizeSmall.MuiInputLabel-outlined': {
            transform: 'translate(14px, 10px) scale(1)',
          },

          // Khi label "shrink" (Select mở hoặc có value)
          '&.MuiInputLabel-shrink': {
            backgroundColor: theme.palette.mode === "dark" ? "" : "white",
            padding: '0 6px',
            marginLeft: -4,
            lineHeight: '1.4375em',
            transform: 'translate(14px, -9px) scale(0.75)',
            zIndex: 1,
          },
        },
      },
    },
  };
}
