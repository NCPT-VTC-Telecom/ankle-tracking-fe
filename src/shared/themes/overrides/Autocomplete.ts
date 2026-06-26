// ==============================|| OVERRIDES - AUTOCOMPLETE ||============================== //

import { Theme } from "@mui/material/styles";

export default function Autocomplete(theme: Theme) {
  return {
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            padding: '3px 9px',
            fontSize: '14px',
          },
          '& .MuiInputBase-input': {
            fontSize: '14px',
          }
        },
        popupIndicator: {
          width: 'auto',
          height: 'auto'
        },
        clearIndicator: {
          width: 'auto',
          height: 'auto'
        },
        option: {
          fontSize: '14px'
        }
      }
    }
  };
}
