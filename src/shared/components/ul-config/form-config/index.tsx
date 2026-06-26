import { FieldConfig, PMFMode, SSIDSecurityMode } from 'shared/types';

export const endUserFields: FieldConfig[] = [
  { name: 'fullname', label: 'fullname', type: 'text', placeholder: 'enter-full-name', required: true, md: 6 },
  { name: 'email', label: 'email-address', type: 'email', placeholder: 'enter-email', required: true, md: 6 },
  { name: 'phoneNumber', label: 'phone-number', type: 'text', placeholder: 'enter-phone-number', required: true, md: 6 },
  { name: 'citizenId', label: 'citizen-id', type: 'text', placeholder: 'enter-citizen-id', md: 6 },
  { name: 'address', label: 'address', type: 'text', placeholder: 'enter-address', required: true, md: 6 },
  { name: 'ward', label: 'ward', type: 'text', placeholder: 'enter-ward', required: true, md: 6 },
  { name: 'district', label: 'district', type: 'text', placeholder: 'enter-district', required: true, md: 6 },
  { name: 'province', label: 'province', type: 'text', placeholder: 'enter-province', required: true, md: 6 },
  { name: 'country', label: 'country', type: 'text', placeholder: 'enter-country', required: true, md: 6 },
  { name: 'postcode', label: 'postcode', type: 'text', placeholder: 'enter-postcode', md: 6 },
  { name: 'username', label: 'username', type: 'text', placeholder: 'enter-username', required: true, md: 12 },
  { name: 'password', label: 'password', type: 'password', placeholder: 'enter-password', required: true, md: 12 }
];

export const adFields: FieldConfig[] = [
  { name: 'templateName', label: 'name-template', type: 'text', placeholder: 'enter-name-template', required: true, md: 12 },
  {
    name: 'adType',
    label: 'ad-type',
    type: 'select',
    placeholder: 'select-ad-type',
    options: [
      {
        value: 'survey',
        label: 'Survey'
      },
      {
        value: 'survey2',
        label: 'Survey OTP'
      },
      {
        value: 'banner',
        label: 'Banner'
      },
      {
        value: 'video1',
        label: 'Video'
      },
      {
        value: 'video2',
        label: 'Video & banner'
      }
      // {
      //   value: '3rd_party',
      //   label: 'Third Party'
      // }
    ],
    required: true,
    md: 12
  },
  // {
  //   name: 'placement',
  //   label: 'placement',
  //   type: 'select',
  //   options: [
  //     {
  //       value: 'T3 TSN',
  //       label: 'T3 TSN'
  //     },
  //     {
  //       value: 'Phú Quốc',
  //       label: 'Phú Quốc'
  //     }
  //   ],
  //   placeholder: 'select-placement',
  //   md: 12,
  //   required: true
  // },
  {
    name: 'time',
    label: 'time',
    type: 'timeRange',
    options: [],
    placeholder: 'select-site',
    md: 12,
    required: true
  },
  {
    name: 'siteId',
    label: 'site',
    type: 'select',
    options: [],
    placeholder: 'select-site',
    md: 12,
    required: true
  },
  {
    name: 'SSID',
    label: 'ssid',
    type: 'select',
    options: [],
    placeholder: 'select-ssid',
    md: 12,
    required: true
  }
];

export const siteFields: FieldConfig[] = [
  { name: 'location', label: 'location', type: 'map', required: false, md: 12 },
  { name: 'name', label: 'name', type: 'text', placeholder: 'enter-name-site', required: true, md: 6 },
  { name: 'country', label: 'country', type: 'text', placeholder: 'enter-country', required: true, md: 6 },
  { name: 'address', label: 'address', type: 'text', placeholder: 'enter-address', required: true, md: 12 },
  // { name: 'latLocation', label: 'latitude', type: 'text', placeholder: 'enter-latitude', required: true, md: 6 },
  // { name: 'longLocation', label: 'longitude', type: 'text', placeholder: 'enter-longitude', required: true, md: 6 },
  { name: 'scenario', label: 'scenario', type: 'select', options: [], placeholder: 'select-scenario', md: 12 },
  { name: 'regionId', label: 'region', type: 'select', options: [], placeholder: 'select-region', md: 12 }
];

export const partnerFields: FieldConfig[] = [
  { name: 'name', label: 'name', type: 'text', placeholder: 'enter-name-partner', required: true, md: 12 },
  { name: 'phoneNumber', label: 'phone-number', type: 'text', placeholder: 'enter-phone-number', required: true, md: 8 },
  { name: 'country', label: 'country', type: 'text', placeholder: 'enter-country', required: true, md: 4 },
  { name: 'address', label: 'address', type: 'text', placeholder: 'enter-address', required: true, md: 12 },
  { name: 'partnerAdAccessId', label: 'ads-access', type: 'select', placeholder: 'enter-address', required: true, md: 12 },
  {
    name: 'siteId',
    label: 'site',
    type: 'select',
    options: [],
    placeholder: 'select-site',
    md: 12,
    required: true
  },
  { name: 'fromDate', secondField: 'expiredDate', label: 'time', type: 'rangeDatePicker', required: true, md: 12 },
  { name: 'description', label: 'desc', type: 'text', placeholder: 'enter-desc', md: 12, row: 2 }
];

