import { Chip } from '@mui/material';
import ChipStatus from 'shared/components/atoms/ChipStatus';
import ChipView from 'shared/components/molecules/view-modal/StatusRow';
import dayjs from 'dayjs';
import { FormattedMessage } from 'react-intl';
import { band, PMFMode, SSIDSecurityMode } from 'shared/types';

interface FieldConfig {
  key: string;
  label: string;
  transform?: (value: any) => string | React.ReactNode | null;
  unit?: string | React.ReactNode;
  md?: number;
}
export interface GroupedFieldConfig {
  title: string;
  icon?: string;
  fields: FieldConfig[];
  md?: number;
}

const booleanTransform = (value: string | null) => {
  if (value === 'true') return <FormattedMessage id="yes" />;
  if (value === 'false') return <FormattedMessage id="no" />;
  return <FormattedMessage id="unknown" />;
};

const bandTransform = (value: number) => {
  switch (value) {
    case band.Two:
      return <FormattedMessage id="band.2g" />;
    case band.Five:
      return <FormattedMessage id="band.5g" />;
    case band.Six:
      return <FormattedMessage id="band.6g" />;
    case band.TwoFiveSix:
      return <FormattedMessage id="band.2g5g6g" />;
    default:
      return <FormattedMessage id="unknown" />;
  }
};

const securityTransform = (value: number) => {
  switch (value) {
    case SSIDSecurityMode.None:
      return <FormattedMessage id="security.none" />;
    case SSIDSecurityMode.WPAEnterprise:
      return <FormattedMessage id="security.wpa-enterprise" />;
    case SSIDSecurityMode.WPAPersonal:
      return <FormattedMessage id="security.wpa-personal" />;
    case SSIDSecurityMode.PPSKWithoutRADIUS:
      return <FormattedMessage id="security.ppsk-no-radius" />;
    case SSIDSecurityMode.PPSKWithRADIUS:
      return <FormattedMessage id="security.ppsk-with-radius" />;
    default:
      return <FormattedMessage id="unknown" />;
  }
};

const pmfModeTransform = (value: number | null) => {
  switch (value) {
    case PMFMode.Mandatory:
      return <FormattedMessage id="pmf.mandatory" />;
    case PMFMode.Capable:
      return <FormattedMessage id="pmf.capable" />;
    case PMFMode.Disable:
      return <FormattedMessage id="pmf.disabled" />;
    default:
      return <FormattedMessage id="unknown" />;
  }
};

const codeFromTransform = (value: number) =>
  value === 0 ? <FormattedMessage id="code-from.numbers" /> : <FormattedMessage id="code-from.letters" />;

const limitTypeTransform = (val: number) => {
  switch (val) {
    case 0:
      return <FormattedMessage id="limit.usage-counts" />;
    case 1:
      return <FormattedMessage id="limit.online-users" />;
    case 2:
      return <FormattedMessage id="limit.unlimited" />;
    default:
      return <FormattedMessage id="unknown" />;
  }
};

const durationTypeTransform = (val: number) => {
  switch (val) {
    case 0:
      return <FormattedMessage id="duration.client" />;
    case 1:
      return <FormattedMessage id="duration.voucher" />;
    default:
      return <FormattedMessage id="unknown" />;
  }
};

const timingTypeTransform = (val: number) => (val === 0 ? <FormattedMessage id="timing.time" /> : <FormattedMessage id="timing.usage" />);

const rateLimitModeTransform = (val: number) =>
  val === 0 ? <FormattedMessage id="rate-limit.custom" /> : <FormattedMessage id="rate-limit.profile" />;

const trafficFreqTransform = (val: number) =>
  val === 0 ? <FormattedMessage id="traffic.freq.option0" /> : <FormattedMessage id="traffic.freq.option1" />;

const validityTypeTransform = (val: number) => {
  switch (val) {
    case 0:
      return <FormattedMessage id="validity.anytime" />;
    case 1:
      return <FormattedMessage id="validity.effective-expiration" />;
    case 2:
      return <FormattedMessage id="validity.specific" />;
    default:
      return <FormattedMessage id="unknown" />;
  }
};

