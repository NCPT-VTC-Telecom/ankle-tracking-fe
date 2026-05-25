import { ProtectedRoute } from 'hooks/useAccessCheck';
import { lazy } from 'react';

// project-imports
import Loadable from 'components/Loadable';
import CommonLayout from 'layout/CommonLayout';
import MainLayout from 'layout/MainLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';

const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/error/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/error/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction/under-construction')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon/coming-soon2')));

const Dashboard = Loadable(lazy(() => import('pages/dashboard')));
// const AdvertisingManagement = Loadable(lazy(() => import('pages/management/AdvertisingManagement')));
// const AdsBanner = Loadable(lazy(() => import('pages/management/Ads/AdsBanner')));
// const AdsVideo = Loadable(lazy(() => import('pages/management/Ads/AdsVideo')));
const UserStatistics = Loadable(lazy(() => import('pages/statistics/UserStatistics')));
const NetworkStatistics = Loadable(lazy(() => import('pages/statistics/NetworkStatistics')));
const UserBehaviorDashboard = Loadable(lazy(() => import('pages/statistics/UserBehaviorDashboard')));
const CustomerList = Loadable(lazy(() => import('pages/management/CustomerList')));
const SessionManagement = Loadable(lazy(() => import('pages/management/SessionManagement')));
const AdminList = Loadable(lazy(() => import('pages/management/list-admin')));
const NetworkTraffic = Loadable(lazy(() => import('pages/management/NetworkTraffic')));
const DataSurvey = Loadable(lazy(() => import('pages/management/DataSurvey')));
const Calendar = Loadable(lazy(() => import('pages/management/Calendar')));
const AdvertisingPartner = Loadable(lazy(() => import('pages/management/ads-partner/AdvertisingPartner')));
const DeviceProvider = Loadable(lazy(() => import('pages/management/DeviceProvider')));
const SSIDManagement = Loadable(lazy(() => import('pages/management/SSIDManagement')));
const SitesManagement = Loadable(lazy(() => import('pages/management/Sites')));
const RegionManagement = Loadable(lazy(() => import('pages/management/Region')));
const DeviceManagement = Loadable(lazy(() => import('pages/management/DeviceManagement')));
const ActivitiesManagement = Loadable(lazy(() => import('pages/management/ActivitiesManagement')));
const Map = Loadable(lazy(() => import('pages/management/DeviceMap')));
const RegionMap = Loadable(lazy(() => import('pages/management/RegionMap')));

const DeviceOverview = Loadable(lazy(() => import('pages/management/DeviceOverview')));

const ControllerManagement = Loadable(lazy(() => import('pages/management/DeviceControllerManagement')));
const RestrictionDomainManagement = Loadable(lazy(() => import('pages/management/RestrictionDomainManagement')));
const RestrictionDeviceManagement = Loadable(lazy(() => import('pages/management/RestrictionDeviceManagement')));
const VoucherManagement = Loadable(lazy(() => import('pages/management/VoucherManagement')));
const VoucherGroupManagement = Loadable(lazy(() => import('pages/management/VoucherGroupManagement')));
const VoucherOrderManagement = Loadable(lazy(() => import('pages/management/order/VoucherOrderManagement')));
const PremiumOverview = Loadable(lazy(() => import('pages/wifi-premium/PremiumOverview')));
const VoucherDetailsPage = Loadable(lazy(() => import('pages/wifi-premium/VoucherDetailsPage')));
const VoucherVerification = Loadable(lazy(() => import('pages/wifi-premium/VoucherVerification')));
const VoucherScanSummary = Loadable(lazy(() => import('pages/wifi-premium/VoucherScanSummary')));
const VoucherAnalytics = Loadable(lazy(() => import('pages/wifi-premium/VoucherAnalytics')));
const VoucherUsageHistory = Loadable(lazy(() => import('pages/wifi-premium/VoucherUsageHistory')));