export const ssidFields: FieldConfig[] = [
  { name: 'name', label: 'name', type: 'text', placeholder: 'enter-name-ssid', required: true, md: 8 },
  {
    name: 'type',
    label: 'type',
    type: 'select',
    options: [
      { value: 'marketing', label: 'Marketing' },
      { value: 'hotspot', label: 'Hotspot' }
    ],
    placeholder: 'select-type',
    required: true,
    md: 4
  },
  {
    name: 'partnerId',
    label: 'partner',
    type: 'select',
    options: [],
    placeholder: 'select-partner',
    required: true,
    md: 6
  },
  {
    name: 'siteId',
    label: 'site',
    type: 'select',
    options: [],
    placeholder: 'select-site',
    required: true,
    md: 6
  },
  {
    name: 'deviceId',
    label: 'device',
    type: 'select',
    options: [],
    placeholder: 'select-device',
    required: true,
    md: 6
  },
  {
    name: 'deviceType',
    label: 'device-type',
    type: 'select',
    placeholder: 'select-device-type', //add option
    options: [],
    required: true,
    md: 6
  },
  {
    name: 'band',
    label: 'band',
    type: 'select',
    placeholder: 'select-band',
    options: [
      { value: 0, label: '2.4GHz' },
      { value: 1, label: '5GHz' },
      { value: 3, label: '6GHz' },
      { value: 7, label: '2.4GHz/5GHz/6GHz' }
    ],
    required: true,
    md: 6
  },
  {
    name: 'security',
    label: 'security',
    type: 'select',
    options: [
      { value: SSIDSecurityMode.None, label: 'Không có' },
      { value: SSIDSecurityMode.WPAEnterprise, label: 'WPA Enterprise' },
      { value: SSIDSecurityMode.WPAPersonal, label: 'WPA Personal' },
      { value: SSIDSecurityMode.PPSKWithoutRADIUS, label: 'PPSK không RADIUS' },
      { value: SSIDSecurityMode.PPSKWithRADIUS, label: 'PPSK với RADIUS' }
    ],
    placeholder: 'select-security-mode',
    required: true,
    md: 6
  },
  {
    name: 'guestNetEnable',
    label: 'guest-net',
    type: 'switch',
    required: true,
    md: 6
  },

  {
    name: 'broadcast',
    label: 'broadcast',
    type: 'switch',
    required: true,
    md: 6
  },
  {
    name: 'vlanEnable',
    label: 'vlan-enable',
    type: 'switch',
    required: true,
    md: 6
  },

  {
    name: 'mIoEnable',
    label: 'mio-enable',
    type: 'switch',
    required: true,
    md: 6
  },
  {
    name: 'vlanId',
    label: 'vlan',
    type: 'select',
    placeholder: 'select-vlan',
    options: [],
    md: 12
  },
  {
    name: 'pmfMode',
    label: 'pmf-mode',
    type: 'select',
    options: [
      { value: PMFMode.Mandatory, label: 'Bắt buộc' },
      { value: PMFMode.Capable, label: 'Có khả năng' },
      { value: PMFMode.Disable, label: 'Vô hiệu hóa' }
    ],
    placeholder: 'select-pmf-mode',
    required: true,
    md: 12
  },
  {
    name: 'enable11r',
    label: 'enable-11r',
    type: 'switch',
    required: true,
    md: 6
  },
  {
    name: 'hidePwd',
    label: 'hide-password',
    type: 'switch',
    required: true,
    md: 6
  },
  {
    name: 'greEnable',
    label: 'gre-enable',
    type: 'switch',
    required: true,
    md: 6
  },
  {
    name: 'wlanId',
    label: 'wlan',
    type: 'select',
    placeholder: 'select-wlan',
    options: [],
    required: true,
    md: 12
  }
];