export const userViewConfig: FieldConfig[] = [
  { key: 'fullname', label: 'name_user' },
  { key: 'username', label: 'username' },
  { key: 'email', label: 'email' },
  { key: 'gender', label: 'gender' },
  { key: 'phone_number', label: 'phone-number' },
  { key: 'citizen_id', label: 'citizen-id' },
  { key: 'address', label: 'address' },
  { key: 'ward', label: 'ward' },
  { key: 'district', label: 'district' },
  { key: 'province', label: 'province' },
  { key: 'country', label: 'country' },
  { key: 'postcode', label: 'postcode' },
  {
    key: 'status_id',
    label: 'status-online',
    transform: (value: number) => (
      <ChipView key={'status-online'} name={<FormattedMessage id="status" />} id={value} successLabel="online" errorLabel="offline" />
    )
  }
];

export const sessionViewConfig: FieldConfig[] = [
  { key: 'ssid_nas', label: 'ssid' },
  { key: 'nas_port_type', label: 'port-type' },
  { key: 'mac_address_nas', label: 'nas-mac-address' },
  { key: 'ip_address_nas', label: 'nas-ip-address' },
  { key: 'framed_ip_address', label: 'framed-ip-address', md: 12 },
  { key: 'user_device_type', label: 'user-device' },
  { key: 'user_ip_address', label: 'user-ip-address' },
  { key: 'user_mac_address', label: 'user-mac-address' },
  { key: 'total_data_upload', label: 'data-upload', unit: 'MB', transform: (value: number) => value.toFixed(2) },
  { key: 'total_data_download', label: 'data-download', unit: 'MB', transform: (value: number) => value.toFixed(2) },
  {
    key: 'total_data_usage',
    label: 'total-data-usage',
    unit: 'MB',
    transform: (value: number) => value.toFixed(2)
  },
  { key: 'total_time_usage_minute', label: 'total-time-usage', unit: 'minute (Phút)', transform: (value: number) => value.toFixed(2) },
  {
    key: 'session_status',
    label: 'status',
    transform: (value: string) => {
      let statusId;
      switch (value) {
        case 'Start':
          statusId = 14;
          break;
        case 'Interim-Update':
          statusId = 33;
          break;
        case 'Callback-Framed-User':
          statusId = 31;
          break;
        case 'Stop':
        default:
          statusId = 13;
          break;
      }
      return (
        <ChipView
          id={statusId}
          key={'session_status'}
          name={<FormattedMessage id="status" />}
          successLabel="start"
          infoLabel="interim-update"
          warningLabel="callback-framed-user"
          errorLabel="end"
        />
      );
    }
  },
  { key: 'terminate_reason', label: 'terminate-reason', md: 12 }
];

export const loginViewConfig: FieldConfig[] = [
  { key: 'device', label: 'device' },
  { key: 'os', label: 'os' },
  { key: 'ip_address', label: 'ip-address' },
  { key: 'mac_address', label: 'mac-address' },
  { key: 'browser', label: 'browser' },
  {
    key: 'login_status',
    label: 'status',
    transform: (value: string) => (
      <ChipView
        key={'login_status'}
        name={<FormattedMessage id="status" />}
        id={value === 'success' ? 14 : 13}
        successLabel="success"
        errorLabel="failed"
      />
    )
  },
  {
    key: 'login_failed_reason',
    label: 'login-failed-reason',
    md: 12
  }
];

export const siteViewConfig: FieldConfig[] = [
  { key: 'name', label: 'name' },
  { key: 'address', label: 'address' },
  { key: 'country', label: 'country' },
  { key: 'lat_location', label: 'latitude' },
  { key: 'long_location', label: 'longitude' },
  {
    key: 'status_id',
    label: 'status',
    transform: (value: number) => (
      <ChipView key={'status-online'} name={<FormattedMessage id="status" />} id={value} successLabel="online" errorLabel="offline" />
    )
  }
];