const VoucherOverview = Loadable(lazy(() => import('pages/management/VoucherOverview')));
const VoucherDetail = Loadable(lazy(() => import('pages/profile/voucher/VoucherDetail')));
const VoucherProfile = Loadable(lazy(() => import('pages/profile/voucher')));
const VouchersListTab = Loadable(lazy(() => import('pages/profile/voucher/TabVoucherList')));
const LogsSoftware = Loadable(lazy(() => import('pages/management/LogsSoftware')));
const LogsHardware = Loadable(lazy(() => import('pages/management/LogsHardware')));
const WLANManagement = Loadable(lazy(() => import('pages/management/WLANManagement')));
const VLANManagement = Loadable(lazy(() => import('pages/management/VLANManagement')));

//sample
const AdHandle = Loadable(lazy(() => import('pages/management/ads-sample')));
// const AdsBannerSample = Loadable(lazy(() => import('pages/management/ads-sample/AdsBanner')));
// const AdsVideoSample = Loadable(lazy(() => import('pages/management/ads-sample/AdsSamplePage')));
// const AdsSurveySample = Loadable(lazy(() => import('pages/management/ads-sample/AdsSurvey')));
// const AdsApp = Loadable(lazy(() => import('pages/management/ads-sample/AdsApp')));
const AdsSamplePage = Loadable(lazy(() => import('pages/management/ads-sample/AdsSamplePage')));
const AdsManagement = Loadable(lazy(() => import('components/organisms/adSample/AdManager')));
const CampaignModeration = Loadable(lazy(() => import('pages/management/content-moderation/CampaignModeration')));
const CampaignModerationDetailsPage = Loadable(lazy(() => import('pages/management/content-moderation/CampaignModerationDetail')));

const RoleManagement = Loadable(lazy(() => import('pages/management/list-role')));
const RadiusManagement = Loadable(lazy(() => import('pages/management/RadiusServerManagement')));
const CampaignManagement = Loadable(lazy(() => import('pages/management/CampaignManagement')));
const RatelimitManagement = Loadable(lazy(() => import('pages/management/RatelimitManagement')));
const SSIDClientManagement = Loadable(lazy(() => import('pages/management/SSIDClientManagement')));
const PasspointManagement = Loadable(lazy(() => import('pages/management/Passpoint/PasspointManagement')));
const PortalManagement = Loadable(lazy(() => import('pages/management/PortalManagement')));

//ACV
const FlightManagement = Loadable(lazy(() => import('pages/acv/FlightManagement')));
const FacilitiesManagement = Loadable(lazy(() => import('pages/acv/FacilitiesManagement')));
const AirlineManagement = Loadable(lazy(() => import('pages/acv/AirlineManagement')));
const AirportManagement = Loadable(lazy(() => import('pages/acv/AirportManagement')));
const UserManagement = Loadable(lazy(() => import('pages/acv/UserManagement')));
const ProductServiceManagement = Loadable(lazy(() => import('pages/acv/ProductServiceManagement')));
const IncidentFeedbackManagement = Loadable(lazy(() => import('pages/acv/IncidentFeedback/IncidentFeedbackManagement')));
const CMSManagement = Loadable(lazy(() => import('pages/acv/CMSManagement')));