// export const deviceFields: FieldConfig[] = [
//   { name: 'name', label: 'name', type: 'text', placeholder: 'enter-name-device', required: true, md: 7 },
//   { name: 'firmware', label: 'firmware', type: 'text', placeholder: 'enter-firmware', required: true, md: 5 },
//   {
//     name: 'siteId',
//     label: 'site',
//     type: 'select',
//     options: [],
//     placeholder: 'select-site',
//     md: 12,
//     required: true
//   },
//   { name: 'ipAddress', label: 'ip-address', type: 'text', placeholder: 'enter-ip-address', required: true, md: 6 },
//   { name: 'macAddress', label: 'mac-address', type: 'text', placeholder: 'enter-mac-address', required: true, md: 6 },
//   { name: 'model', label: 'model', type: 'text', placeholder: 'enter-model', required: true, md: 6 },
//   {
//     name: 'wifiStandard',
//     label: 'wifi-standard',
//     type: 'select',
//     options: [
//       {
//         label: '802.11a',
//         value: '802.11a'
//       },
//       {
//         label: '802.11b',
//         value: '802.11b'
//       },
//       {
//         label: '802.11g',
//         value: '802.11g'
//       },
//       {
//         label: '802.11n',
//         value: '802.11n'
//       },
//       {
//         label: '802.11ac',
//         value: '802.11ac'
//       },
//       {
//         label: '802.11ax',
//         value: '802.11ax'
//       },
//       {
//         label: '802.11be',
//         value: '802.11be'
//       }
//     ],
//     placeholder: 'select-wifi-standard',
//     md: 6,
//     required: true
//   },
//   { name: 'manufacturerDate', label: 'manufacture-date', type: 'date', md: 12 },

//   { name: 'description', label: 'desc', type: 'text', md: 12 }
// ];

export const deviceFields: FieldConfig[] = [
  { name: 'name', label: 'name', type: 'text', placeholder: 'enter-name-device', required: true, md: 12 },
  { name: 'description', label: 'desc', type: 'text', placeholder: 'enter-desc', md: 12, row: 2 },
  { name: 'ipAddress', label: 'ip-address', type: 'text', placeholder: 'enter-ip-address', required: true, md: 6 },
  { name: 'macAddress', label: 'mac-address', type: 'text', placeholder: 'enter-mac-address', required: true, md: 6 },
  { name: 'firmware', label: 'firmware', type: 'text', placeholder: 'enter-firmware', required: false, md: 6 },
  {
    name: 'wifiStandard',
    label: 'wifi-standard',
    type: 'select',
    options: [
      { label: '802.11a', value: '802.11a' },
      { label: '802.11b', value: '802.11b' },
      { label: '802.11g', value: '802.11g' },
      { label: '802.11n', value: '802.11n' },
      { label: '802.11ac', value: '802.11ac' },
      { label: '802.11ax', value: '802.11ax' },
      { label: '802.11be', value: '802.11be' }
    ],
    placeholder: 'select-wifi-standard',
    required: true,
    md: 6
  },
  { name: 'model', label: 'model', type: 'text', placeholder: 'enter-model', required: false, md: 6 },
  { name: 'manufacturerDate', label: 'manufacture-date', type: 'date', required: false, md: 6 },
  { name: 'partnerId', label: 'partner', type: 'select', placeholder: 'select-partner', required: true, md: 6 },
  { name: 'url', label: 'interface-access-address', type: 'text', placeholder: 'enter-interface-access-address', required: true, md: 6 },
  { name: 'username', label: 'username', type: 'text', placeholder: 'enter-username', required: true, md: 6 },
  { name: 'password', label: 'password', type: 'password', placeholder: 'enter-password', required: true, md: 6 },
  { name: 'clientId', label: 'client-id', type: 'text', placeholder: 'enter-client-id', required: true, md: 6 },
  { name: 'Id', label: 'Id', type: 'text', placeholder: 'enter-id', required: true, md: 6 },
  { name: 'clientSecret', label: 'client-secret', type: 'text', placeholder: 'enter-client-secret', required: true, md: 12 },
  { name: 'regionId', label: 'region', type: 'select', placeholder: 'select-region', required: true, md: 12, readOnly: true } // Sẽ được điền tự động từ Step 1
];

export const radiusFields: FieldConfig[] = [
  { name: 'radius-info', label: 'radius-info', type: 'categories', md: 12 },
  { name: 'name', label: 'name', type: 'text', placeholder: 'enter-name-radius-server', required: true, md: 12 },
  { name: 'siteId', label: 'site', type: 'select', options: [], placeholder: 'select-site', required: true, md: 12 },
  { name: 'isAcct', label: 'accounting', type: 'switch', placeholder: 'select-acct', required: true, md: 4 },
  { name: 'radius-server-config', label: 'radius-server-config', type: 'categories', md: 12 },
  { name: 'ipAuth', label: 'ip-auth', type: 'text', placeholder: 'enter-ip-auth', required: true, md: 6 },
  { name: 'portAuth', label: 'port-auth', type: 'number', placeholder: 'enter-port-auth', required: true, md: 6 },
  { name: 'pwdAuth', label: 'pwd-auth', type: 'text', placeholder: 'enter-pwd-auth', required: true, md: 12 }
];