export const regionViewConfig: GroupedFieldConfig[] = [
  {
    title: 'region-information',
    fields: [
      { key: 'name', label: 'name' },
      { key: 'address', label: 'address' },
      { key: 'description', label: 'description' },
      { key: 'lat_location', label: 'latitude' },
      { key: 'long_location', label: 'longitude' },
      {
        key: 'status_id',
        label: 'status',
        transform: (value: number) => (
          <ChipView key={'status-online'} name={<FormattedMessage id="status" />} id={value} successLabel="online" errorLabel="offline" />
        )
      }
    ],
    md: 6
  },
  {
    title: 'device-information',
    fields: [
      { key: 'name', label: 'device-name' },
      { key: 'description', label: 'description' },
      { key: 'controller.detail.ip_address', label: 'ip_address' },
      { key: 'controller.detail.mac_address', label: 'mac_address' },
      { key: 'controller.detail.firmware', label: 'firmware' },
      { key: 'controller.detail.wifi_standard', label: 'wifi-standard' },
      { key: 'controller.detail.model', label: 'model' },
      {
        key: 'controller.detail.manufacturer_date',
        label: 'manufacturer-date',
        transform: (value: string) => <>{dayjs(value).format('DD/MM/YYYY')}</>
      }
    ],
    md: 6
  },
  {
    title: 'device-config',
    fields: [
      { key: 'device_configs.url', label: 'url' },
      { key: 'device_configs.username', label: 'username' },
      { key: 'device_configs.password', label: 'password' },
      { key: 'device_configs.client_id', label: 'client-id' },
      { key: 'device_configs.client_secret', label: 'client-secret' },
      { key: 'partnerId', label: 'partner' },
      { key: 'regionId', label: 'region' }
    ],
    md: 12
  }
];

// export const ssidViewConfig: FieldConfig[] = [
//   { key: 'name', label: 'name' },
//   {
//     key: 'band',
//     label: 'band',
//     transform: (value: number) => (value === 0 ? 'None' : value === 7 ? '2G/5G/6G' : value === 1 ? '2G' : '2G/5G')
//   },
//   {
//     key: 'broadcast',
//     label: 'broadcast',
//     transform: (value: string) => (
//       <ChipView
//         key={'broadcast'}
//         name={<FormattedMessage id="broadcast" />}
//         id={value === 'true' ? 14 : 13}
//         successLabel="online"
//         errorLabel="offline"
//       />
//     )
//   },
//   {
//     key: 'vlan_enable',
//     label: 'vlan-enable',
//     transform: (value: string) => (
//       <ChipView
//         key={'vlan_enable'}
//         name={<FormattedMessage id="vlan_enable" />}
//         id={value === 'true' ? 14 : 13}
//         successLabel="online"
//         errorLabel="offline"
//       />
//     )
//   },
//   {
//     key: 'security',
//     label: 'security',
//     transform: (value: number) =>
//       value === 0
//         ? 'None'
//         : value === 2
//         ? 'WPA-Enterprise'
//         : value === 3
//         ? 'WPA-Personal'
//         : value === 4
//         ? 'PPSK without RADIUS'
//         : 'PPSK with RADIUS'
//   },
//   { key: 'site.name', label: 'site' },
//   {
//     key: 'status_id',
//     label: 'status',
//     transform: (value: number) => (
//       <ChipView key={'status-online'} name={<FormattedMessage id="status" />} id={value} successLabel="online" errorLabel="offline" />
//     )
//   }
// ];

