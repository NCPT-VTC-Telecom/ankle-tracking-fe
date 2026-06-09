// third-party
import { FormattedMessage } from 'react-intl';

// assets
import {
  Devices,
  Briefcase,
  ChartSquare,
  DocumentText,
  Box2,
  Buildings,
  User,
  Home,
  Hierarchy,
  Profile2User,
  StatusUp,
  CloudConnection,
  Calendar,
  WifiSquare,
  Location,
  Map,
  HomeWifi,
  Chart2,
  Convertshape,
  Diagram,
  Setting2,
  People,
  Map1,
  HierarchySquare,
  Data,
  CpuSetting,
  Brodcast,
  ShieldSecurity,
  Building4,
  Clock,
  ShieldTick,
  MirroringScreen,
  GlobalSearch,
  Wifi
} from 'iconsax-react';
import { Server, RestrictionDevice, RestrictionDomain, SystemLog, Software } from 'components/atoms/icon';

// type
import { NavItemType } from 'types';

// icons
const icons = {
  home: Home,
  deviceList: Devices,
  partner: Briefcase,
  statistic_user: ChartSquare,
  logs: DocumentText,
  provider: Buildings,
  packages: Box2,
  customer: Profile2User,
  admin: User,
  statistic_network: StatusUp,
  campaign: Hierarchy,
  session: CloudConnection,
  calendar: Calendar,
  ssid: WifiSquare,
  site: Location,
  map: Map,
  homeWifi: HomeWifi,
  chart2: Chart2,
  convertShape: Convertshape,
  diagram: Diagram,
  system: Setting2,
  role: People,
  site1: Map1,
  region: Building4,
  network: HierarchySquare,
  radius: Server,
  controller: Data,
  blockDomain: RestrictionDomain,
  blockDevice: RestrictionDevice,
  systemLog: SystemLog,
  softwareLog: Software,
  hardwareLog: CpuSetting,
  wlan: Brodcast,
  security: ShieldSecurity,
  history: Clock,
  shield: ShieldTick,
  ad: MirroringScreen
};

