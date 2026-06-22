import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import useConfig from 'hooks/useConfig';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ThemeMode } from 'types/config';
import { benefits, comparisonData, faqs, features, integrations, useCases } from './data';

// Components
import BenefitsSection from './components/BenefitsSection';
import ComparisonTableSection from './components/ComparisonTableSection';
import ContactSection from './components/ContactSection';
import FAQSection from './components/FAQSection';
import FadeInWhenVisible from './components/FadeInWhenVisible';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import IntegrationsSection from './components/IntegrationsSection';
import MobileAppSection from './components/MobileAppSection';
import NavigationBar from './components/NavigationBar';
import PerformanceMetricsSection from './components/PerformanceMetricsSection';
import SecurityCertificationsSection from './components/SecurityCertificationsSection';
import SolutionsSection from './components/SolutionsSection';
import TrustBar from './components/TrustBar';
import VideoDemoSection from './components/VideoDemoSection';

const LandingPage = () => {
  const { onChangeMode, mode, onChangeLocalization, i18n } = useConfig();
  const [isDark, setIsDark] = useState(() => {
    if (mode === ThemeMode.AUTO) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return mode === ThemeMode.DARK;
  });

  useEffect(() => {
    const updateTheme = () => {
      if (mode === ThemeMode.AUTO) {
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      } else {
        setIsDark(mode === ThemeMode.DARK);
      }
    };

    updateTheme();

    if (mode === ThemeMode.AUTO) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [mode]);

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
          borderRadius: 12
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

  const primaryColor = '#2d5eaf';
  const secondaryColor = '#4a90e2';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Helmet>
        <title>WiFi Digital - Giải pháp quản lý WiFi toàn diện cho doanh nghiệp</title>
        <meta
          name="description"
          content="Nền tảng quản lý WiFi Marketing, định vị indoor và analytics hàng đầu Việt Nam. Tối ưu vận hành, gia tăng doanh thu cho khách sạn, bán lẻ, văn phòng."
        />
        <meta name="keywords" content="wifi marketing, wifi management, indoor positioning, wifi analytics, vtc telecom" />
        <meta property="og:title" content="WiFi Digital - Giải pháp quản lý WiFi toàn diện" />
        <meta property="og:description" content="Nền tảng quản lý WiFi Marketing, định vị indoor và analytics hàng đầu Việt Nam." />
        <meta property="og:image" content="https://wifi.vtctelecom.com.vn/share-image.jpg" />
        <meta property="og:url" content="https://wifi.vtctelecom.com.vn" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://wifi.vtctelecom.com.vn" />
      </Helmet>

      <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh', overflowX: 'hidden' }}>
        <NavigationBar
          isDark={isDark}
          primaryColor={primaryColor}
          currentLang={i18n}
          onToggleTheme={() => {
            if (mode === ThemeMode.LIGHT) {
              onChangeMode(ThemeMode.DARK);
            } else if (mode === ThemeMode.DARK) {
              onChangeMode(ThemeMode.AUTO);
            } else {
              onChangeMode(ThemeMode.LIGHT);
            }
          }}
          onToggleLanguage={() => onChangeLocalization(i18n === 'vi' ? 'en' : 'vi')}
          secondaryColor={secondaryColor}
        />

        <HeroSection isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />

        <FadeInWhenVisible>
          <TrustBar isDark={isDark} primaryColor={primaryColor} />
        </FadeInWhenVisible>

        <FadeInWhenVisible>
          <FeaturesSection features={features} isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />
        </FadeInWhenVisible>

        <FadeInWhenVisible>
          <IntegrationsSection integrations={integrations} isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />
        </FadeInWhenVisible>

        <FadeInWhenVisible>
          <MobileAppSection isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />
        </FadeInWhenVisible>

        <FadeInWhenVisible>
          <SolutionsSection useCases={useCases} isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />
        </FadeInWhenVisible>

        <FadeInWhenVisible>
          <ComparisonTableSection
            comparisonData={comparisonData}
            isDark={isDark}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </FadeInWhenVisible>

        <FadeInWhenVisible>
          <VideoDemoSection isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />
        </FadeInWhenVisible>

        <FadeInWhenVisible>
          <SecurityCertificationsSection isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />
        </FadeInWhenVisible>

        <FadeInWhenVisible>
          <BenefitsSection benefits={benefits} isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />
        </FadeInWhenVisible>

        <FadeInWhenVisible>
          <PerformanceMetricsSection isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />
        </FadeInWhenVisible>

        <FadeInWhenVisible>
          <FAQSection faqs={faqs} isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />
        </FadeInWhenVisible>

        <FadeInWhenVisible>
          <ContactSection isDark={isDark} primaryColor={primaryColor} secondaryColor={secondaryColor} />
        </FadeInWhenVisible>
        <Footer isDark={isDark} primaryColor={primaryColor} />
      </Box>
    </ThemeProvider>
  );
};

export default LandingPage;