// export const ssidClientViewConfig: FieldConfig[] = [
//   { key: 'name', label: 'name' },
//   { key: 'ip_address', label: 'ip_address' },
//   { key: 'mac_address', label: 'mac_address' },
//   { key: 'signal_rank', label: 'signal_rank' },
//   { key: 'signal_level', label: 'signal_level' },
//   { key: 'uptime', label: 'uptime' },
//   { key: 'last_seen', label: 'last_seen' },
//   {
//     key: 'auth_status',
//     label: 'auth_status',
//     transform: (value: string) => {
//       return (
//         <Grid item xs={12} md={6}>
//           <Stack spacing={0.5}>
//             <div>
//               {value === 'pending' ? (
//                 <Chip color="error" label={<FormattedMessage id={'pending'} />} size="small" variant="light" />
//               ) : (
//                 <Chip color="success" label={<FormattedMessage id={'authorized'} />} size="small" variant="light" />
//               )}
//             </div>
//           </Stack>
//         </Grid>
//       );
//     }
//   },
//   { key: 'ssid', label: 'ssid' },
//   { key: 'site_information.name', label: 'site' },
//   { key: 'activity', label: 'activity' },
//   { key: 'ap_mac', label: 'ap_mac' },
//   { key: 'ap_name', label: 'ap_name' },
//   { key: 'channel', label: 'channel' },
//   { key: 'connect_dev_type', label: 'connect_dev_type' },
//   { key: 'connect_to_wireless_router', label: 'connect_to_wireless_router' },
//   { key: 'wireless', label: 'wireless' },
//   { key: 'wifi_mode', label: 'wifi_mode' },
//   { key: 'connect_type', label: 'connect_type' },
//   { key: 'device_type', label: 'device_type' },
//   { key: 'health_score', label: 'health_score' },
//   { key: 'down_packet', label: 'down_packet' },
//   { key: 'up_packet', label: 'up_packet' },
//   { key: 'rx_rate', label: 'rx_rate' },
//   { key: 'tx_rate', label: 'tx_rate' },
//   {
//     key: 'status_id',
//     label: 'status',
//     transform: (value: number) => (
//       <ChipView key={'status-online'} name={<FormattedMessage id="status" />} id={value} successLabel="online" errorLabel="offline" />
//     )
//   }
// ];

export const ssidClientViewConfig: GroupedFieldConfig[] = [
  {
    title: 'basic_information',
    fields: [
      { key: 'name', label: 'name' },
      { key: 'ip_address', label: 'ip_address' },
      { key: 'mac_address', label: 'mac_address' },
      { key: 'device_type', label: 'device_type' },
      {
        key: 'status_id',
        label: 'status',
        transform: (value: number) => (
          <ChipView key={'status-online'} name={<FormattedMessage id="status" />} id={value} successLabel="online" errorLabel="offline" />
        )
      }
    ]
  },
  {
    title: 'connection_info',
    fields: [
      { key: 'signal_rank', label: 'signal_rank' },
      { key: 'signal_level', label: 'signal_level' },
      { key: 'uptime', label: 'uptime' },
      { key: 'last_seen', label: 'last_seen' },
      {
        key: 'auth_status',
        label: 'auth_status',
        transform: (value: string) => {
          return value === 'pending' ? (
            <Chip color="error" label={<FormattedMessage id={'pending'} />} size="small" variant="light" />
          ) : (
            <Chip color="success" label={<FormattedMessage id={'authorized'} />} size="small" variant="light" />
          );
        }
      }
    ]
  },
  {
    title: 'network_details',
    fields: [
      { key: 'ssid', label: 'ssid' },
      { key: 'site_information.name', label: 'site' },
      { key: 'channel', label: 'channel' },
      { key: 'wifi_mode', label: 'wifi_mode' },
      { key: 'wireless', label: 'wireless' }
    ]
  },
  {
    title: 'access_point_info',
    fields: [
      { key: 'ap_name', label: 'ap_name' },
      { key: 'ap_mac', label: 'ap_mac' },
      { key: 'connect_dev_type', label: 'connect_dev_type' },
      { key: 'connect_to_wireless_router', label: 'connect_to_wireless_router' },
      { key: 'connect_type', label: 'connect_type' }
    ]
  },
  {
    title: 'performance_metrics',
    fields: [
      { key: 'activity', label: 'activity' },
      { key: 'health_score', label: 'health_score' },
      {
        key: 'rx_rate',
        label: 'rx_rate',
        transform: (value: string) => {
          return (
            <div>
              {value} <span className="font-semibold">(Kbit/s)</span>
            </div>
          );
        }
      },
      {
        key: 'tx_rate',
        label: 'tx_rate',
        transform: (value: string) => {
          return (
            <div>
              {value} <span className="font-semibold">(Kbit/s)</span>
            </div>
          );
        }
      }
    ]
  },
  {
    title: 'traffic_statistics',
    fields: [
      { key: 'down_packet', label: 'down_packet' },
      { key: 'up_packet', label: 'up_packet' },
      {
        key: 'traffic_down',
        label: 'traffic_down',
        transform: (value: string) => {
          return (
            <div>
              {value} <span className="font-semibold">(Byte)</span>
            </div>
          );
        }
      },
      {
        key: 'traffic_up',
        label: 'traffic_up',
        transform: (value: string) => {
          return (
            <div>
              {value} <span className="font-semibold">(Byte)</span>
            </div>
          );
        }
      }
    ]
  }
];

