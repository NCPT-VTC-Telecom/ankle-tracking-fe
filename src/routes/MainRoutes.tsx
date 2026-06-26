
import { lazy } from 'react';

// project-imports
import Loadable from 'shared/components/Loadable';
import CommonLayout from 'shared/components/layout/CommonLayout';
import AuthGuard from 'shared/utils/route-guard/AuthGuard';

const MaintenanceError = Loadable(lazy(() => import('features/maintenance/pages/error/404')));
const MaintenanceError500 = Loadable(lazy(() => import('features/maintenance/pages/error/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('features/maintenance/pages/under-construction/under-construction')));
const MaintenanceComingSoon = Loadable(lazy(() => import('features/maintenance/pages/coming-soon/coming-soon2')));

const GosafeLanding = Loadable(lazy(() => import('features/gosafe/pages')));

// GoSafe-only: bỏ MainLayout + dashboard/statistic (WiFi cũ). Sau đăng nhập điều
// hướng tới /gosafe/tracking (APP_DEFAULT_PATH).
const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/maintenance',
      element: <CommonLayout />,
      children: [
        {
          path: '404',
          element: <MaintenanceError />
        },
        {
          path: '500',
          element: <MaintenanceError500 />
        },
        {
          path: 'under-construction',
          element: <MaintenanceUnderConstruction />
        },
        {
          path: 'coming-soon',
          element: <MaintenanceComingSoon />
        }
      ]
    },
    {
      path: '*',
      element: <MaintenanceError />
    },
    {
      path: '/gosafe',
      element: <GosafeLanding viewType="landing" />
    },
    {
      // :view = overview | tracking | prisoners | devices | alerts | compliance | regions | users
      // URL đồng bộ với tab đang focus trong dashboard.
      path: '/gosafe/:view',
      element: (
        <AuthGuard>
          <GosafeLanding viewType="tracking" />
        </AuthGuard>
      )
    }
  ]
};

export default MainRoutes;
