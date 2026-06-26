import { ReactNode, useMemo, useState, useEffect } from 'react';

// material-ui
import { CssBaseline, StyledEngineProvider, ThemeProvider, createTheme, Theme, ThemeOptions } from '@mui/material';
import { ConfigProvider as AntdConfigProvider } from 'antd';

// project-imports
import Palette from './palette';
import Typography from './typography';
import CustomShadows from './shadows';
import componentsOverride from './overrides';

import useConfig from 'shared/hooks/useConfig';

// types
import { ThemeMode } from 'shared/types/config';
import { CustomShadowProps } from 'shared/types/theme';
import ScrollbarStyles from './overrides/ScrollbarStyle';
import { HEADER_HEIGHT } from 'config';

type ThemeCustomizationProps = {
  children: ReactNode;
};

// ==============================|| DEFAULT THEME - MAIN  ||============================== //
export default function ThemeCustomization({ children }: ThemeCustomizationProps) {
  const { themeDirection, mode, presetColor, fontFamily, themeContrast } = useConfig();

  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    if (mode !== ThemeMode.AUTO) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemDark(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  let themeMode = mode;
  if (themeMode === ThemeMode.AUTO) {
    themeMode = systemDark ? ThemeMode.DARK : ThemeMode.LIGHT;
  }

  // MUI theme
  const theme: Theme = useMemo(() => Palette(themeMode, presetColor, themeContrast), [themeMode, presetColor, themeContrast]);
  const themeTypography = useMemo(() => Typography(themeMode, fontFamily, theme), [themeMode, fontFamily, theme]);
  const themeCustomShadows: CustomShadowProps = useMemo(() => CustomShadows(theme), [theme]);

  const themeOptions: ThemeOptions = useMemo(
    () => ({
      breakpoints: {
        values: { xs: 0, sm: 768, md: 1024, lg: 1266, xl: 1536 }
      },
      direction: themeDirection,
      mixins: { toolbar: { minHeight: HEADER_HEIGHT, paddingTop: 8, paddingBottom: 8 } },
      palette: theme.palette,
      shape: { borderRadius: 8 },
      customShadows: themeCustomShadows,
      typography: themeTypography
    }),
    [themeDirection, theme, themeTypography, themeCustomShadows]
  );

  const themes: Theme = createTheme(themeOptions);
  themes.components = componentsOverride(themes);

  // AntD theme tokens dựa trên MUI theme
  const antdTheme = useMemo(
    () => ({
      token: {
        // Global token (optional, để sync màu primary/text)
        // colorPrimary: theme.palette.text.primary,
        colorTextPlaceholder: '#999999', // màu chữ placeholder
        colorBgContainer: theme.palette.action.selected, // nền input
        colorText: theme.palette.text.primary,
        colorTextDisabled: '#777777',
        colorBgElevated: theme.palette.background.paper, // nền popup datepicker, dropdown...
        colorSplit: theme.palette.divider, // viền separator trong DatePicker
        colorIcon: theme.palette.divider, // màu icon
        colorIconHover: theme.palette.primary.main, // màu icon khi hover
        controlItemBgActive: theme.palette.primary.main // màu icon khi hover
        // Component token riêng cho DatePicker
      },
      components: {
        DatePicker: {
          colorText: theme.palette.text.primary,
          colorBgContainer: 'transparent',
          colorBorder: themeMode === ThemeMode.DARK ? '#ffffff3b' : theme.palette.secondary[400],
          activeBorderColor: theme.palette.primary.main,
          hoverBorderColor: theme.palette.primary.light,
          activeShadow: 'none',
          cellActiveWithRangeBg: theme.palette.primary.light,
          cellHoverWithRangeBg: 'red',
          cellRangeBorderColor: 'blue',
          colorSplit: theme.palette.divider, // viền separator trong DatePicker
          colorIcon: theme.palette.text.primary // màu icon
        }
      }
    }),
    [theme]
  );

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes}>
        <AntdConfigProvider theme={antdTheme}>
          <CssBaseline />
          <ScrollbarStyles />
          {children}
        </AntdConfigProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