export const deviceViewConfig: FieldConfig[] = [
  { key: 'name', label: 'name' },
  { key: 'firmware', label: 'firmware' },
  { key: 'ip_address', label: 'ip-address' },
  { key: 'mac_address', label: 'mac-address' },
  { key: 'wifi_standard', label: 'wifi-standard' },
  { key: 'manufacturer_date', label: 'manufacturer-date' },
  { key: 'site_name', label: 'site' },
  {
    key: 'status_id',
    label: 'status',
    transform: (value: number) => (
      <ChipView
        key={'status-online'}
        name={<FormattedMessage id="status" />}
        id={value}
        successLabel="connected"
        errorLabel="disconnected"
        warningLabel="pending"
        dangerLabel="hearbeat_missed"
        isolatedLabel="isolated"
      />
    )
  },
  { key: 'description', label: 'desc', md: 12 }
];

export const partnerViewConfig: FieldConfig[] = [
  { key: 'name', label: 'name' },
  { key: 'country', label: 'country' },
  { key: 'phoneNumber', label: 'phone-number' },
  { key: 'siteId', label: 'site' },
  { key: 'address', label: 'address', md: 12 },
  { key: 'from_date', label: 'start-date' },
  { key: 'expired_date', label: 'end-date' },
  {
    key: 'status_id',
    label: 'status',
    transform: (value: number) => (
      <ChipView key={'status-online'} name={<FormattedMessage id="status" />} id={value} successLabel="online" errorLabel="offline" />
    )
  }
];

export const portalViewConfig: FieldConfig[] = [
  { key: 'name', label: 'name' },
  { key: 'portal_hardware_id', label: 'portal_hardware_id' },
  { key: 'ssid_list', label: 'ssid-list' },
  {
    key: 'auth_type',
    label: 'auth-type',
    transform: (value: number) =>
      value === 0
        ? 'No Authentication'
        : value === 1
        ? 'Simple Password'
        : value === 2
        ? 'External Radius Server'
        : value === 4
        ? 'External Portal Server'
        : value === 11
        ? 'Hotspot'
        : 'WPA2-Enterprise'
  },
  { key: 'host_type', label: 'host-type' },
  { key: 'site.name', label: 'site' },
  {
    key: 'status_id',
    label: 'status',
    transform: (value: number) => (
      <ChipView key={'status-online'} name={<FormattedMessage id="status" />} id={value} successLabel="online" errorLabel="offline" />
    )
  }
];

export const wlanViewConfig: FieldConfig[] = [
  { key: 'name', label: 'name' },
  { key: 'wlan_hardware_id', label: 'wlan_hardware_id' },
  { key: 'wlan_primary', label: 'wlan-primary', transform: (value: string) => (value === 'true' ? 'Yes' : 'No') },

  { key: 'site.name', label: 'site' },
  {
    key: 'status_id',
    label: 'status',
    transform: (value: number) => (
      <ChipView key={'status-online'} name={<FormattedMessage id="status" />} id={value} successLabel="online" errorLabel="offline" />
    )
  }
];

export const partnerDeviceViewConfig: FieldConfig[] = [
  { key: 'name', label: 'name' },
  { key: 'country', label: 'country' },
  { key: 'phoneNumber', label: 'phone-number' },
  { key: 'siteId', label: 'site' },
  { key: 'address', label: 'address', md: 12 },
  {
    key: 'status_id',
    label: 'status',
    transform: (value: number) => (
      <ChipView key={'status-online'} name={<FormattedMessage id="status" />} id={value} successLabel="online" errorLabel="offline" />
    )
  }
];

