import './gosafe.css';
import { Box, CssBaseline, ThemeProvider, createTheme, Fab, Zoom, useScrollTrigger } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import useConfig from 'hooks/useConfig';
import { ThemeMode } from 'types/config';
import { ArrowUp } from 'iconsax-react';
import { useNavigate } from 'react-router-dom';
import useAuth from 'hooks/useAuth';

// Components
import GosafeNavbar from './components/GosafeNavbar';
import HeroSection from './sections/HeroSection';
import SolutionsSection from './sections/SolutionsSection';
import ProductsSection from './sections/ProductsSection';
import SpecsSection from './sections/SpecsSection';
import ContactSection from './sections/ContactSection';
import FAQSection from './sections/FAQSection';
import { faqsGosafe } from 'pages/landing/data';
import Footer from './sections/Footer';
import TrackingSection from './sections/TrackingSection';

function ScrollTop(props: { children: React.ReactElement }) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100
  });

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Zoom in={trigger}>
      <Box onClick={handleClick} role="presentation" sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 999 }}>
        {props.children}
      </Box>
    </Zoom>
  );
}

interface GosafeLandingProps {
  viewType?: 'landing' | 'tracking';
}

const GosafeLanding = ({ viewType = 'landing' }: GosafeLandingProps) => {
  const { onChangeMode, mode, onChangeLocalization, i18n } = useConfig();
  const [isDark, setIsDark] = useState(mode === ThemeMode.DARK);
  const primaryColor = '#2772ed';
  const secondaryColor = '#4a90e2';
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    setIsDark(mode === ThemeMode.DARK);
  }, [mode]);

  useEffect(() => {
    if (viewType === 'landing' && isLoggedIn) {
      navigate('/gosafe/tracking', { replace: true });
    }
  }, [viewType, isLoggedIn, navigate]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? 'dark' : 'light',
          primary: {
            main: '#2d5eaf'
          },
          secondary: {
            main: '#4a90e2'
          },
          background: {
            default: isDark ? '#020617' : '#ffffff',
            paper: isDark ? '#0f172a' : '#ffffff'
          },
          text: {
            primary: isDark ? '#f8fafc' : '#0f172a',
            secondary: isDark ? '#94a3b8' : '#64748b'
          }
        },
        typography: {
          fontFamily: 'Inter var',
          h1: { fontWeight: 800 },
          h2: { fontWeight: 700 },
          h3: { fontWeight: 700 },
          button: { fontWeight: 600 }
        },
        shape: {
          borderRadius: 6
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: 8
              }
            }
          }
        }
      }),
    [isDark]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          bgcolor: 'background.default',
          minHeight: '100vh',
          overflowX: 'hidden',
          ...(viewType === 'tracking' && {
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'hidden'
          })
        }}
      >
        {viewType === 'landing' && (
          <GosafeNavbar
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            isDark={isDark}
            currentLang={i18n}
            onToggleTheme={() => onChangeMode(mode === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK)}
            onToggleLanguage={() => onChangeLocalization(i18n === 'vi' ? 'en' : 'vi')}
            activeView={viewType}
            onViewChange={(v) => navigate(v === 'tracking' ? '/gosafe/tracking' : '/gosafe')}
          />
        )}

        {viewType === 'landing' ? (
          <>
            <SolutionsSection isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />
            <HeroSection isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />
            <ProductsSection isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />
            <SpecsSection isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />
            <FAQSection faqs={faqsGosafe} isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />

            <ContactSection isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />
            <Footer isDark={isDark} primaryColor={primaryColor} />

            <ScrollTop>
              <Fab
                size="medium"
                aria-label="scroll back to top"
                sx={{
                  bgcolor: primaryColor,
                  color: '#fff',
                  '&:hover': { bgcolor: secondaryColor }
                }}
              >
                <ArrowUp />
              </Fab>
            </ScrollTop>
          </>
        ) : (
          <TrackingSection isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />
        )}
      </Box>
    </ThemeProvider>
  );
};

export default GosafeLanding;
