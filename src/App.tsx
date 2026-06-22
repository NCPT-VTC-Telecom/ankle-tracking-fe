// project-imports
import Routes from 'routes';
import ThemeCustomization from 'themes';
// import Loader from 'components/Loader';
import Snackbar from 'components/@extended/Snackbar';
import Locales from 'components/Locales';
import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Notistack from 'components/third-party/Notistack';
// import ErrorBoundary from 'pages/maintenance/ErrorBoundary';

// auth-provider
import { JWTProvider as AuthProvider } from 'contexts/JWTContext';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';
dayjs.extend(customParseFormat);
// import { FirebaseProvider as AuthProvider } from 'contexts/FirebaseContext';
// import { AWSCognitoProvider as AuthProvider } from 'contexts/AWSCognitoContext';
// import { Auth0Provider as AuthProvider } from 'contexts/Auth0Context';

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false
    }
  }
});

const App = () => {
  // const [loading, setLoading] = useState<boolean>(true);
  const updateRegion = useSelector((state: RootState) => state.authSlice.user?.currentRegion ?? null);
  const updateSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? null);
  useEffect(() => {}, [updateRegion, updateSite]);

  // if (loading) return <Loader />;

  return (
    <HelmetProvider>
      {/* <ErrorBoundary> */}
      <ThemeCustomization>
        <RTLLayout>
          <Locales>
            <ScrollTop>
              <AuthProvider>
                <QueryClientProvider client={queryClient}>
                  <Notistack>
                    <Routes />
                    <Snackbar />
                  </Notistack>
                </QueryClientProvider>
              </AuthProvider>
            </ScrollTop>
          </Locales>
        </RTLLayout>
      </ThemeCustomization>
      {/* </ErrorBoundary> */}
    </HelmetProvider>
  );
};

export default App;