export const vlanViewConfig: FieldConfig[] = [
  { key: 'name', label: 'name' },
  { key: 'vlan', label: 'vlan' },
  { key: 'vlan_type', label: 'vlan_type' },
  { key: 'access_control_rule', label: 'access-control-rule', transform: booleanTransform },
  { key: 'all_lan', label: 'all-lan', transform: booleanTransform },
  { key: 'application', label: 'application' },
  { key: 'dhcp_L2_relay_enable', label: 'dhcp-L2-relay-enable', transform: booleanTransform },
  { key: 'dhcp_dhcpns', label: 'dhcp-dhcpns' },
  { key: 'dhcp_enable', label: 'dhcp-enable', transform: booleanTransform },
  { key: 'dhcp_guard_enable', label: 'dhcp-guard-enable', transform: booleanTransform },
  { key: 'dhcp_ip_addr_start', label: 'dhcp-ip-addr-start' },
  { key: 'dhcp_ip_addr_end', label: 'dhcp-ip-addr-end' },
  { key: 'dhcp_ip_range_start', label: 'dhcp-ip-range-start' },
  { key: 'dhcp_ip_range_end', label: 'dhcp-ip-range-end' },
  { key: 'dhcp_lease_time', label: 'dhcp-lease-time' },
  { key: 'dhcpv6_guard_enable', label: 'dhcpv6-guard-enable', transform: booleanTransform },
  { key: 'gateway_subnet', label: 'gateway-subnet' },
  { key: 'igmp_snoop_enable', label: 'igmp-snoop-enable', transform: booleanTransform },
  // {
  //   key: 'interface_ids',
  //   label: 'interface-ids',
  //   transform: (value: string) => (
  //     <div
  //       style={{
  //         maxWidth: '250px',
  //         overflowX: 'auto',
  //         whiteSpace: 'nowrap',
  //         wordBreak: 'break-all'
  //       }}
  //     >
  //       {value}
  //     </div>
  //   )
  // },
  // {
  //   key: 'lan_primary',
  //   label: 'lan-primary',
  //   transform: (value: string) => (
  //     <div
  //       style={{
  //         maxWidth: '250px',
  //         overflowWrap: 'anywhere',
  //         wordBreak: 'break-word'
  //       }}
  //     >
  //       {value}
  //     </div>
  //   )
  // },
  { key: 'mld_snoop_enable', label: 'mld-snoop-enable', transform: booleanTransform },
  { key: 'portal', label: 'portal', transform: booleanTransform },
  { key: 'purpose', label: 'purpose' },
  { key: 'rate_limit', label: 'rate-limit', transform: booleanTransform },

  { key: 'access_control_rule', label: 'access_control_rule-primary', transform: booleanTransform },

  { key: 'site.name', label: 'site' },
  {
    key: 'status_id',
    label: 'status',
    transform: (value: number) => (
      <ChipView key={'status-online'} name={<FormattedMessage id="status" />} id={value} successLabel="online" errorLabel="offline" />
    )
  }
];

export const portalDetailViewConfig: FieldConfig[] = [
  { key: 'name', label: 'name' },
  { key: 'site.name', label: 'site' },
  {
    key: 'band',
    label: 'band',
    transform: (value: number) => (value === 0 ? 'None' : value === 7 ? '2G/5G/6G' : value === 1 ? '2G' : '2G/5G')
  },
  {
    key: 'broadcast',
    label: 'broadcast',
    transform: (value: string) => (
      <ChipView
        key={'broadcast'}
        name={<FormattedMessage id="broadcast" />}
        id={value === 'true' ? 14 : 13}
        successLabel="enabled"
        errorLabel="disabled"
      />
    )
  },
  {
    key: 'vlan_enable',
    label: 'vlan-enable',
    transform: (value: string) => (
      <ChipView
        key={'vlan_enable'}
        name={<FormattedMessage id="vlan-enable" />}
        id={value === 'true' ? 14 : 13}
        successLabel="enabled"
        errorLabel="disabled"
      />
    )
  },
  {
    key: 'security',
    label: 'security',
    transform: (value: number) =>
      value === 0
        ? 'None'
        : value === 2
        ? 'WPA-Enterprise'
        : value === 3
        ? 'WPA-Personal'
        : value === 4
        ? 'PPSK without RADIUS'
        : 'PPSK with RADIUS'
  },
  {
    key: 'status_id',
    label: 'status',
    transform: (value: number) => (
      <ChipView key={'status-online'} name={<FormattedMessage id="status" />} id={value} successLabel="online" errorLabel="offline" />
    )
  },
  { key: 'ssid_hardware_id', label: 'ssid-hardware-id' },
  { key: 'client_rate_limit_profile_id', label: 'client-rate-limit-profile-id' },
  { key: 'multi_cast_enable', label: 'multi-cast-enable' },
  { key: 'multi_cast_filter_enable', label: 'multi-cast-filter-enable' },
  { key: 'multi_cast_filter_mac_group_Id', label: 'multi-cast-filter-mac-group-id' },
  { key: 'multi_cast_ipv6_cast_enable', label: 'multi-cast-ipv6-cast-enable' },
  { key: 'guest_net_enable', label: 'guest-net-enable' },
  { key: 'hide_pwd', label: 'hide-pwd' },
  { key: 'device_type', label: 'device-type' }
];