export const radiusFullFields: FieldConfig[] = [
  { name: 'radius-info', label: 'radius-info', type: 'categories', md: 12 },
  { name: 'name', label: 'name', type: 'text', placeholder: 'enter-name-radius-server', required: true, md: 12 },
  { name: 'siteId', label: 'site', type: 'select', options: [], placeholder: 'select-site', required: true, md: 12 },
  { name: 'isAcct', label: 'accounting', type: 'switch', placeholder: 'select-acct', required: true, md: 4 },
  { name: 'isUpdate', label: 'update', type: 'switch', placeholder: 'select-is-update', required: true, md: 4 },
  { name: 'isVlanAssign', label: 'vlan-assign', type: 'switch', placeholder: 'select-is-update', required: true, md: 4 },
  {
    name: 'updateIntervalPeriod',
    label: 'update-interval-period',
    type: 'number',
    placeholder: 'enter-update-interval-period',
    md: 12,
    unit: 'seconds',
    required: true
  },
  { name: 'radius-server-config', label: 'radius-server-config', type: 'categories', md: 12 },
  { name: 'ipAuth', label: 'ip-auth', type: 'text', placeholder: 'enter-ip-auth', required: true, md: 6 },
  { name: 'portAuth', label: 'port-auth', type: 'number', placeholder: 'enter-port-auth', required: true, md: 6 },
  { name: 'pwdAuth', label: 'pwd-auth', type: 'text', placeholder: 'enter-pwd-auth', required: true, md: 12 },
  { name: 'ipAcct', label: 'ip-acct', type: 'text', placeholder: 'enter-ip-acct', required: true, md: 6 },
  { name: 'portAcct', label: 'port-acct', type: 'number', placeholder: 'enter-port-acct', required: true, md: 6 },
  { name: 'pwdAcct', label: 'pwd-acct', type: 'text', placeholder: 'enter-pwd-acct', required: true, md: 12 }
];

export const restrictionDevicesFields: FieldConfig[] = [
  { name: 'deviceName', label: 'device-name', type: 'text', placeholder: 'enter-device-name', required: true },
  { name: 'ipAddress', label: 'ip-address', type: 'text', placeholder: 'enter-ip-address', required: true },
  { name: 'ipv6Address', label: 'ipv6-address', type: 'text', placeholder: 'enter-ip-address', required: true },
  { name: 'macAddress', label: 'mac-address', type: 'text', placeholder: 'enter-mac-address', required: true },
  {
    name: 'regionId',
    label: 'region',
    type: 'select',
    placeholder: 'select-region',
    required: true,
    md: 12,
    options: []
  },
  {
    name: 'siteId',
    label: 'site',
    type: 'select',
    placeholder: 'select-site',
    required: true,
    md: 12,
    options: []
  },
  { name: 'reason', label: 'restriction-reason', type: 'text', placeholder: 'enter-restriction-reason', required: true, md: 12 }
];

export const restrictionDomainFields: FieldConfig[] = [
  { name: 'name', label: 'domain', type: 'text', placeholder: 'enter-domain-name', required: true, md: 12 },
  {
    name: 'categoryId',
    label: 'category',
    type: 'select',
    placeholder: 'choose-category-web',
    required: true,
    md: 12,
    options: []
  },
  { name: 'url', label: 'url', type: 'text', placeholder: 'enter-url', required: true, md: 12 },
  { name: 'ipAddress', label: 'ip-address', type: 'text', placeholder: 'enter-ip-address', required: true, md: 12 },
  { name: 'ipv6Address', label: 'ipv6-address', type: 'text', placeholder: 'enter-ipv6-address', required: true, md: 12 },
  { name: 'dnsAddress', label: 'dns-address', type: 'text', placeholder: 'enter-restriction-reason', required: true, md: 12 },
  { name: 'reason', label: 'restriction-reason', type: 'text', placeholder: 'enter-restriction-reason', required: true, md: 12 }
];

export const wlanFields: FieldConfig[] = [
  { name: 'name', label: 'name-wlan', type: 'text', placeholder: 'enter-wlan-name', required: true, md: 12 },
  {
    name: 'siteId',
    label: 'site',
    type: 'select',
    options: [],
    placeholder: 'select-site',
    md: 12,
    required: true
  }
];

export const vlanFields: FieldConfig[] = [
  { name: 'name', label: 'name-lan', type: 'text', placeholder: 'enter-lan-name', required: true, md: 12 },
  {
    name: 'siteId',
    label: 'site',
    type: 'select',
    options: [],
    placeholder: 'select-site',
    md: 12,
    required: true
  }
];