//Profile Campaign
const CampaignDetailsPage = Loadable(lazy(() => import('pages/profile/campaign')));
const CampaignProfileTab = Loadable(lazy(() => import('pages/profile/campaign/TabCampaignInfo')));
const UserAccessCampaignTab = Loadable(lazy(() => import('pages/profile/campaign/TabCampaignInfo')));
const ReportCampaignTab = Loadable(lazy(() => import('pages/profile/campaign/TabReport')));
const AccessControlManagement = Loadable(lazy(() => import('pages/management/AccessControlManagement')));
const OrderDigitalManagement = Loadable(lazy(() => import('pages/acv/Order/OrderDigitalManagement')));
const PasspointDownloadPage = Loadable(lazy(() => import('pages/passpoint-download/PasspointDownloadUI')));
const AgentManagement = Loadable(lazy(() => import('pages/management/agent/AgentManagement')));
const DeviceConnectionManagement = Loadable(lazy(() => import('pages/management/device/DeviceConnectionManagement')));
const GosafeLanding = Loadable(lazy(() => import('pages/gosafe')));

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: 'dashboard',
          element: <Dashboard />
        },
        {
          path: 'statistic',
          element: <Dashboard />
        },
        // {
        //   path: 'ad-handle/edit',
        //   element: <AdHandle />,
        //   children: [
        //     {
        //       path: 'ad-banner/:id',
        //       element: <AdsSamplePage />
        //     },
        //     {
        //       path: 'ad-video1/:id',
        //       element: <AdsSamplePage />
        //     },
        //     {
        //       path: 'ad-video2/:id',
        //       element: <AdsSamplePage />
        //     },
        //     {
        //       path: 'ad-survey/:id',
        //       element: <AdsSamplePage />
        //     },
        //     {
        //       path: 'ad-survey2/:id',
        //       element: <AdsSamplePage />
        //     },
        //     {
        //       path: 'ad-app/:id',
        //       element: <AdsSamplePage />
        //     },
        //     {
        //       path: 'ad-third-party/:id',
        //       element: <AdsSamplePage />
        //     }
        //   ]
        // },

        {
          path: 'clients-management',
          element: <ProtectedRoute path="clients-management" element={CustomerList} />
        },
        {
          path: 'system-management',
          element: <AdHandle />,
          children: [
            {
              path: 'admin-management',
              element: <ProtectedRoute path="system-management/admin-management" element={AdminList} />
            },
            {
              path: 'role-management',
              element: <ProtectedRoute path="system-management/role-management" element={RoleManagement} />
            }
          ]
        },
        {
          path: 'statistic-system',
          children: [
            {
              path: 'statistic-network',
              element: <ProtectedRoute path="statistic-system/statistic-network" element={NetworkStatistics} />
            },
            {
              path: 'statistic-user',
              element: <ProtectedRoute path="statistic-system/statistic-user" element={UserStatistics} />
            },
            {
              path: 'user-behavior',
              element: <ProtectedRoute path="statistic-system/statistic-user" element={UserBehaviorDashboard} />
            },
            {
              path: 'network-traffic',
              element: <ProtectedRoute path="statistic-system/network-traffic" element={NetworkTraffic} />
            },
            {
              path: 'activities-management',
              element: <ProtectedRoute path="statistic-system/activities-management" element={ActivitiesManagement} />
            },
            {
              path: 'data-survey',
              element: <ProtectedRoute path="statistic-system/data-survey" element={DataSurvey} />
            },
            {
              path: 'session-management',
              element: <ProtectedRoute path="statistic-system/session-management" element={SessionManagement} />
            }
          ]
        },
        {
          path: 'ads',
          children: [
            {
              path: 'campaign-management',
              element: <ProtectedRoute path="ads/campaign-management" element={CampaignManagement} />
            },
            {
              path: 'ads-management',
              element: <ProtectedRoute path="ads/ads-management" element={AdsManagement} />
            },
            {
              path: 'ads-management/detail',
              element: <AdsSamplePage />
            },
            {
              path: 'content-moderation',
              element: <ProtectedRoute path="ads/content-moderation" element={CampaignModeration} />
            },

            {
              path: 'ads-calendar',
              element: <ProtectedRoute path="ads/ads-calendar" element={Calendar} />
            },
            {
              path: 'ads-partner',
              element: <ProtectedRoute path="ads/ads-partner" element={AdvertisingPartner} />
            }
          ]
        },
        {
          path: 'device-management',
          children: [
            {
              path: 'device-overview',
              element: <ProtectedRoute path="device-management/device-overview" element={DeviceOverview} />
            },
            {
              path: 'device-list',
              element: <ProtectedRoute path="device-management/device-list" element={DeviceManagement} />
            },
            {
              path: 'controller-list',
              element: <ProtectedRoute path="device-management/controller-list" element={ControllerManagement} />
            },
            {
              path: 'device-provider',
              element: <ProtectedRoute path="device-management/device-provider" element={DeviceProvider} />
            },
            {
              path: 'device-map',
              element: <ProtectedRoute path="device-management/device-map" element={Map} />
            },
            {
              path: 'device-connection-log',
              element: <ProtectedRoute path="device-management/device-connection-log" element={DeviceConnectionManagement} />
            }
          ]
        },

        {
          path: 'network-management',
          children: [
            {
              path: 'ssid-client-overview',
              element: <ProtectedRoute path="network-management/ssid-client-overview" element={SSIDClientManagement} />
            },

            {
              path: 'portal-management',
              element: <ProtectedRoute path="network-management/portal-management" element={PortalManagement} />
            },
            {
              path: 'ratelimit-management',
              element: <ProtectedRoute path="network-management/ratelimit-management" element={RatelimitManagement} />
            },
            {
              path: 'wlan-management',
              element: <ProtectedRoute path="network-management/wlan-management" element={WLANManagement} />
            },
            {
              path: 'vlan-management',
              element: <ProtectedRoute path="network-management/vlan-management" element={VLANManagement} />
            },
            {
              path: 'ssid-list',
              element: <ProtectedRoute path="network-management/ssid-list" element={SSIDManagement} />
            },
            {
              path: 'radius-management',
              element: <ProtectedRoute path="network-management/radius-management" element={RadiusManagement} />
            },
            {
              path: 'restriction-domains-management',
              element: <ProtectedRoute path="network-management/restriction-domains-management" element={RestrictionDomainManagement} />
            },
            {
              path: 'restriction-devices-management',
              element: <ProtectedRoute path="network-management/restriction-devices-management" element={RestrictionDeviceManagement} />
            },
            {
              path: 'access-control-management',
              element: <ProtectedRoute path="network-management/access-control-management" element={AccessControlManagement} />
            }
          ]
        },
        {
          path: 'site-management',
          children: [
            {
              path: 'region-map',
              element: <ProtectedRoute path="region-map" element={RegionMap} excludeLevel2={true} />
            },
            {
              path: 'region-management',
              element: <ProtectedRoute path="region-management" element={RegionManagement} excludeLevel2={true} />
            },
            {
              path: 'site-list',
              element: <ProtectedRoute path="site-management/site-list" element={SitesManagement} />
            }
          ]
        },

        {
          path: 'wifi-premium',
          children: [
            // Premium Overview
            {
              path: 'overview',
              element: <ProtectedRoute path="wifi-premium/overview" element={PremiumOverview} />
            },
            // Voucher Services (FLAT structure - no nested children)
            {
              path: 'voucher/groups',
              element: <ProtectedRoute path="wifi-premium/voucher/groups" element={VoucherGroupManagement} />
            },
            {
              path: 'voucher/orders',
              element: <ProtectedRoute path="wifi-premium/voucher/orders" element={VoucherOrderManagement} />
            },
            {
              path: 'voucher/analytics',
              element: <ProtectedRoute path="wifi-premium/voucher/analytics" element={VoucherAnalytics} />
            },
            {
              path: 'voucher/agents',
              element: <ProtectedRoute path="wifi-premium/voucher/agents" element={AgentManagement} />
            },
            {
              path: 'voucher/details/:id',
              element: <ProtectedRoute path="wifi-premium/voucher/details" element={VoucherDetailsPage} />
            },
            {
              path: 'voucher/verification',
              element: <ProtectedRoute path="wifi-premium/voucher/verification" element={VoucherVerification} />
            },
            {
              path: 'voucher/scan-summary',
              element: <ProtectedRoute path="wifi-premium/voucher/scan-summary" element={VoucherScanSummary} />
            },
            {
              path: 'voucher/usage-history',
              element: <ProtectedRoute path="wifi-premium/voucher/usage-history" element={VoucherUsageHistory} />
            },
            // Passpoint Services (FLAT structure - no nested children)
            {
              path: 'passpoint/profiles',
              element: <ProtectedRoute path="wifi-premium/passpoint/profiles" element={PasspointManagement} />
            },
            // TODO: Add future passpoint routes
            // {
            //   path: 'passpoint/orders',
            //   element: <ProtectedRoute path="wifi-premium/passpoint/orders" element={PasspointOrderManagement} />
            // },
            // {
            //   path: 'passpoint/certificates',
            //   element: <ProtectedRoute path="wifi-premium/passpoint/certificates" element={CertificateManagement} />
            // },
            // {
            //   path: 'passpoint/roaming-partners',
            //   element: <ProtectedRoute path="wifi-premium/passpoint/roaming-partners" element={RoamingPartnerManagement} />
            // },

            // Legacy routes (keep for backward compatibility)
            {
              path: 'voucher-overview',
              element: <ProtectedRoute path="wifi-premium/voucher-overview" element={VoucherOverview} />
            },
            {
              path: 'voucher-management',
              element: <ProtectedRoute path="voucher-management" element={VoucherManagement} />
            },
            {
              path: 'passpoint-management',
              element: <ProtectedRoute path="wifi-premium/passpoint-management" element={PasspointManagement} />
            },
            {
              path: 'agent-management',
              element: <ProtectedRoute path="wifi-premium/agent-management" element={AgentManagement} />
            }
          ]
        },
        {
          path: 'logs-system',
          children: [
            {
              path: 'logs-software',
              element: <ProtectedRoute path="logs-system/logs-software" element={LogsSoftware} />
            },
            {
              path: 'logs-hardware',
              element: <ProtectedRoute path="logs-system/logs-hardware" element={LogsHardware} />
            }
          ]
        },
        {
          path: 'vtc-digital-map',
          children: [
            {
              path: 'flight-management',
              element: <ProtectedRoute path="vtc-digital-map/flight-management" element={FlightManagement} />
            },
            {
              path: 'facilities-management',
              element: <ProtectedRoute path="vtc-digital-map/facilities-management" element={FacilitiesManagement} />
            },
            {
              path: 'airport-management',
              element: <ProtectedRoute path="vtc-digital-map/airport-management" element={AirportManagement} />
            },
            {
              path: 'airline-management',
              element: <ProtectedRoute path="vtc-digital-map/airline-management" element={AirlineManagement} />
            },
            {
              path: 'user-management',
              element: <ProtectedRoute path="vtc-digital-map/user-management" element={UserManagement} />
            },
            {
              path: 'product-service-management',
              element: <ProtectedRoute path="vtc-digital-map/product-service-management" element={ProductServiceManagement} />
            },
            {
              path: 'incident-feedback-management',
              element: <ProtectedRoute path="vtc-digital-map/incident-feedback-management" element={IncidentFeedbackManagement} />
            },
            {
              path: 'order-management-digital',
              element: <ProtectedRoute path="vtc-digital-map/order-management-digital" element={OrderDigitalManagement} />
            },
            {
              path: 'cms-management',
              element: <ProtectedRoute path="vtc-digital-map/cms-management" element={CMSManagement} />
            }
          ]
        },
        {
          path: 'campaign',
          element: <CampaignDetailsPage />,
          children: [
            {
              path: 'details/:id',
              element: <CampaignProfileTab />
            },
            { path: 'user-access/:id', element: <UserAccessCampaignTab /> },
            { path: 'report/:id', element: <ReportCampaignTab /> }
          ]
        },
        {
          path: 'content-moderation/details/:id',
          element: <CampaignModerationDetailsPage />
        },
        {
          path: 'voucher',
          element: <VoucherProfile />,
          children: [
            {
              path: 'details/:id',
              element: <VoucherDetail />
            },
            { path: 'vouchers-list/:id', element: <VouchersListTab /> },
            { path: 'report/:id', element: <ReportCampaignTab /> }
          ]
        }
      ]
    },

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
      path: '/passpoint-download',
      element: <PasspointDownloadPage />
    },
    {
      path: '/gosafe',
      element: <GosafeLanding viewType="landing" />
    },
    {
      path: '/gosafe/tracking',
      element: (
        <AuthGuard>
          <GosafeLanding viewType="tracking" />
        </AuthGuard>
      )
    }
  ]
};

export default MainRoutes;