export const ssidViewConfig: FieldConfig[] = [
  { key: 'name', label: 'ssid.name' },
  { key: 'ssid_hardware_id', label: 'ssid.hardware-id' },
  { key: 'site.name', label: 'site' },
  { key: 'band', label: 'band', transform: bandTransform },
  { key: 'broadcast', label: 'broadcast', transform: booleanTransform },
  { key: 'guest_net_enable', label: 'guest-net-enable', transform: booleanTransform },
  { key: 'security', label: 'security', transform: securityTransform },
  { key: 'vlan_enable', label: 'vlan-enable', transform: booleanTransform },
  { key: 'vlan_id', label: 'vlan' },
  { key: 'mlo_enable', label: 'mlo-enable', transform: booleanTransform },
  { key: 'pmf_mode', label: 'pmf-mode', transform: pmfModeTransform },
  { key: 'enable_11r', label: 'enable-11r', transform: booleanTransform },
  { key: 'hide_pwd', label: 'hide-password', transform: booleanTransform },
  { key: 'gre_enable', label: 'gre-enable', transform: booleanTransform },
  { key: 'device_type', label: 'device-type' },
  {
    key: 'status_id',
    label: 'status',
    transform: (value: number) => (
      <ChipView key={'status'} name={<FormattedMessage id="status" />} id={value} successLabel="online" errorLabel="offline" />
    )
  }
];

export const radiusViewConfig: FieldConfig[] = [
  { key: 'name', label: 'name' },
  { key: 'ip_auth', label: 'ip-auth' },
  { key: 'port_auth', label: 'port-auth' },
  {
    key: 'pwd_auth',
    label: 'pwd-auth',
    transform: (value: string) => (
      <ChipView name={<FormattedMessage id="pwd-auth" />} isPassword={true} value={value} id={0} successLabel="" errorLabel="" />
    )
  },
  { key: 'ip_acct', label: 'ip-acct' },
  { key: 'port_acct', label: 'port-acct' },
  {
    key: 'pwd_acct',
    label: 'pwd-acct',
    transform: (value: string) => (
      <ChipView name={<FormattedMessage id="pwd-acct" />} isPassword={true} value={value} id={0} successLabel="" errorLabel="" />
    )
  },
  {
    key: 'is_update',
    label: 'is-update',
    transform: booleanTransform
  },
  {
    key: 'is_vlan_assign',
    label: 'is-vlan-assign',
    transform: booleanTransform
  },
  { key: 'radius_profile_id', label: 'radius-profile-id' },
  {
    key: 'update_interval_period',
    label: 'update-interval-period',
    unit: 'giây',
    transform: (value: number) => value?.toFixed(2)
  },
  { key: 'site.name', label: 'site' },
  {
    key: 'status_id',
    label: 'status',
    transform: (value: number) => (
      <ChipView key={'status'} name={<FormattedMessage id="status" />} id={value} successLabel="online" errorLabel="offline" />
    )
  }
];

