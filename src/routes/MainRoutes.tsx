
import { lazy } from 'react';

// project-imports
import Loadable from 'components/Loadable';
import CommonLayout from 'layout/CommonLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';

const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/error/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/error/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction/under-construction')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon/coming-soon2')));

const GosafeLanding = Loadable(lazy(() => import('pages/gosafe')));

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
