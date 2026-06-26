import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project-imports
import useAuth from 'shared/hooks/useAuth';

// types
import { GuardProps } from 'shared/types/auth';

// ==============================|| AUTH GUARD ||============================== //

// Kiểm tra môi trường landing page
const isLandingEnabled = () => {
  const env = import.meta.env.VITE_APP_ENV;
  return env === 'production' || env === 'development';
};

const AuthGuard = ({ children }: GuardProps) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      const shouldRedirectToLanding = location.pathname === '/' && isLandingEnabled();

      if (shouldRedirectToLanding) {
        return;
      }

      navigate('login', {
        state: {
          from: location.pathname
        },
        replace: true
      });
    }
  }, [isLoggedIn, navigate, location]);

  return children;
};

export default AuthGuard;