export const voucherGroupViewConfig: FieldConfig[] = [
  { key: 'name', label: 'voucher-group.name' },
  { key: 'description', label: 'voucher-group.description' },
  { key: 'amount', label: 'voucher-group.amount' },
  { key: 'unitPrice', label: 'voucher-group.unit-price' },
  { key: 'currency', label: 'voucher-group.currency' },
  { key: 'codeLength', label: 'voucher-group.code-length' },
  { key: 'codeFrom', label: 'voucher-group.code-from', transform: codeFromTransform },
  { key: 'limitType', label: 'voucher-group.limit-type', transform: limitTypeTransform },
  { key: 'limitNum', label: 'voucher-group.limit-num' },
  { key: 'durationType', label: 'voucher-group.duration-type', transform: durationTypeTransform },
  { key: 'duration', label: 'voucher-group.duration', unit: 'giây' },
  { key: 'timingType', label: 'voucher-group.timing-type', transform: timingTypeTransform },
  { key: 'rateLimitMode', label: 'voucher-group.rate-limit-mode', transform: rateLimitModeTransform },
  { key: 'rateLimitId', label: 'voucher-group.rate-limit-id' },
  { key: 'customRateLimitDownEnable', label: 'voucher-group.down-enable', transform: booleanTransform },
  { key: 'customRateLimitDown', label: 'voucher-group.down-limit', unit: 'Kbps' },
  { key: 'customRateLimitUpEnable', label: 'voucher-group.up-enable', transform: booleanTransform },
  { key: 'customRateLimitUp', label: 'voucher-group.up-limit', unit: 'Kbps' },
  { key: 'trafficLimitEnable', label: 'voucher-group.traffic-enable', transform: booleanTransform },
  { key: 'trafficLimit', label: 'voucher-group.traffic-limit', unit: 'Kbps' },
  { key: 'trafficLimitFrequency', label: 'voucher-group.traffic-freq', transform: trafficFreqTransform },
  { key: 'validityType', label: 'voucher-group.validity-type', transform: validityTypeTransform },
  { key: 'effectiveTime', label: 'voucher-group.effective-time' },
  { key: 'expirationTime', label: 'voucher-group.expiration-time' },
  { key: 'logout', label: 'voucher-group.logout', transform: booleanTransform },
  { key: 'applyToAllPortals', label: 'voucher-group.apply-all-portals', transform: booleanTransform },
  { key: 'ssid.name', label: 'ssid' },
  { key: 'site.name', label: 'site' },
  {
    key: 'status_id',
    label: 'status',
    transform: (value: number) => (
      <ChipView key={'status'} name={<FormattedMessage id="status" />} id={value} successLabel="online" errorLabel="offline" />
    )
  }
];

export const passpointViewConfig: FieldConfig[] = [
  { key: 'fullname', label: 'fullname' },
  { key: 'phone_number', label: 'phoneNumber' },
  { key: 'ssid.name', label: 'ssid' },
  { key: 'token', label: 'token' },
  { key: 'url', label: 'url' },
  {
    key: 'status_id',
    label: 'status',
    transform: (value: number) => <ChipStatus key={'status'} id={value} successLabel="active" errorLabel="inactive" />
  }
];

export const agentViewConfig: FieldConfig[] = [
  { key: 'agent_name', label: 'agency-name' },
  { key: 'user.email', label: 'email' },
  {
    key: 'expiry_date',
    label: 'duration',
    transform: (value: string) => <div>{dayjs(value).format('DD/MM/YYYY')}</div>
  },
  {
    key: 'status_id',
    label: 'status',
    transform: (value: number) => <ChipStatus key="status" id={value} successLabel="active" errorLabel="inactive" />
  }
];

export const deviceConnectionLogViewConfig: FieldConfig[] = [
  { key: 'device_name', label: 'device-name' },
  { key: 'device_ip', label: 'ip-address' },
  { key: 'device_mac', label: 'mac-address' },
  { key: 'region_name', label: 'region' },
  {
    key: 'logged_at',
    label: 'logged-at',
    transform: (value: string) => <div>{dayjs(value).format('DD/MM/YYYY HH:mm:ss')}</div>
  },
  {
    key: 'connection_status',
    label: 'status',
    transform: (value: number) => <ChipStatus id={value} successLabel="connected" errorLabel="disconnected" />
  },
  { key: 'scan_type', label: 'scan-type' },
  { key: 'error_message', label: 'alert-message' }
];