export const airlineFields: FieldConfig[] = [
  { name: 'name', label: 'name-airline', type: 'text', placeholder: 'enter-airline-name', required: true, md: 12 },
  { name: 'description', label: 'desc', type: 'text', placeholder: 'enter-desc', required: true, md: 12 },
  { name: 'code', label: 'code', type: 'text', placeholder: 'enter-code', required: true, md: 6 },
  { name: 'origin', label: 'origin', type: 'text', placeholder: 'enter-origin', required: true, md: 6 },
  { name: 'phone', label: 'phone-number', type: 'text', placeholder: 'enter-phone-number', required: true, md: 6 },
  { name: 'email', label: 'email', type: 'email', placeholder: 'enter-email', required: true, md: 6 },
  { name: 'imageLink', label: 'image-link', type: 'text', placeholder: 'enter-image-link', required: true, md: 12 },
  { name: 'counterLocation', label: 'counter-location', type: 'text', placeholder: 'enter-counter-location', required: true, md: 12 }
];

export const airportFields: FieldConfig[] = [
  { name: 'name', label: 'name-airport', type: 'text', placeholder: 'enter-name-airport', required: true, md: 12 },
  { name: 'code', label: 'code', type: 'text', placeholder: 'enter-code', required: true, md: 12 },
  { name: 'latLocation', label: 'latitude', type: 'text', placeholder: 'enter-latitude', required: true, md: 12 },
  { name: 'longLocation', label: 'longitude', type: 'text', placeholder: 'enter-longitude', required: true, md: 12 }
];

export const facilitiesFields: FieldConfig[] = [
  { name: 'name', label: 'name-facilities', type: 'text', placeholder: 'enter-name-facilities', required: true, md: 12 },
  { name: 'description', label: 'desc', type: 'text', placeholder: 'enter-desc', required: true, md: 12 },
  { name: 'airportId', label: 'airport-name', type: 'select', placeholder: 'select-airport', options: [], required: true, md: 6 },
  { name: 'type', label: 'type', type: 'text', placeholder: 'enter-type', required: true, md: 6 },
  { name: 'imageLink', label: 'image-link', type: 'text', placeholder: 'enter-image-link', required: true, md: 12 },
  { name: 'latLocation', label: 'latitude', type: 'text', placeholder: 'enter-latitude', required: true, md: 6 },
  { name: 'longLocation', label: 'longitude', type: 'text', placeholder: 'enter-longitude', required: true, md: 6 },
  { name: 'floor', label: 'floor', type: 'text', placeholder: 'enter-floor', required: true, md: 6 }
];

export const productFields: FieldConfig[] = [
  { name: 'name', label: 'name-product', type: 'text', placeholder: 'enter-name-product', required: true, md: 12 },
  { name: 'description', label: 'desc', type: 'text', placeholder: 'enter-desc', required: true, md: 12 },
  { name: 'price', label: 'price', type: 'number', placeholder: 'enter-price', required: true, md: 12 }
];

export const cmsFields: FieldConfig[] = [
  { name: 'title', label: 'title', type: 'text', placeholder: 'enter-name-cms', required: true, md: 12 },
  { name: 'description', label: 'desc', type: 'text', placeholder: 'enter-desc', required: true, md: 12, row: 2 },
  { name: 'expiredAt', label: 'expired', type: 'date', placeholder: 'select-expired', required: true, md: 6 },
  { name: 'mediaUrl', label: 'media-url', type: 'text', placeholder: 'enter-media-URL', required: true, md: 12 },
  {
    name: 'type',
    label: 'type',
    type: 'select',
    placeholder: 'select-type',
    options: [],
    required: true,
    md: 6
  },
  { name: 'facilityId', label: 'facility', type: 'select', placeholder: 'select-facility', required: false, md: 6 },
  { name: 'airportId', label: 'airport', type: 'select', placeholder: 'select-airport', required: true, md: 6 },
  { name: 'priority', label: 'priority', type: 'number', placeholder: 'enter-priority-level', required: true, md: 6 }
];

export const regionFields: FieldConfig[] = [
  { name: 'location', label: 'location', type: 'map', required: false, md: 12 },
  { name: 'name', label: 'name', type: 'text', placeholder: 'enter-name-region', required: true, md: 12 },
  { name: 'address', label: 'address', type: 'text', placeholder: 'enter-address', required: true, md: 12 },
  // { name: 'latLocation', label: 'latitude', type: 'text', placeholder: 'enter-latitude', md: 6 },
  // { name: 'longLocation', label: 'longitude', type: 'text', placeholder: 'enter-longitude', md: 6 },
  { name: 'description', label: 'desc', type: 'text', placeholder: 'enter-desc', md: 12, row: 2 }
];

