import * as Yup from 'yup';
import { useIntl } from 'react-intl';

function useValidationSchemas(isEditMode?: boolean) {
  const intl = useIntl();

  const EndUserSchema = Yup.object().shape({
    fullname: Yup.string()
      .max(255)
      .required(intl.formatMessage({ id: 'full-name-required' })),
    email: Yup.string()
      .max(255)
      .matches(/^\S*$/, intl.formatMessage({ id: 'no-spaces-allowed' }))
      .email(intl.formatMessage({ id: 'email-invalid' }))
      .required(intl.formatMessage({ id: 'email-required' })),
    phoneNumber: Yup.string()
      .matches(/^\S*$/, intl.formatMessage({ id: 'no-spaces-allowed' }))
      .matches(/^\d+$/, intl.formatMessage({ id: 'numbers-only-allowed' }))
      .required(intl.formatMessage({ id: 'phone-number-required' }))
      .length(10, intl.formatMessage({ id: 'phone-number-max-10' })),
    address: Yup.string().required(intl.formatMessage({ id: 'address-required' })),
    citizenId: Yup.string().matches(/^\d+$/, intl.formatMessage({ id: 'numbers-only-allowed' })),
    ward: Yup.string()
      .max(255)
      .required(intl.formatMessage({ id: 'ward-required' })),
    province: Yup.string()
      .max(255)
      .required(intl.formatMessage({ id: 'province-required' })),
    country: Yup.string()
      .max(255)
      .required(intl.formatMessage({ id: 'country-required' })),
    username: Yup.string().when([], {
      is: () => !isEditMode,
      then: (schema) =>
        schema.matches(/^\S*$/, intl.formatMessage({ id: 'no-spaces-allowed' })).required(intl.formatMessage({ id: 'username-required' })),
      otherwise: (schema) => schema
    }),
    password: Yup.string().when([], {
      is: () => !isEditMode,
      then: (schema) =>
        schema.required(intl.formatMessage({ id: 'password-required' })).min(8, intl.formatMessage({ id: 'at-least-8-characters' })),
      otherwise: (schema) => schema
    })
  });

  const PartnerSchema = Yup.object({
    name: Yup.string().required(intl.formatMessage({ id: 'name-partner-required' })),
    address: Yup.string().required(intl.formatMessage({ id: 'address-required' })),
    country: Yup.string().required(intl.formatMessage({ id: 'country-required' })),
    phoneNumber: Yup.string()
      .matches(/^[0-9]+$/, intl.formatMessage({ id: 'phone-number-invalid' }))
      .required(intl.formatMessage({ id: 'phone-number-required' })),
    siteId: Yup.string().required(intl.formatMessage({ id: 'site-required' }))
  });

  const SiteSchema = Yup.object().shape({
    name: Yup.string()
      .max(255)
      .required(intl.formatMessage({ id: 'site-name-required' })),
    address: Yup.string().required(intl.formatMessage({ id: 'address-required' })),
    country: Yup.string().required(intl.formatMessage({ id: 'country-required' }))
  });

  const SSIDSchema = Yup.object().shape({
    name: Yup.string()
      .max(255)
      .required(intl.formatMessage({ id: 'ssid-name-required' })),
    type: Yup.string()
      .max(255)
      .required(intl.formatMessage({ id: 'type-required' })),
    siteId: Yup.string().required(intl.formatMessage({ id: 'site-required' }))
    // partnerId: Yup.string().required(intl.formatMessage({ id: 'partner-required' }))
  });

  const SSIDClientSchema = Yup.object().shape({
    name: Yup.string()
      .max(255)
      .required(intl.formatMessage({ id: 'ssid-name-required' })),
    type: Yup.string()
      .max(255)
      .required(intl.formatMessage({ id: 'type-required' })),
    siteId: Yup.string().required(intl.formatMessage({ id: 'site-required' }))
    // partnerId: Yup.string().required(intl.formatMessage({ id: 'partner-required' }))
  });

  const UserSchema = Yup.object().shape({
    fullname: Yup.string()
      .max(255)
      .required(intl.formatMessage({ id: 'full-name-required' })),
    email: Yup.string()
      .max(255)
      .matches(/^\S*$/, intl.formatMessage({ id: 'no-spaces-allowed' }))
      .email(intl.formatMessage({ id: 'email-invalid' }))
      .required(intl.formatMessage({ id: 'email-required' })),
    phoneNumber: Yup.string()
      .matches(/^\S*$/, intl.formatMessage({ id: 'no-spaces-allowed' }))
      .matches(/^\d+$/, intl.formatMessage({ id: 'numbers-only-allowed' }))
      .required(intl.formatMessage({ id: 'phone-number-required' }))
      .length(10, intl.formatMessage({ id: 'phone-number-max-10' })),
    address: Yup.string().required(intl.formatMessage({ id: 'address-required' })),
    citizenId: Yup.string().matches(/^\d+$/, intl.formatMessage({ id: 'numbers-only-allowed' })),
    ward: Yup.string()
      .max(255)
      .required(intl.formatMessage({ id: 'ward-required' })),
    district: Yup.string()
      .max(255)
      .required(intl.formatMessage({ id: 'district-required' })),
    province: Yup.string()
      .max(255)
      .required(intl.formatMessage({ id: 'province-required' })),
    country: Yup.string()
      .max(255)
      .required(intl.formatMessage({ id: 'country-required' })),
    username: Yup.string().when([], {
      is: () => !isEditMode,
      then: (schema) => schema.required(intl.formatMessage({ id: 'username-required' })),
      otherwise: (schema) => schema
    }),
    password: Yup.string().when([], {
      is: () => !isEditMode,
      then: (schema) =>
        schema.required(intl.formatMessage({ id: 'password-required' })).min(8, intl.formatMessage({ id: 'at-least-8-characters' })),
      otherwise: (schema) => schema
    }),
    userSiteAccessId: Yup.array().min(1, intl.formatMessage({ id: 'site-required' }))
  });

  const DeviceSchema = Yup.object().shape({
    name: Yup.string()
      .max(255)
      .required(intl.formatMessage({ id: 'name-device-required' })),
    description: Yup.string()
      .max(500) // Assuming a max length of 500 characters; adjust as needed
      .notRequired(), // Optional field
    ipAddress: Yup.string().matches(
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      intl.formatMessage({ id: 'ip-address-invalid' })
    ),
    macAddress: Yup.string()
      .matches(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, intl.formatMessage({ id: 'mac-address-invalid' }))
      .required(intl.formatMessage({ id: 'mac-address-required' })),
    firmware: Yup.string().max(255),
    wifiStandard: Yup.string().required(intl.formatMessage({ id: 'select-wifi-standard-required' })),
    model: Yup.string().max(255)
    // siteId: Yup.string().required(intl.formatMessage({ id: 'site-required' }))
  });

  const RoleUserSchema = Yup.object().shape({
    title: Yup.string()
      .matches(/^\S*$/, intl.formatMessage({ id: 'no-spaces-allowed' }))
      .max(255)
      .required(intl.formatMessage({ id: 'name-role-required' })),
    permission: Yup.array()
      .of(Yup.string())
      .min(1, intl.formatMessage({ id: 'choose-permission-required' })) // Ensure at least one permission is selected
      .required(intl.formatMessage({ id: 'choose-permission-required' })),
    description: Yup.string().required(intl.formatMessage({ id: 'role-desc-required' }))
  });

  const RoleGroupSchema = Yup.object().shape({
    userGroupIdLv2: Yup.array()
      .of(Yup.string())
      .min(1, intl.formatMessage({ id: 'choose-permission-required' })) // Ensure at least one permission is selected
      .required(intl.formatMessage({ id: 'choose-permission-required' })),
    userGroupIdLv3: Yup.array()
      .of(
        Yup.object({
          id: Yup.string().required(), // luôn có id
          isRead: Yup.string().oneOf(['true', 'false']).required(),
          isWrite: Yup.string().oneOf(['true', 'false']).required()
        })
      )
      /* ít nhất 1 object có isRead hoặc isWrite = 'true' */
      .test(
        'at-least-one-selected',
        intl.formatMessage({ id: 'choose-permission-required' }),
        (arr) => Array.isArray(arr) && arr.some((p) => p.isRead === 'true' || p.isWrite === 'true')
      )
      .required(intl.formatMessage({ id: 'choose-permission-required' }))
    // … các field khác
  });

  const RadiusFullFieldsSchema = Yup.object().shape({
    name: Yup.string().required(intl.formatMessage({ id: 'name-server-radius-required' })),
    ipAcct: Yup.string()
      .matches(
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        intl.formatMessage({ id: 'ip-invalid' })
      )
      .required(intl.formatMessage({ id: 'ip-acct-required' })),
    portAcct: Yup.number()
      .typeError(intl.formatMessage({ id: 'port-invalid' }))
      .test('is-not-zero', intl.formatMessage({ id: 'port-acct-required' }), (value) => value !== 0)
      .required(intl.formatMessage({ id: 'port-acct-required' })),
    ipAuth: Yup.string()
      .matches(
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        intl.formatMessage({ id: 'ip-invalid' })
      )
      .required(intl.formatMessage({ id: 'ip-auth-required' })),
    portAuth: Yup.number()
      .typeError(intl.formatMessage({ id: 'port-invalid' }))
      .test('is-not-zero', intl.formatMessage({ id: 'port-auth-required' }), (value) => value !== 0)
      .required(intl.formatMessage({ id: 'port-auth-required' })),
    updateIntervalPeriod: Yup.number()
      .typeError(intl.formatMessage({ id: 'number-required' }))
      .test('is-not-zero', intl.formatMessage({ id: 'update-interval-period-required' }), (value) => value !== 0)
      .required(intl.formatMessage({ id: 'update-interval-period-required' })),
    pwdAcct: Yup.string().required(intl.formatMessage({ id: 'pwd-acct-required' })),
    pwdAuth: Yup.string().required(intl.formatMessage({ id: 'pwd-auth-required' })),
    siteId: Yup.string().required(intl.formatMessage({ id: 'select-site-required' }))
  });

  const RadiusSchema = Yup.object().shape({
    name: Yup.string().required(intl.formatMessage({ id: 'name-server-radius-required' })),
    ipAuth: Yup.string()
      .matches(
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        intl.formatMessage({ id: 'ip-invalid' })
      )
      .required(intl.formatMessage({ id: 'ip-auth-required' })),
    portAuth: Yup.number()
      .typeError(intl.formatMessage({ id: 'port-invalid' }))
      .test('is-not-zero', intl.formatMessage({ id: 'port-auth-required' }), (value) => value !== 0)
      .required(intl.formatMessage({ id: 'port-auth-required' })),
    pwdAuth: Yup.string().required(intl.formatMessage({ id: 'pwd-auth-required' })),
    siteId: Yup.string().required(intl.formatMessage({ id: 'select-site-required' }))
  });

  const RestrictionDomainSchema = Yup.object().shape({
    name: Yup.string().required(intl.formatMessage({ id: 'domain-name-required' })),
    // categoryId: Yup.string().required(intl.formatMessage({ id: 'category-required' })),
    url: Yup.string()
      .required(intl.formatMessage({ id: 'url-required' }))
      .url(intl.formatMessage({ id: 'url-invalid' })),
    ipAddress: Yup.string()
      .required(intl.formatMessage({ id: 'ipv4-invalid' }))
      .matches(
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        intl.formatMessage({ id: 'ipv4-invalid' })
      ),
    dnsAddress: Yup.string().required(intl.formatMessage({ id: 'dns-required' })),
    reason: Yup.string().required(intl.formatMessage({ id: 'restriction-reason' }))
  });

  const RestrictionDeviceSchema = Yup.object().shape({
    deviceName: Yup.string().required(intl.formatMessage({ id: 'device-name-required' })),
    ipAddress: Yup.string()
      .required(intl.formatMessage({ id: 'ipv4-invalid' }))
      .matches(
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        intl.formatMessage({ id: 'ipv4-invalid' })
      ),
    macAddress: Yup.string().required(intl.formatMessage({ id: 'mac-address-required' })),
    reason: Yup.string().required(intl.formatMessage({ id: 'restriction-reason' }))
  });

  const AdSchema = Yup.object().shape({
    templateName: Yup.string()
      .required(intl.formatMessage({ id: 'template-name-required' }))
      .trim()
      .min(2, intl.formatMessage({ id: 'template-name-least-2-character' })),
    adType: Yup.string().required(intl.formatMessage({ id: 'ad-type-required' })),
    SSID: Yup.string().required(intl.formatMessage({ id: 'select-ssid-required' })),
    siteId: Yup.string().required(intl.formatMessage({ id: 'select-site-required' }))
  });

  const AirlineSchema = Yup.object().shape({
    name: Yup.string()
      .required(intl.formatMessage({ id: 'name-required' }))
      .max(255, intl.formatMessage({ id: 'max-chars-255' })),
    code: Yup.string()
      .required(intl.formatMessage({ id: 'code-required' }))
      .max(10, intl.formatMessage({ id: 'max-chars-10' })),
    origin: Yup.string().required(intl.formatMessage({ id: 'origin-required' })),
    phone: Yup.string()
      .required(intl.formatMessage({ id: 'phone-required' }))
      .matches(/^\d{10}$/, intl.formatMessage({ id: 'phone-format' })),
    email: Yup.string()
      .email(intl.formatMessage({ id: 'email-invalid' }))
      .required(intl.formatMessage({ id: 'email-required' })),
    counterLocation: Yup.string().required(intl.formatMessage({ id: 'counter-location-required' }))
  });

  const AirportSchema = Yup.object().shape({
    name: Yup.string()
      .required(intl.formatMessage({ id: 'name-required' }))
      .max(255, intl.formatMessage({ id: 'max-chars-255' })),
    code: Yup.string()
      .required(intl.formatMessage({ id: 'code-required' }))
      .max(10, intl.formatMessage({ id: 'max-chars-10' })),
    latLocation: Yup.string().required(intl.formatMessage({ id: 'latitude-required' })),
    longLocation: Yup.string().required(intl.formatMessage({ id: 'longitude-required' }))
  });

  const CMSSchema = Yup.object().shape({
    title: Yup.string()
      .required(intl.formatMessage({ id: 'title-required' }))
      .max(255, intl.formatMessage({ id: 'max-chars-255' })),
    description: Yup.string().required(intl.formatMessage({ id: 'description-required' })),
    expiredAt: Yup.date().required(intl.formatMessage({ id: 'expiry-date-required' })),
    mediaUrl: Yup.string()
      .url(intl.formatMessage({ id: 'url-invalid' }))
      .required(intl.formatMessage({ id: 'media-url-required' })),
    type: Yup.string().required(intl.formatMessage({ id: 'type-required' })),
    facilityId: Yup.number().nullable().notRequired(),
    airportId: Yup.number().required(intl.formatMessage({ id: 'airport-id-required' })),
    priority: Yup.number().required(intl.formatMessage({ id: 'priority-required' }))
  });

  const FacilitiesSchema = Yup.object().shape({
    name: Yup.string()
      .required(intl.formatMessage({ id: 'name-required' }))
      .max(255, intl.formatMessage({ id: 'max-chars-255' })),
    description: Yup.string().required(intl.formatMessage({ id: 'description-required' })),
    airportId: Yup.string().required(intl.formatMessage({ id: 'airport-id-required' })),
    type: Yup.string().required(intl.formatMessage({ id: 'type-required' })),
    imageLink: Yup.string()
      .url(intl.formatMessage({ id: 'url-invalid' }))
      .required(intl.formatMessage({ id: 'image-link-required' })),
    latLocation: Yup.string().required(intl.formatMessage({ id: 'latitude-required' })),
    longLocation: Yup.string().required(intl.formatMessage({ id: 'longitude-required' })),
    floor: Yup.string().required(intl.formatMessage({ id: 'floor-required' }))
  });

  const ProductSchema = Yup.object().shape({
    name: Yup.string()
      .required(intl.formatMessage({ id: 'name-required' }))
      .max(255, intl.formatMessage({ id: 'max-chars-255' })),
    description: Yup.string().required(intl.formatMessage({ id: 'description-required' })),
    price: Yup.number()
      .required(intl.formatMessage({ id: 'price-required' }))
      .positive(intl.formatMessage({ id: 'price-positive' }))
      .integer(intl.formatMessage({ id: 'price-integer' }))
  });

  const RatelimitSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    siteId: Yup.string().required('Site is required')
  });

  const CampaignSchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .max(255, intl.formatMessage({ id: 'max-chars-255' }))
      .required(intl.formatMessage({ id: 'name-campaign-required' })),
    amount: Yup.number()
      .typeError(intl.formatMessage({ id: 'number-required' }))
      .positive(intl.formatMessage({ id: 'amount-positive' }))
      .required(intl.formatMessage({ id: 'amount-required' })),
    clickLimit: Yup.number()
      .typeError(intl.formatMessage({ id: 'number-required' }))
      .min(0, intl.formatMessage({ id: 'click-limit-non-negative' }))
      .required(intl.formatMessage({ id: 'click-limit-required' })),
    impressionLimit: Yup.number()
      .typeError(intl.formatMessage({ id: 'number-required' }))
      .min(0, intl.formatMessage({ id: 'impression-limit-non-negative' }))
      .required(intl.formatMessage({ id: 'impression-limit-required' })),
    regionId: Yup.string().required(intl.formatMessage({ id: 'region-required' })),
    siteId: Yup.string().required(intl.formatMessage({ id: 'site-required' })),
    adId: Yup.string().required(intl.formatMessage({ id: 'ad-required' })),
    adPartnerId: Yup.string().required(intl.formatMessage({ id: 'ad-partner-required' })),
    expiredDate: Yup.date()
      .typeError(intl.formatMessage({ id: 'date-invalid' }))
      .required(intl.formatMessage({ id: 'expired-date-required' }))
      .min(new Date(), intl.formatMessage({ id: 'expired-date-future' }))
  });

  // const PortalSchema = Yup.object().shape({
  //   name: Yup.string().required('Name is required'),
  //   enable: Yup.string().required('Enable status is required'),
  //   ssidList: Yup.array().of(Yup.string()).required('SSID list is required'),
  //   authType: Yup.number().required('Auth type is required'),
  //   hostType: Yup.number().required('Host type is required'),
  //   siteId: Yup.string().required('Site ID is required'),
  //   customTimeout: Yup.number().nullable(),
  //   customTimeoutUnit: Yup.number().nullable(),
  //   httpsRedirectEnable: Yup.string().nullable(),
  //   landingPage: Yup.number().nullable(),
  //   landingUrlScheme: Yup.string().nullable(),
  //   landingUrl: Yup.string().nullable(),
  //   enabledTypes: Yup.array().of(Yup.number()).nullable(),
  //   password: Yup.string().nullable(),
  //   serverIp: Yup.array().of(Yup.string()).nullable(),
  //   serverPort: Yup.number().nullable(),
  //   serverUrlScheme: Yup.string().nullable(),
  //   serverUrl: Yup.string().nullable(),
  //   radiusProfileId: Yup.string().nullable(),
  //   externalRadiusAuthMode: Yup.number().nullable(),
  //   nasId: Yup.array().of(Yup.string()).nullable(),
  //   portalCustom: Yup.number().nullable(),
  //   externalUrlScheme: Yup.array().of(Yup.string()).nullable(),
  //   externalUrl: Yup.array().of(Yup.string()).nullable(),
  //   disconnectReq: Yup.string().nullable(),
  //   receiverPort: Yup.number().nullable()
  // });

  const RegionSchema = Yup.object().shape({
    name: Yup.string()
      .max(255)
      .required(intl.formatMessage({ id: 'region-name-required' })),
    address: Yup.string().required(intl.formatMessage({ id: 'address-required' })),
    latLocation: Yup.string(),
    longLocation: Yup.string()
  });

  const PortalSchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .max(255, intl.formatMessage({ id: 'max-chars-255' }))
      .required(intl.formatMessage({ id: 'name-required' })),
    enable: Yup.string()
      .oneOf(['true', 'false'], intl.formatMessage({ id: 'enable-status-required' }))
      .required(intl.formatMessage({ id: 'enable-status-required' })),

    authType: Yup.number()
      .oneOf([0, 1, 2, 4, 11], intl.formatMessage({ id: 'auth-type-invalid' }))
      .required(intl.formatMessage({ id: 'auth-type-required' })),
    // hostType: Yup.number()
    //   .oneOf([1, 2], intl.formatMessage({ id: 'host-type-invalid' }))
    //   .required(intl.formatMessage({ id: 'host-type-required' })),
    siteId: Yup.string().required(intl.formatMessage({ id: 'site-required' })),
    customTimeout: Yup.number()
      .nullable()
      .test('custom-timeout-range', intl.formatMessage({ id: 'custom-timeout-invalid' }), (value, context) => {
        if (value === null || value === undefined) return true; // Cho phép nullable
        const unit = context.parent.customTimeoutUnit;
        if (value === -1) return true; // -1 luôn hợp lệ
        if (unit === 1) return value >= 1 && value <= 1000000; // min
        if (unit === 2) return value >= 1 && value <= 10000; // hour
        if (unit === 3) return value >= 1 && value <= 1000; // day
        return true; // Nếu không có unit, không kiểm tra
      }),
    customTimeoutUnit: Yup.number()
      .nullable()
      .oneOf([1, 2, 3, null], intl.formatMessage({ id: 'custom-timeout-unit-invalid' }))
      .when('customTimeout', {
        is: (customTimeout: number) => customTimeout !== null && customTimeout !== undefined && customTimeout !== -1,
        then: (schema) => schema.required(intl.formatMessage({ id: 'custom-timeout-unit-required' })),
        otherwise: (schema) => schema
      }),
    httpsRedirectEnable: Yup.string()
      .oneOf(['true', 'false'], intl.formatMessage({ id: 'https-redirect-invalid' }))
      .nullable(),
    landingPage: Yup.number()
      .oneOf([1, 2], intl.formatMessage({ id: 'landing-page-invalid' }))
      .nullable(),
    landingUrlScheme: Yup.string()
      .oneOf(['http', 'https'], intl.formatMessage({ id: 'url-scheme-invalid' }))
      .when('landingPage', {
        is: (landingPage: number) => landingPage === 2,
        then: (schema) => schema.required(intl.formatMessage({ id: 'landing-url-scheme-required' })),
        otherwise: (schema) => schema.nullable()
      }),
    landingUrl: Yup.string().when('landingPage', {
      is: (landingPage: number) => landingPage === 2,
      then: (schema) => schema.url(intl.formatMessage({ id: 'url-invalid' })).required(intl.formatMessage({ id: 'landing-url-required' })),
      otherwise: (schema) => schema.nullable()
    }),

    password: Yup.string().when('authType', {
      is: (authType: number) => authType === 1,
      then: (schema) =>
        schema
          .min(1, intl.formatMessage({ id: 'password-min-1-character' }))
          .max(128, intl.formatMessage({ id: 'password-max-128-characters' }))
          .required(intl.formatMessage({ id: 'password-required' })),
      otherwise: (schema) => schema.nullable()
    }),
    // serverIp: Yup.array()
    //   .of(
    //     Yup.string()
    //       .matches(
    //         /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    //         intl.formatMessage({ id: 'ip-invalid' })
    //       )
    //       .required(intl.formatMessage({ id: 'server-ip-required' }))
    //   )
    //   .when('hostType', {
    //     is: (hostType: number) => hostType === 1,
    //     then: (schema) =>
    //       schema.min(1, intl.formatMessage({ id: 'server-ip-required' })).required(intl.formatMessage({ id: 'server-ip-required' })),
    //     otherwise: (schema) => schema.nullable()
    //   }),
    serverPort: Yup.number().when('hostType', {
      is: (hostType: number) => hostType === 1,
      then: (schema) =>
        schema
          .min(0, intl.formatMessage({ id: 'port-min-0' }))
          .max(65535, intl.formatMessage({ id: 'port-max-65535' }))
          .required(intl.formatMessage({ id: 'server-port-required' })),
      otherwise: (schema) => schema.nullable()
    }),
    serverUrlScheme: Yup.string()
      .oneOf(['http', 'https'], intl.formatMessage({ id: 'url-scheme-invalid' }))
      .when('hostType', {
        is: (hostType: number) => hostType === 2,
        then: (schema) => schema.required(intl.formatMessage({ id: 'server-url-scheme-required' })),
        otherwise: (schema) => schema.nullable()
      }),
    serverUrl: Yup.string().when('hostType', {
      is: (hostType: number) => hostType === 2,
      then: (schema) => schema.url(intl.formatMessage({ id: 'url-invalid' })).required(intl.formatMessage({ id: 'server-url-required' })),
      otherwise: (schema) => schema.nullable()
    }),
    radiusProfileId: Yup.string().when('authType', {
      is: (authType: number) => authType === 2,
      then: (schema) => schema.required(intl.formatMessage({ id: 'radius-profile-id-required' })),
      otherwise: (schema) => schema.nullable()
    }),
    externalRadiusAuthMode: Yup.number()
      .oneOf([1, 2], intl.formatMessage({ id: 'external-radius-auth-mode-invalid' }))
      .when('authType', {
        is: (authType: number) => authType === 2,
        then: (schema) => schema.required(intl.formatMessage({ id: 'external-radius-auth-mode-required' })),
        otherwise: (schema) => schema.nullable()
      }),
    nasId: Yup.string().required(intl.formatMessage({ id: 'nas-id-required' })),
    portalCustom: Yup.number().nullable(),
    externalUrlScheme: Yup.string()
      .oneOf(['http', 'https'], intl.formatMessage({ id: 'url-scheme-invalid' }))
      .nullable(),
    // externalUrl: Yup.string()
    //   .url(intl.formatMessage({ id: 'url-invalid' }))
    //   .nullable(),
    disconnectReq: Yup.string().nullable(),
    receiverPort: Yup.number()
      .min(0, intl.formatMessage({ id: 'port-min-0' }))
      .max(65535, intl.formatMessage({ id: 'port-max-65535' }))
      .nullable()
  });

  const VoucherSchema = Yup.object().shape({
    name: Yup.string()
      .min(1, intl.formatMessage({ id: 'voucher-name-min-1-character' }))
      .max(32, intl.formatMessage({ id: 'voucher-name-max-32-characters' }))
      .required(intl.formatMessage({ id: 'voucher-name-required' })),

    siteId: Yup.string().required(intl.formatMessage({ id: 'site-required' })),

    amount: Yup.number()
      .min(1, intl.formatMessage({ id: 'voucher-amount-min-1' }))
      .max(5000, intl.formatMessage({ id: 'voucher-amount-max-5000' }))
      .required(intl.formatMessage({ id: 'voucher-amount-required' })),

    codeLength: Yup.number()
      .min(6, intl.formatMessage({ id: 'voucher-code-length-min-6' }))
      .max(10, intl.formatMessage({ id: 'voucher-code-length-max-10' }))
      .required(intl.formatMessage({ id: 'voucher-code-length-required' })),

    codeForm: Yup.array().required(intl.formatMessage({ id: 'voucher-code-from-required' })),

    limitType: Yup.number()
      .oneOf([0, 1, 2], intl.formatMessage({ id: 'voucher-limit-type-invalid' }))
      .required(intl.formatMessage({ id: 'voucher-limit-type-required' })),

    limitNum: Yup.number()
      .min(1, intl.formatMessage({ id: 'voucher-limit-num-min-1' }))
      .max(999, intl.formatMessage({ id: 'voucher-limit-num-max-999' }))
      .when('limitType', {
        is: (limitType: number) => limitType === 0 || limitType === 1,
        then: (schema) => schema.required(intl.formatMessage({ id: 'voucher-limit-num-required' })),
        otherwise: (schema) => schema.nullable()
      }),

    durationType: Yup.number()
      .oneOf([0, 1], intl.formatMessage({ id: 'voucher-duration-type-invalid' }))
      .required(intl.formatMessage({ id: 'voucher-duration-type-required' })),

    duration: Yup.number()
      .min(1, intl.formatMessage({ id: 'voucher-duration-min-1' }))
      .max(1440000, intl.formatMessage({ id: 'voucher-duration-max-1440000' }))
      .required(intl.formatMessage({ id: 'voucher-duration-required' })),

    timingType: Yup.number()
      .oneOf([0, 1], intl.formatMessage({ id: 'voucher-timing-type-invalid' }))
      .required(intl.formatMessage({ id: 'voucher-timing-type-required' })),

    rateLimitMode: Yup.number()
      .oneOf([0, 1], intl.formatMessage({ id: 'voucher-rate-limit-mode-invalid' }))
      .required(intl.formatMessage({ id: 'voucher-rate-limit-mode-required' })),

    // rateLimitId: Yup.number().when('rateLimitMode', {
    //   is: (rateLimitMode: number) => rateLimitMode === 1,
    //   then: (schema) => schema.required(intl.formatMessage({ id: 'voucher-rate-limit-id-required' })),
    //   otherwise: (schema) => schema.nullable()
    // }),

    customRateLimitDownEnable: Yup.string()
      .oneOf(['true', 'false'], intl.formatMessage({ id: 'voucher-custom-rate-limit-down-enable-invalid' }))
      .required(intl.formatMessage({ id: 'voucher-custom-rate-limit-down-enable-required' })),

    customRateLimitDown: Yup.number()
      .min(0, intl.formatMessage({ id: 'voucher-custom-rate-limit-down-min-0' }))
      .max(10485760, intl.formatMessage({ id: 'voucher-custom-rate-limit-down-max-10485760' }))
      .when('customRateLimitDownEnable', {
        is: (customRateLimitDownEnable: string) => customRateLimitDownEnable === 'true',
        then: (schema) => schema.required(intl.formatMessage({ id: 'voucher-custom-rate-limit-down-required' })),
        otherwise: (schema) => schema.nullable()
      }),

    customRateLimitUpEnable: Yup.string()
      .oneOf(['true', 'false'], intl.formatMessage({ id: 'voucher-custom-rate-limit-up-enable-invalid' }))
      .required(intl.formatMessage({ id: 'voucher-custom-rate-limit-up-enable-required' })),

    customRateLimitUp: Yup.number()
      .min(0, intl.formatMessage({ id: 'voucher-custom-rate-limit-up-min-0' }))
      .max(10485760, intl.formatMessage({ id: 'voucher-custom-rate-limit-up-max-10485760' }))
      .when('customRateLimitUpEnable', {
        is: (customRateLimitUpEnable: string) => customRateLimitUpEnable === 'true',
        then: (schema) => schema.required(intl.formatMessage({ id: 'voucher-custom-rate-limit-up-required' })),
        otherwise: (schema) => schema.nullable()
      }),

    trafficLimitEnable: Yup.string()
      .oneOf(['true', 'false'], intl.formatMessage({ id: 'voucher-traffic-limit-enable-invalid' }))
      .required(intl.formatMessage({ id: 'voucher-traffic-limit-enable-required' })),

    trafficLimit: Yup.number()
      .min(0, intl.formatMessage({ id: 'voucher-traffic-limit-min-0' }))
      .max(10485760, intl.formatMessage({ id: 'voucher-traffic-limit-max-10485760' }))
      .when('trafficLimitEnable', {
        is: (trafficLimitEnable: string) => trafficLimitEnable === 'true',
        then: (schema) => schema.required(intl.formatMessage({ id: 'voucher-traffic-limit-required' })),
        otherwise: (schema) => schema.nullable()
      }),

    trafficLimitFrequency: Yup.number()
      .oneOf([0, 1], intl.formatMessage({ id: 'voucher-traffic-limit-frequency-invalid' }))
      .when('trafficLimitEnable', {
        is: (trafficLimitEnable: string) => trafficLimitEnable === 'true',
        then: (schema) => schema.required(intl.formatMessage({ id: 'voucher-traffic-limit-frequency-required' })),
        otherwise: (schema) => schema.nullable()
      }),

    unitPrice: Yup.number()
      .min(1, intl.formatMessage({ id: 'voucher-unit-price-min-1' }))
      .max(999999999, intl.formatMessage({ id: 'voucher-unit-price-max-999999999' }))
      .required(intl.formatMessage({ id: 'voucher-unit-price-required' })),

    currency: Yup.string().required(intl.formatMessage({ id: 'voucher-currency-required' })),

    // applyToAllPorts: Yup.string()
    //   .oneOf(['true', 'false'], intl.formatMessage({ id: 'voucher-apply-to-all-ports-invalid' }))
    //   .required(intl.formatMessage({ id: 'voucher-apply-to-all-ports-required' })),

    ports: Yup.array()
      .of(Yup.string().required(intl.formatMessage({ id: 'voucher-ports-required' })))
      .when('applyToAllPorts', {
        is: (applyToAllPorts: string) => applyToAllPorts === 'false',
        then: (schema) =>
          schema
            .min(1, intl.formatMessage({ id: 'voucher-ports-required' }))
            .required(intl.formatMessage({ id: 'voucher-ports-required' })),
        otherwise: (schema) => schema.nullable()
      }),

    // expirationTime: Yup.number()
    //   .min(1, intl.formatMessage({ id: 'voucher-expiration-time-min-1' }))
    //   .max(999999999, intl.formatMessage({ id: 'voucher-expiration-time-max-999999999' }))
    //   .required(intl.formatMessage({ id: 'voucher-expiration-time-required' })),

    // effectiveTime: Yup.number()
    //   .min(1, intl.formatMessage({ id: 'voucher-effective-time-min-1' }))
    //   .max(999999999, intl.formatMessage({ id: 'voucher-effective-time-max-999999999' }))
    //   .when('validityType', {
    //     is: (validityType: number) => validityType === 1,
    //     then: (schema) => schema.required(intl.formatMessage({ id: 'voucher-effective-time-required' })),
    //     otherwise: (schema) => schema.nullable()
    //   }),

    log: Yup.string().nullable(),

    description: Yup.string().nullable(),

    validityType: Yup.number()
      .oneOf([0, 1, 2], intl.formatMessage({ id: 'voucher-validity-type-invalid' }))
      .required(intl.formatMessage({ id: 'voucher-validity-type-required' }))

    // ssidId: Yup.array()
    //   .of(Yup.number().required(intl.formatMessage({ id: 'voucher-ssid-id-required' })))
    //   .min(1, intl.formatMessage({ id: 'voucher-ssid-id-required' }))
    //   .required(intl.formatMessage({ id: 'voucher-ssid-id-required' }))
  });

  const PassPointSchema = Yup.object({
    fullname: Yup.string()
      .max(255)
      .required(intl.formatMessage({ id: 'full-name-required' })),
    phoneNumber: Yup.string()
      .matches(/^\S*$/, intl.formatMessage({ id: 'no-spaces-allowed' }))
      .matches(/^\d+$/, intl.formatMessage({ id: 'numbers-only-allowed' }))
      .required(intl.formatMessage({ id: 'phone-number-required' }))
      .length(10, intl.formatMessage({ id: 'phone-number-max-10' })),
    email: Yup.string()
      .max(255)
      .matches(/^\S*$/, intl.formatMessage({ id: 'no-spaces-allowed' }))
      .email(intl.formatMessage({ id: 'email-invalid' }))
      .required(intl.formatMessage({ id: 'email-required' }))
  });

  const AgencySchema = Yup.object({
    agent_name: Yup.string()
      .max(255)
      .required(intl.formatMessage({ id: 'agency-name-required' })),
  });

  return {
    DeviceSchema,
    PartnerSchema,
    UserSchema,
    SiteSchema,
    SSIDSchema,
    SSIDClientSchema,
    RoleUserSchema,
    EndUserSchema,
    RoleGroupSchema,
    RadiusSchema,
    RadiusFullFieldsSchema,
    RestrictionDeviceSchema,
    RestrictionDomainSchema,
    AdSchema,
    ProductSchema,
    FacilitiesSchema,
    CMSSchema,
    AirportSchema,
    AirlineSchema,
    RatelimitSchema,
    CampaignSchema,
    PortalSchema,
    RegionSchema,
    VoucherSchema,
    PassPointSchema,
    AgencySchema
  };
}

export default useValidationSchemas;