const dashboard: NavItemType = {
  id: 'dashboard',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: <FormattedMessage id="dashboard" />,
      breadcrumbs: true,
      type: 'item',
      icon: icons.home,
      url: '/dashboard'
    },
    {
      id: 'statistic-system',
      title: <FormattedMessage id="statistic-system" />,
      type: 'collapse',
      icon: icons.chart2,
      children: [
        {
          id: 'statistic-user',
          title: <FormattedMessage id="statistic-survey" />,
          type: 'item',
          icon: icons.diagram,
          url: '/statistic-system/statistic-user'
        },
        {
          id: 'statistic-network',
          title: <FormattedMessage id="statistic-network" />,
          type: 'item',
          icon: icons.statistic_network,
          url: '/statistic-system/statistic-network'
        },
        {
          id: 'user-behavior',
          title: <FormattedMessage id="user-behavior" />,
          type: 'item',
          icon: icons.chart2,
          url: '/statistic-system/user-behavior'
        },
        {
          id: 'activities-management',
          title: <FormattedMessage id="activities-management" />,
          type: 'item',
          icon: icons.statistic_user,
          url: '/statistic-system/activities-management'
        },
        {
          id: 'network-traffic',
          title: <FormattedMessage id="network-traffic" />,
          type: 'item',
          url: '/statistic-system/network-traffic',
          icon: icons.convertShape
        },
        {
          id: 'session-management',
          title: <FormattedMessage id="session-management" />,
          type: 'item',
          url: '/statistic-system/session-management',
          icon: icons.session
        },
        {
          id: 'data-survey',
          title: <FormattedMessage id="data-collect-user" />,
          type: 'item',
          url: '/statistic-system/data-survey',
          icon: icons.customer
        }
      ]
    },
    {
      id: 'ads',
      title: <FormattedMessage id="ads-management" />,
      type: 'collapse',
      icon: icons.homeWifi,
      children: [
        {
          id: 'campaign-management',
          title: <FormattedMessage id="campaign-management" />,
          type: 'item',
          url: '/ads/campaign-management',
          icon: icons.campaign
        },
        {
          id: 'ads-management',
          title: <FormattedMessage id="ads-management" />,
          type: 'item',
          url: '/ads/ads-management',
          icon: icons.ad
        },
        {
          id: 'content-moderation',
          title: <FormattedMessage id="content-moderation" />,
          type: 'item',
          url: '/ads/content-moderation',
          icon: icons.shield
        },
        {
          id: 'ads-partner',
          title: <FormattedMessage id="ad-partner" />,
          type: 'item',
          url: '/ads/ads-partner',
          icon: icons.provider
        },
        {
          id: 'ads-calendar',
          title: <FormattedMessage id="calendar" />,
          type: 'item',
          url: '/ads/ads-calendar',
          icon: icons.calendar
        }
      ]
    },
    {
      id: 'device-management',
      title: <FormattedMessage id="device-management" />,
      type: 'collapse',
      icon: icons.deviceList,
      children: [
        {
          id: 'device-overview',
          title: <FormattedMessage id="device-overview" />,
          type: 'item',
          url: '/device-management/device-overview',
          icon: icons.home
        },
        {
          id: 'device-map',
          title: <FormattedMessage id="map" />,
          type: 'item',
          url: '/device-management/device-map',
          icon: icons.map
        },
        {
          id: 'device-list',
          title: <FormattedMessage id="device-list" />,
          type: 'item',
          url: '/device-management/device-list',
          icon: icons.deviceList
        },
        {
          id: 'controller-list',
          title: <FormattedMessage id="controller-list" />,
          type: 'item',
          url: '/device-management/controller-list',
          icon: icons.controller
        },
        {
          id: 'device-provider',
          title: <FormattedMessage id="device-provider" />,
          type: 'item',
          url: '/device-management/device-provider',
          icon: icons.provider
        },
        {
          id: 'device-connection-log',
          title: <FormattedMessage id="device-connection-log" />,
          type: 'item',
          url: '/device-management/device-connection-log',
          icon: icons.history
        }
      ]
    },
    {
      id: 'network-management',
      title: <FormattedMessage id="network-management" />,
      type: 'collapse',
      icon: Diagram,
      children: [
        {
          id: 'ssid-client-overview',
          title: <FormattedMessage id="ssid-client-overview" />,
          type: 'item',
          url: '/network-management/ssid-client-overview',
          icon: Profile2User
        },
        {
          id: 'portal-management',
          title: <FormattedMessage id="portal-management" />,
          type: 'item',
          url: '/network-management/portal-management',
          icon: GlobalSearch
        },
        {
          id: 'ratelimit-management',
          title: <FormattedMessage id="ratelimit-management" />,
          type: 'item',
          url: '/network-management/ratelimit-management',
          icon: icons.wlan
        },
        {
          id: 'wlan-management',
          title: <FormattedMessage id="wlan-management" />,
          type: 'item',
          url: '/network-management/wlan-management',
          icon: Wifi
        },
        {
          id: 'vlan-management',
          title: <FormattedMessage id="vlan-management" />,
          type: 'item',
          url: '/network-management/vlan-management',
          icon: Hierarchy
        },
        {
          id: 'ssid-list',
          title: <FormattedMessage id="ssid-management" />,
          type: 'item',
          url: '/network-management/ssid-list',
          icon: icons.ssid
        },
        {
          id: 'radius-management',
          title: <FormattedMessage id="radius-server-management" />,
          type: 'item',
          url: '/network-management/radius-management',
          icon: icons.radius
        },
        // {
        //   id: 'restriction-domains-management',
        //   title: <FormattedMessage id="restriction-domain-management" />,
        //   type: 'item',
        //   url: '/network-management/restriction-domains-management',
        //   icon: icons.blockDomain
        // },
        {
          id: 'restriction-devices-management',
          title: <FormattedMessage id="restriction-device-management" />,
          type: 'item',
          url: '/network-management/restriction-devices-management',
          icon: icons.blockDevice
        },
        {
          id: 'access-control-management',
          title: <FormattedMessage id="access-control-management" />,
          type: 'item',
          url: '/network-management/access-control-management',
          icon: icons.security
        }
      ]
    },
    {
      id: 'system-management',
      title: <FormattedMessage id="system-management" />,
      type: 'collapse',
      icon: icons.system,
      children: [
        {
          id: 'admin-management',
          title: <FormattedMessage id="admin-management" />,
          type: 'item',
          url: '/system-management/admin-management',
          icon: icons.admin
        }
        // {
        //   id: 'role-management',
        //   title: <FormattedMessage id="role-management" />,
        //   type: 'item',
        //   url: '/system-management/role-management',
        //   icon: icons.role
        // }
      ]
    },

    {
      id: 'sites-management',
      title: <FormattedMessage id="region-management" />,
      type: 'collapse',
      icon: icons.site1,
      children: [
        {
          id: 'region-map',
          title: <FormattedMessage id="region-map" />,
          type: 'item',
          url: '/site-management/region-map',
          icon: icons.site1
        },
        {
          id: 'region-management',
          title: <FormattedMessage id="region-management" />,
          type: 'item',
          url: '/site-management/region-management',
          icon: icons.region
        },
        {
          id: 'site-list',
          title: <FormattedMessage id="sites-management" />,
          type: 'item',
          url: '/site-management/site-list',
          icon: icons.site
        }
      ]
    },
    {
      id: 'logs-system',
      title: <FormattedMessage id="logs-system" />,
      type: 'collapse',
      icon: icons.systemLog,
      children: [
        {
          id: 'logs-software',
          title: <FormattedMessage id="logs-software" />,
          type: 'item',
          url: '/logs-system/logs-software',
          icon: icons.softwareLog
        },
        {
          id: 'logs-hardware',
          title: <FormattedMessage id="logs-hardware" />,
          type: 'item',
          url: '/logs-system/logs-hardware',
          icon: icons.hardwareLog
        }
      ]
    }

    // {
    //   id: 'logs',
    //   title: <FormattedMessage id="logs" />,
    //   type: 'item',
    //   url: '/logs',
    //   icon: icons.logs
    // }
  ]
};

export default dashboard;