export const campaignFields: FieldConfig[] = [
  {
    name: 'name',
    label: 'name-campaign',
    type: 'text',
    placeholder: 'enter-name-campaign',
    required: true,
    md: 12
  },
  {
    name: 'priority',
    label: 'priority',
    type: 'text',
    placeholder: 'select-priority-level',
    required: true,
    md: 12
  },
  {
    name: 'amount',
    label: 'amount-ad',
    type: 'number',
    placeholder: 'enter-amount',
    required: true,
    md: 12
  },
  {
    name: 'dailyLimit',
    label: 'daily-limit',
    type: 'number',
    placeholder: 'enter-daily-limit',
    required: true,
    md: 6
  },
  {
    name: 'impressionDailyLimit',
    label: 'daily-view-limit',
    type: 'number',
    placeholder: 'enter-daily-view-limit',
    required: true,
    md: 6
  },
  {
    name: 'clickLimit',
    label: 'click-limit',
    type: 'number',
    placeholder: 'enter-click-limit',
    required: true,
    md: 6
  },

  {
    name: 'impressionLimit',
    label: 'impression-limit',
    type: 'number',
    placeholder: 'enter-impression-limit',
    required: true,
    md: 6
  },

  {
    name: 'regionId',
    label: 'region',
    type: 'select',
    options: [],
    placeholder: 'select-region',
    required: true,
    md: 12
  },
  {
    name: 'siteId',
    label: 'site',
    type: 'select',
    options: [],
    placeholder: 'select-site',
    required: true,
    md: 12
  },
  {
    name: 'adId',
    label: 'ad',
    type: 'auto-complete',
    placeholder: 'select-ad',
    required: true,
    md: 12
  },
  {
    name: 'adPartnerId',
    label: 'ad-partner',
    type: 'select',
    placeholder: 'select-partner',
    required: true,
    md: 12
  },
  {
    name: 'startDate',
    label: 'start-date',
    type: 'date',
    required: true,
    md: 6
  },
  {
    name: 'expiredDate',
    label: 'expired-date',
    type: 'date',
    required: true,
    md: 6
  }
];

export const ratelimitFields: FieldConfig[] = [
  { name: 'name', label: 'name', type: 'text', placeholder: 'enter-name-profile', required: true, md: 12 },
  { name: 'downLimitEnable', label: 'down-limit-enable', type: 'switch', required: true, md: 6 },
  { name: 'upLimitEnable', label: 'up-limit-enable', type: 'switch', required: true, md: 6 },
  { name: 'downLimit', label: 'down-limit', type: 'number', required: true, md: 6 },
  { name: 'upLimit', label: 'up-limit', type: 'number', required: true, md: 6 },
  { name: 'siteId', label: 'site', type: 'select', options: [], placeholder: 'select-site', required: true, md: 12 }
];

export const portalFields: FieldConfig[] = [
  { name: 'name', label: 'name', type: 'text', placeholder: 'enter-portal-name', required: true, md: 12 },
  { name: 'enable', label: 'enable', type: 'switch', required: true, md: 6 },
  {
    name: 'ssidList',
    label: 'ssid-list',
    type: 'checkmark',
    options: [],
    placeholder: 'select-ssid',
    required: true,
    md: 12
  },
  {
    name: 'networkList',
    label: 'network-list',
    type: 'checkmark',
    options: [],
    placeholder: 'select-network',
    required: false,
    md: 12
  },
  {
    name: 'authType',
    label: 'auth-type',
    type: 'select',
    options: [
      { label: 'no-authenticate', value: 0 },
      { label: 'simple-password', value: 1 },
      { label: 'external-radius-server', value: 2 },
      { label: 'external-portal-server', value: 4 },
      { label: 'hotspot', value: 11 }
    ],
    placeholder: 'enter-auth-type',
    required: true,
    md: 6
  },
  { name: 'customTimeout', label: 'custom-timeout', type: 'number', placeholder: 'enter-custom-timeout', md: 6 },
  { name: 'customTimeoutUnit', label: 'timeout-unit', type: 'number', placeholder: 'enter-timeout-unit', md: 6 },
  { name: 'httpsRedirectEnable', label: 'https-redirect', type: 'switch', md: 6 },
  { name: 'landingPage', label: 'landing-page', type: 'select', options: [], placeholder: 'select-landing-page', md: 6 },
  {
    name: 'landingUrlScheme',
    label: 'landing-url-scheme',
    type: 'select',
    options: [
      { label: 'Http', value: 'http' },
      { label: 'Https', value: 'https' }
    ],
    placeholder: 'select-landing-url-scheme',
    md: 6
  },
  { name: 'landingUrl', label: 'landing-url', type: 'text', placeholder: 'enter-landing-url', md: 12 },
  { name: 'password', label: 'password', type: 'password', placeholder: 'enter-password', md: 12 },
  {
    name: 'hostType',
    label: 'host-type',
    type: 'select',
    options: [
      { label: 'IP', value: 1 },
      { label: 'URL', value: 2 }
    ],
    placeholder: 'select-host-type',
    required: true,
    md: 6
  },
  { name: 'serverIp', label: 'server-ip', type: 'text', placeholder: 'enter-server-ip (comma-separated)', md: 12 },
  { name: 'serverPort', label: 'server-port', type: 'number', placeholder: 'enter-server-port', md: 6 },
  { name: 'serverUrlScheme', label: 'server-url-scheme', type: 'text', placeholder: 'enter-server-url-scheme', md: 6 },
  { name: 'serverUrl', label: 'server-url', type: 'text', placeholder: 'enter-server-url', md: 12 },
  { name: 'radiusProfileId', label: 'radius-profile-id', type: 'select', placeholder: 'select-radius', md: 12 },
  { name: 'siteId', label: 'site', type: 'select', options: [], placeholder: 'select-site', required: true, md: 12 },
  {
    name: 'externalRadiusAuthMode',
    label: 'radius-auth-mode',
    type: 'select',
    options: [
      { label: 'PAP', value: 1 },
      { label: 'CHAP', value: 2 }
    ],
    placeholder: 'select-radius-auth-mode',
    required: true,
    md: 12
  },
  { name: 'nasId', label: 'nas', type: 'select', options: [], placeholder: 'select-nas', required: true, md: 12 },
  {
    name: 'portalCustom',
    label: 'portal-custom',
    type: 'select',
    options: [
      { label: 'PAP', value: 1 },
      { label: 'CHAP', value: 2 }
    ],
    placeholder: 'select-site',
    required: true,
    md: 12
  },
  {
    name: 'externalUrl',
    label: 'external-url',
    type: 'select',
    options: [
      { label: 'Http', value: 'http' },
      { label: 'Https', value: 'https' }
    ],
    placeholder: 'select-external-url',
    required: true,
    md: 12
  },
  {
    name: 'disconnectReq',
    label: 'disconnect-req',
    type: 'number',
    placeholder: 'enter-disconnect-req',
    required: true,
    md: 12
  }
];

export const voucherFields: FieldConfig[] = [
  { name: 'name', label: 'voucher-name', type: 'text', placeholder: 'enter-voucher-name', required: true, md: 12 },
  {
    name: 'siteId',
    label: 'site',
    type: 'select',
    options: [],
    placeholder: 'select-site',
    required: true,
    md: 12
  },
  {
    name: 'amount',
    label: 'voucher-amount',
    type: 'number',
    placeholder: 'enter-voucher-amount',
    required: true,
    md: 6
  },
  {
    name: 'codeLength',
    label: 'voucher-code-length',
    type: 'number',
    placeholder: 'enter-voucher-code-length',
    required: true,
    md: 6
  },
  {
    name: 'codeFrom',
    label: 'voucher-code-from',
    type: 'select',
    options: [
      { value: 0, label: 'Numbers only' },
      { value: 1, label: 'Numbers and letters' }
    ],
    placeholder: 'select-voucher-code-from',
    required: true,
    md: 6
  },
  {
    name: 'limitType',
    label: 'voucher-limit-type',
    type: 'select',
    options: [
      { value: 0, label: 'Limited Usage Counts' },
      { value: 1, label: 'Limited Online Users' },
      { value: 2, label: 'Unlimited' }
    ],
    placeholder: 'select-voucher-limit-type',
    required: true,
    md: 6
  },
  {
    name: 'limitNum',
    label: 'voucher-limit-num',
    type: 'number',
    placeholder: 'enter-voucher-limit-num',
    required: true,
    md: 6
  },
  {
    name: 'durationType',
    label: 'voucher-duration-type',
    type: 'select',
    options: [
      { value: 0, label: 'Client duration' },
      { value: 1, label: 'Voucher duration' }
    ],
    placeholder: 'select-voucher-duration-type',
    required: true,
    md: 6
  },
  {
    name: 'duration',
    label: 'voucher-duration',
    type: 'number',
    placeholder: 'enter-voucher-duration',
    required: true,
    md: 6,
    unit: 'seconds'
  },
  {
    name: 'timingType',
    label: 'voucher-timing-type',
    type: 'select',
    options: [
      { value: 0, label: 'Timing by time' },
      { value: 1, label: 'Timing by usage' }
    ],
    placeholder: 'select-voucher-timing-type',
    required: true,
    md: 6
  },
  {
    name: 'rateLimitMode',
    label: 'voucher-rate-limit-mode',
    type: 'select',
    options: [
      { value: 0, label: 'Custom Rate Limit' },
      { value: 1, label: 'Rate Limit Profiled' }
    ],
    placeholder: 'select-voucher-rate-limit-mode',
    required: true,
    md: 6
  },
  {
    name: 'rateLimitId',
    label: 'voucher-rate-limit-id',
    type: 'select',
    options: [],
    placeholder: 'select-voucher-rate-limit-id',
    md: 6
  },
  {
    name: 'customRateLimitDownEnable',
    label: 'voucher-custom-rate-limit-down-enable',
    type: 'switch',
    required: true,
    md: 6
  },
  {
    name: 'customRateLimitDown',
    label: 'voucher-custom-rate-limit-down',
    type: 'number',
    placeholder: 'enter-voucher-custom-rate-limit-down',
    md: 6,
    unit: 'Kbps'
  },
  {
    name: 'customRateLimitUpEnable',
    label: 'voucher-custom-rate-limit-up-enable',
    type: 'switch',
    required: true,
    md: 6
  },
  {
    name: 'customRateLimitUp',
    label: 'voucher-custom-rate-limit-up',
    type: 'number',
    placeholder: 'enter-voucher-custom-rate-limit-up',
    md: 6,
    unit: 'Kbps'
  },
  {
    name: 'trafficLimitEnable',
    label: 'voucher-traffic-limit-enable',
    type: 'switch',
    required: true,
    md: 6
  },
  {
    name: 'trafficLimit',
    label: 'voucher-traffic-limit',
    type: 'number',
    placeholder: 'enter-voucher-traffic-limit',
    md: 6,
    unit: 'Kbps'
  },
  {
    name: 'trafficLimitFrequency',
    label: 'voucher-traffic-limit-frequency',
    type: 'select',
    options: [
      { value: 0, label: 'Option 0' },
      { value: 1, label: 'Option 1' }
    ],
    placeholder: 'select-voucher-traffic-limit-frequency',
    md: 6
  },
  {
    name: 'unitPrice',
    label: 'voucher-unit-price',
    type: 'number',
    placeholder: 'enter-voucher-unit-price',
    required: true,
    md: 6
  },
  {
    name: 'currency',
    label: 'voucher-currency',
    type: 'text',
    placeholder: 'enter-voucher-currency',
    required: true,
    md: 6
  },
  {
    name: 'applyToAllPortals',
    label: 'voucher-apply-to-all-ports',
    type: 'switch',
    required: true,
    md: 6
  },
  // {
  //   name: 'portals',
  //   label: 'voucher-ports',
  //   type: 'checkmark',
  //   options: [],
  //   placeholder: 'select-voucher-ports',
  //   md: 12
  // },
  {
    name: 'expirationTime',
    label: 'voucher-expiration-time',
    type: 'number',
    required: true,
    md: 6,
    future: true
  },
  {
    name: 'effectiveTime',
    label: 'voucher-effective-time',
    type: 'number',
    required: true,
    md: 6,
    future: true
  },
  {
    name: 'logout',
    label: 'voucher-logout',
    type: 'switch',
    md: 6
  },
  {
    name: 'description',
    label: 'voucher-description',
    type: 'text',
    placeholder: 'enter-voucher-description',
    md: 12,
    row: 2
  },
  {
    name: 'validityType',
    label: 'voucher-validity-type',
    type: 'select',
    options: [
      { value: 0, label: 'Any time' },
      { value: 1, label: 'Between effective and expiration time' },
      { value: 2, label: 'Specific time period' }
    ],
    placeholder: 'select-voucher-validity-type',
    required: true,
    md: 6
  },
  {
    name: 'ssidId',
    label: 'voucher-ssid-id',
    type: 'checkmark',
    options: [],
    placeholder: 'select-voucher-ssid-id',
    required: true,
    md: 12
  }
];

export const passpointFields: FieldConfig[] = [
  // {
  //   name: 'ssidId',
  //   label: 'voucher-ssid-id',
  //   type: 'select',
  //   options: [],
  //   placeholder: 'select-voucher-ssid-id',
  //   required: true,
  //   md: 12
  // },
  {
    name: 'fullname',
    label: 'fullname',
    type: 'text',
    placeholder: 'enter-full-name',
    md: 12
  },
  {
    name: 'email',
    label: 'email',
    type: 'text',
    placeholder: 'enter-email',
    md: 12
  },
  {
    name: 'phoneNumber',
    label: 'phoneNumber',
    type: 'text',
    placeholder: 'enter-phone-number',
    md: 12
  }
];

export const agencyFields: FieldConfig[] = [
  {
    name: 'agent_name',
    label: 'agency-name',
    type: 'text',
    placeholder: 'placeholder-agency-name',
    md: 12,
    required: true
  },
  {
    name: 'expiry_date',
    label: 'duration',
    type: 'date',
    placeholder: 'select-expired',
    md: 12,
    required: true
  },
  {
    name: 'user_id',
    label: 'user-info',
    type: 'select',
    options: [],
    placeholder: 'select-end-user',
    md: 12,
    required: true
  }
];
