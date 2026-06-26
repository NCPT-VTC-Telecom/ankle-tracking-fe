import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box, ClickAwayListener, FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel, MenuItem, Paper, Popper, Radio,
  RadioGroup,
  Select,
  Slider,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { ArrowDropDownIcon } from '@mui/x-date-pickers';
import { FieldArray, Form, Formik, useFormikContext } from 'formik';
// import useHandleDevice from 'shared/hooks/useHandleDevice';
import useHandlePartner from 'shared/hooks/useHandlePartner';
import useHandleSite from 'shared/hooks/useHandleSites';
import useHandleVLAN from 'shared/hooks/useHandleVLAN';
import useHandleWLAN from 'shared/hooks/useHandleWLAN';
import { Add, InfoCircle, Key, ShieldSecurity, Trash, Wifi } from 'iconsax-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { RootState, useSelector } from 'shared/store';
import { OptionList, PMFMode, SSIDData, SSIDSecurityMode } from 'shared/types';
import { getOption } from 'shared/utils/handleData';

const wpaModes = [
  { label: 'WPA-PSK', value: 1, allowEncryption: [1, 3] },
  { label: 'WPA2-PSK', value: 2, allowEncryption: [1, 3] },
  { label: 'WPA/WPA2-PSK', value: 3, allowEncryption: [1, 3] },
  { label: 'WPA2-PSK/WPA3-SAE', value: 4, allowEncryption: [3] },
];

const encryptionOptions = [
  { label: 'Auto', value: 1 },
  { label: 'AES', value: 3 },
];

const networkTypes = [
  'Private network',
  'Private network with guest',
  'Chargeable public network',
  'Free public network',
  'Personal device network',
  'Emergency services only'
];

const venueGroups = [
  'Unspecified',
  'Assembly',
  'Business',
  'Educational',
  'Factory/Industrial',
  'Institutional',
  'Mercantile',
  'Residential',
  'Storage',
  'Utility',
  'Vehicular',
  'Outdoor'
];



const unitOptions = [
  { label: 'Seconds', value: 0 },
  { label: 'Minutes', value: 1 },
  { label: 'Hours', value: 2 },
];

// const unitInSeconds = {
//   0: 1,      // Seconds
//   1: 60,     // Minutes
//   2: 3600,   // Hours
// };

const intervalLimits: { [key: number]: { min: number; max: number } } = {
  0: { min: 30, max: 86400 },
  1: { min: 1, max: 1440 },
  2: { min: 1, max: 24 },
};



interface PropTypes {
  ssid: SSIDData | null;
  formikRef: any;
}

const CreateWirelessForm = ({ ssid, formikRef }: PropTypes) => {
  const intl = useIntl();

  const user = useSelector((state: RootState) => state.authSlice.user);
  const regionIdAccess = user?.regions?.map((item) => item.region_id);

  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');


  const [optionPartner, setOptionPartner] = useState<OptionList[]>([]);
  const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  // const [optionDevice, setOptionDevice] = useState<OptionList[]>([]);
  // const [optionWLAN, setOptionWLAN] = useState<OptionList[]>([]);
  const [optionVLAN, setOptionVLAN] = useState<OptionList[]>([]);

  const { fetchDataPartner } = useHandlePartner();
  const { fetchDataSites } = useHandleSite();
  // const { fetchDataDevice } = useHandleDevice();
  const { fetchDataWLAN } = useHandleWLAN();
  const { fetchDataVLAN } = useHandleVLAN();

  const getOptions = async (currentSite: string) => {
    const [dataPartner, dataSite, dataVLAN] = await Promise.all([
      fetchDataPartner({ page: 1, pageSize: 20, type: 'devices', siteId: currentSite }),
      fetchDataSites({ page: 1, pageSize: 20, regionDataInput: JSON.stringify(regionIdAccess) }),
      fetchDataWLAN({ page: 1, pageSize: 20, siteId: currentSite }),
      fetchDataVLAN({ page: 1, pageSize: 20, siteId: currentSite })
    ]);

    setOptionPartner(getOption(dataPartner, 'name', 'id'));
    // setOptionDevice(getOption(dataDevice, 'name', 'id'));
    setOptionSite(getOption(dataSite, 'name', 'id'));
    setOptionVLAN(getOption(dataVLAN, 'name', 'vlan'));
  };

  useEffect(() => {
    getOptions(currentSite);
    //eslint-disable-next-line
  }, [currentSite]);

  const initialValues = useMemo(() => {
    return {
      id: ssid?.id,
      name: ssid?.name || '',
      type: ssid?.type || '',
      partnerId: ssid?.partner_id,
      siteId: ssid?.site_id || '',
      // deviceId: ssid?.device_id || '',
      deviceType: ssid?.device_type,
      band: ssid?.band,
      guestNetEnable: false,
      security: SSIDSecurityMode.None,
      pskSettings: {
        securityKey: "",
        versionPsk: 0,
        encryptionPsk: 0,
        gikRekeyPskEnable: true,
        rekeyPskInterval: 0,
        intervalPskType: 0
      },
      entSettings: {
        radiusProfileId: "",
        versionEnt: 0,
        encryptionEnt: 0,
        gikRekeyEntEnable: false,
        rekeyEntInterval: 0,
        intervalEntType: 0,
        nasIdMode: 0,
        nasId: ""
      },
      ppskSettings: {
        ppskProfileId: "",
        radiusProfileId: "",
        macFormat: 0,
        nasId: "",
        type: 0
      },
      rateControlConfig: {
        rate2gCtrlEnable: false,
        lowerDensity2g: 0,
        higherDensity2g: 54,
        cckRatesDisable: false,
        clientRatesRequire2g: false,
        sendBeacons2g: false,
        rate5gCtrlEnable: false,
        lowerDensity5g: 0,
        higherDensity5g: 0,
        clientRatesRequire5g: false,
        sendBeacons5g: false,
        rate6gCtrlEnable: false,
        lowerDensity6g: 0,
        higherDensity6g: 0,
        clientRatesRequire6g: false,
        sendBeacons6g: false
      },
      macFilterConfig: {
        macFilterEnable: false,
        policy: 0,
        macFilterId: "",
        ouiProfileIdList: [
          ""
        ]
      },
      multicastConfig: {
        multiCastEnable: false,
        channelUtil: 0,
        arpCastEnable: false,
        ipv6CastEnable: false,
        filterEnable: false,
        filterMode: 0,
        macGroupId: ""
      },
      broadcast: false,
      vlan: 'Default',
      mloEnable: false,
      owe: false,
      pmfMode: PMFMode.Disable,
      hidePwd: false,
      greEnable: false,
      gkUpdatePeriod: 3600,
      nasOption: '',
      nasId: '',
      radiusProfile: '',
      ppskProfile: '',
      authType: '',
      macFormat: '',
      ssidRateLimit: '',
      addVlanMethod: 'ByNetwork',
      downloadEnabled: false,
      downloadLimit: '',
      downloadUnit: 'Kbps',
      uploadEnabled: false,
      uploadLimit: '',
      uploadUnit: 'Kbps',
      clientRateLimit: '',
      vlanNetwork: '',
      vlanEnable: false,
      vlanId: '',
      enable11r: false,
      ssidDownloadEnabled: false,
      ssidDownloadLimit: '',
      ssidDownloadUnit: 'Kbps',
      ssidUploadEnabled: false,
      ssidUploadLimit: '',
      ssidUploadUnit: 'Kbps',

      // ─────────── Hotspot 2.0 ───────────
      hs20Enable: false,
      networkType: 'Private network',
      plmnIds: [''], // array of strings
      roamingOis: [''], // array of strings
      operatorDomain: '',
      operatorName: '',
      dgafDisable: false,
      hessid: '',
      internet: false,
      ipv4Availability: 'Address type not available',
      ipv6Availability: 'Address type not available',
      venueGroup: 'Unspecified',
      venueType: 'Unspecified',
      venueName: '',
      wlanScheduleConfig: {
        // WLAN Schedule
        wlanScheduleEnable: false,
        action: 0, // 1 = 'on' | 0 = 'off'
        scheduleId: '',
      },
      /* MAC Filter */
      macFilterEnable: false,
      macPolicy: 'allow', // allow | deny
      macGroup: ''
    };
  }, [ssid]);



  return (
    <Formik innerRef={formikRef} enableReinitialize initialValues={initialValues} onSubmit={(values) => console.log(values)}>
      {({ values, handleChange, errors, touched, }) => {
        const selectedSecurity = values.security;
        const isByNetwork = values.addVlanMethod === 'ByNetwork';
        const isDownloadEnabled = values.downloadEnabled;
        const isUploadEnabled = values.uploadEnabled;
        const isSsidDownloadEnabled = values.ssidDownloadEnabled;
        const isSsidUploadEnabled = values.ssidUploadEnabled;
        return (
          <Form className="p-6 space-y-6">
            <Grid container spacing={2}>

              {/* Network Name (SSID) */}
              <Grid item xs={6}>
                <TextField
                  label={intl.formatMessage({ id: 'name' })}
                  name="name"
                  fullWidth
                  value={values.name}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <Wifi className="mr-2" />
                  }}
                />
              </Grid>

              {/* Type */}
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>{intl.formatMessage({ id: 'type' })}</InputLabel>
                  <Select name="type" value={values.type} label={intl.formatMessage({ id: 'type' })} onChange={handleChange}>
                    {[
                      { value: 'marketing', label: 'Marketing' },
                      { value: 'hotspot', label: 'Hotspot' }
                    ].map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Partner */}
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>{intl.formatMessage({ id: 'partner' })}</InputLabel>
                  <Select name="partnerId" value={values.partnerId} label={intl.formatMessage({ id: 'partner' })} onChange={handleChange}>
                    {optionPartner.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Site */}
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>{intl.formatMessage({ id: 'site' })}</InputLabel>
                  <Select name="siteId" value={values.siteId} label={intl.formatMessage({ id: 'site' })} onChange={handleChange}>
                    {optionSite.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Device */}
              {/* <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{intl.formatMessage({ id: 'device' })}</InputLabel>
                  <Select name="deviceId" value={values.deviceId} label={intl.formatMessage({ id: 'device' })} onChange={handleChange}>
                    {optionDevice.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid> */}

              {/* Device Type */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{intl.formatMessage({ id: 'device-type' })}</InputLabel>
                  <Select
                    name="deviceType"
                    value={values.deviceType}
                    label={intl.formatMessage({ id: 'device-type' })}
                    onChange={handleChange}
                  >
                    {[
                      { value: 0, label: intl.formatMessage({ id: 'none' }) },
                      { value: 1, label: 'EAP' },
                      { value: 3, label: 'EAP/Gateway' }
                    ].map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                    <MenuItem value="Gateway">Gateway</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Band */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{intl.formatMessage({ id: 'band' })}</InputLabel>
                  <Select name="band" value={values.band} onChange={handleChange} label={intl.formatMessage({ id: 'band' })}>
                    {[
                      { value: 0, label: '2.4GHz' },
                      { value: 1, label: '5GHz' },
                      { value: 3, label: '6GHz' },
                      { value: 7, label: '2.4GHz/5GHz/6GHz' }
                    ].map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* WLAN */}
              {/* <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>WLAN</InputLabel>
                  <Select name="wlanId" value={values.wlanId} onChange={handleChange} label="WLAN">
                    {optionWLAN.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid> */}

              {/* Guest Network */}
              <Grid item xs={6}>
                <FormControlLabel
                  control={<Switch checked={values.guestNetEnable} onChange={handleChange} name="guestNetEnable" />}
                  label={intl.formatMessage({ id: 'guest-net' })}
                />
              </Grid>
              {/* Hide password */}
              <Grid item xs={6}>
                <FormControlLabel
                  control={<Switch checked={values.hidePwd} onChange={handleChange} name="hidePwd" />}
                  label={intl.formatMessage({ id: 'hide-password' })}
                />
              </Grid>
              {/* Gre Enable */}
              <Grid item xs={6}>
                <FormControlLabel
                  control={<Switch checked={values.greEnable} onChange={handleChange} name="greEnable" />}
                  label={intl.formatMessage({ id: 'gre-enable' })}
                />
              </Grid>

              {/* enable11r*/}
              <Grid item xs={6}>
                <FormControlLabel
                  control={<Switch checked={values.enable11r} onChange={handleChange} name="enable11r" />}
                  label={intl.formatMessage({ id: 'enable-11r' })}
                />
              </Grid>

              {/* Security */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{intl.formatMessage({ id: 'security' })}</InputLabel>
                  <Select
                    name="security"
                    value={values.security}
                    onChange={handleChange}
                    startAdornment={<ShieldSecurity className="mr-2" />}
                    label={intl.formatMessage({ id: 'security' })}
                  >
                    {[
                      { value: SSIDSecurityMode.None, label: intl.formatMessage({ id: 'security.none' }) },
                      { value: SSIDSecurityMode.WPAEnterprise, label: intl.formatMessage({ id: 'security.wpa_enterprise' }) },
                      { value: SSIDSecurityMode.WPAPersonal, label: intl.formatMessage({ id: 'security.wpa_personal' }) },
                      { value: SSIDSecurityMode.PPSKWithoutRADIUS, label: intl.formatMessage({ id: 'security.ppsk_without_radius' }) },
                      { value: SSIDSecurityMode.PPSKWithRADIUS, label: intl.formatMessage({ id: 'security.ppsk_with_radius' }) }
                    ].map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Conditional Fields for Security */}
              {/* {selectedSecurity === SSIDSecurityMode.None && (
                <Grid item xs={12}>
                  <FormControlLabel control={<Switch checked={values.owe} onChange={handleChange} name="owe" />} label="OWE" />
                </Grid>
              )} */}

              {selectedSecurity === SSIDSecurityMode.WPAPersonal && (
                <Grid item xs={12}>
                  <TextField
                    label="Security Key"
                    name="pskSettings.securityKey"
                    type="password"
                    fullWidth
                    value={values.pskSettings.securityKey}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <Key className="mr-2" />
                    }}
                  />
                </Grid>
              )}

              {selectedSecurity === SSIDSecurityMode.WPAEnterprise && (
                <>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>RADIUS Profile</InputLabel>
                      <Select name="radiusProfile" value={values.radiusProfile} onChange={handleChange}>
                        <MenuItem value="profile1">Profile 1</MenuItem>
                        <MenuItem value="profile2">Profile 2</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <label className="block mb-2 font-medium">NAS ID</label>
                    {['Default', 'Follow', 'Custom'].map((option) => (
                      <FormControlLabel
                        key={option}
                        control={<Radio checked={values.nasOption === option} onChange={handleChange} name="nasOption" value={option} />}
                        label={
                          option === 'Default' ? 'Default (TP-Link: MAC Address)' : option === 'Follow' ? 'Follow Device Name' : 'Custom'
                        }
                      />
                    ))}
                    {values.nasOption === 'Custom' && (
                      <TextField name="nasId" fullWidth value={values.nasId} onChange={handleChange} placeholder="Enter Custom NAS ID" />
                    )}
                  </Grid>
                </>
              )}

              {selectedSecurity === SSIDSecurityMode.PPSKWithoutRADIUS && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>PPSK Profile</InputLabel>
                    <Select name="ppskProfile" value={values.ppskProfile} onChange={handleChange}>
                      <MenuItem value="ppsk1">PPSK Profile 1</MenuItem>
                      <MenuItem value="ppsk2">PPSK Profile 2</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {selectedSecurity === SSIDSecurityMode.PPSKWithRADIUS && (
                <>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>RADIUS Profile</InputLabel>
                      <Select name="radiusProfile" value={values.radiusProfile} onChange={handleChange}>
                        <MenuItem value="profile1">Profile 1</MenuItem>
                        <MenuItem value="profile2">Profile 2</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Authentication Type</InputLabel>
                      <Select name="authType" value={values.authType} onChange={handleChange}>
                        <MenuItem value="Generic Radius with bound MAC">Generic Radius with bound MAC</MenuItem>
                        <MenuItem value="MAC-based">MAC-based</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField name="nasId" label="NAS ID (Optional)" fullWidth value={values.nasId} onChange={handleChange} />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>MAC Address Format</InputLabel>
                      <Select name="macFormat" value={values.macFormat} onChange={handleChange}>
                        <MenuItem value="aa:bb:cc:dd:ee:ff">aa:bb:cc:dd:ee:ff</MenuItem>
                        <MenuItem value="aabb.ccdd.eeff">aabb.ccdd.eeff</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}

              {/* Advanced Settings Accordion */}
              <Grid item xs={12}>
                <Accordion className="border rounded-md shadow-sm">
                  <AccordionSummary>
                    <Typography className="font-semibold">Advanced Settings</Typography>
                  </AccordionSummary>
                  <AccordionDetails className="space-y-4">
                    <Grid container spacing={2}>
                      {/* SSID Broadcast */}
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={<Switch checked={values.broadcast} onChange={handleChange} name="broadcast" />}
                          label="SSID Broadcast"
                        />
                      </Grid>

                      {/* VLAN */}

                      <Grid item xs={12}>
                        <FormControlLabel
                          control={<Switch checked={values.vlanEnable} onChange={handleChange} name="vlanEnable" />}
                          label="VLAN"
                        />
                      </Grid>
                      {/* {values.vlanEnable && (
                        <Grid item xs={12}>
                          <RadioGroup row name="vlan" value={values.vlan} onChange={handleChange}>
                            <FormControlLabel value="Default" control={<Radio />} label="Default" />
                            <FormControlLabel value="Custom" control={<Radio />} label="Custom" />
                          </RadioGroup>
                        </Grid>
                      )} */}

                      {/* Add VLAN (when vlanEnable) */}
                      {values.vlanEnable && (
                        <Grid item xs={12}>
                          <FormLabel component="legend" className="font-medium">
                            Add VLAN
                          </FormLabel>
                          <RadioGroup row name="addVlanMethod" value={values.addVlanMethod} onChange={handleChange}>
                            <FormControlLabel value="ByNetwork" control={<Radio />} label="By Network" />
                            <FormControlLabel value="ByVlanId" control={<Radio />} label="By VLAN ID" />
                          </RadioGroup>
                          {isByNetwork ? (
                            <Select fullWidth name="vlanId" value={values.vlanId} onChange={handleChange}>
                              {optionVLAN.map((item) => (
                                <MenuItem value={item.value}>{item.label}</MenuItem>
                              ))}
                            </Select>
                          ) : (
                            <TextField name="vlanId" placeholder="Enter VLAN ID" value={values.vlanId} onChange={handleChange} fullWidth />
                          )}
                        </Grid>
                      )}

                      {/* WPA Mode */}
                      {values.security !== SSIDSecurityMode.None && (<Grid item xs={12}>
                        <WPASelector />
                      </Grid>)}


                      {/* MLO */}
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={<Switch checked={values.mloEnable} onChange={handleChange} name="mloEnable" />}
                          label="MLO"
                        />
                      </Grid>

                      {/* PMF */}
                      <Grid item xs={12}>
                        <FormLabel component="legend" className="font-medium">
                          PMF
                        </FormLabel>
                        <RadioGroup row name="pmfMode" value={values.pmfMode} onChange={handleChange}>
                          {[
                            { value: PMFMode.Mandatory, label: intl.formatMessage({ id: 'pmf_mode.mandatory' }) },
                            { value: PMFMode.Capable, label: intl.formatMessage({ id: 'pmf_mode.capable' }) },
                            { value: PMFMode.Disable, label: intl.formatMessage({ id: 'pmf_mode.disable' }) }
                          ].map((item) => (
                            <FormControlLabel value={item.value} key={item.value} control={<Radio />} label={item.label} />
                          ))}
                        </RadioGroup>
                      </Grid>
                      {values.pmfMode == PMFMode.Mandatory && (
                        <Grid item xs={12}>
                          <Box className={`p-3 rounded-lg text-sm flex items-center gap-2 bg-orange-100`}>
                            <InfoCircle size={16} />
                            When Mandatory is selected, non-PMF-capable clients may fail to connect to the network
                          </Box>
                        </Grid>
                      )}

                      {/* GIK Rekeying */}
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={<Switch checked={values.pskSettings.gikRekeyPskEnable} onChange={handleChange} name="pskSettings.gikRekeyPskEnable" />}
                          label={`GIK rekeying every (${intervalLimits[values.pskSettings.intervalPskType].min}–${intervalLimits[values.pskSettings.intervalPskType].max})`}
                        />
                      </Grid>
                      {values.pskSettings.gikRekeyPskEnable && (
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            type="number"
                            name="pskSettings.rekeyPskInterval"
                            value={values.pskSettings.rekeyPskInterval}
                            onChange={handleChange}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Select
                                    name="pskSettings.intervalPskType"
                                    value={values.pskSettings.intervalPskType}
                                    onChange={handleChange}
                                    variant="standard"
                                  >
                                    {unitOptions.map((unit) => (
                                      <MenuItem key={unit.value} value={unit.value}>
                                        {unit.label}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </InputAdornment>
                              ),
                            }}
                          />

                        </Grid>
                      )}

                      {/* Client Rate Limit */}
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Client Rate Limit Profile</InputLabel>
                          <Select name="clientRateLimit" value={values.clientRateLimit} onChange={handleChange}>
                            <MenuItem value="Default">Default</MenuItem>
                            <MenuItem value="Custom">Custom</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      {values.clientRateLimit === 'Custom' && (
                        <>
                          {/* Download Limit */}
                          <Grid item xs={12}>
                            <div className="flex items-center gap-2">
                              <FormControlLabel
                                className="w-[175px]"
                                control={<Switch checked={values.downloadEnabled} onChange={handleChange} name="downloadEnabled" />}
                                label="Download Limit"
                              />
                              {isDownloadEnabled && (
                                <div className="flex-1 flex items-center gap-2">
                                  <TextField
                                    fullWidth
                                    name="downloadLimit"
                                    type="number"
                                    disabled={!values.downloadEnabled}
                                    value={values.downloadLimit}
                                    onChange={handleChange}
                                    inputProps={{ min: 1, max: 10240 }}
                                  />
                                  <Select className="min-w-[85px]" name="downloadUnit" value={values.downloadUnit} onChange={handleChange}>
                                    <MenuItem value="Mbps">Mbps</MenuItem>
                                    <MenuItem value="Kbps">Kbps</MenuItem>
                                  </Select>
                                  <span className="text-gray-500 text-sm whitespace-nowrap min-w-[100px] inline-block">
                                    ({values.downloadUnit === 'Kbps' ? '1-10485760' : '1-10240'})
                                  </span>
                                </div>
                              )}
                            </div>
                          </Grid>

                          {/* Upload Limit */}
                          <Grid item xs={12}>
                            <div className="flex items-center gap-2">
                              <FormControlLabel
                                className="w-[175px]"
                                control={<Switch checked={values.uploadEnabled} onChange={handleChange} name="uploadEnabled" />}
                                label="Upload Limit"
                              />
                              {isUploadEnabled && (
                                <div className="flex-1 flex items-center gap-2">
                                  <TextField
                                    fullWidth
                                    name="uploadLimit"
                                    type="number"
                                    disabled={!values.uploadEnabled}
                                    value={values.uploadLimit}
                                    onChange={handleChange}
                                    inputProps={{ min: 1, max: 10485760 }}
                                  />
                                  <Select className="min-w-[85px]" name="uploadUnit" value={values.uploadUnit} onChange={handleChange}>
                                    <MenuItem value="Mbps">Mbps</MenuItem>
                                    <MenuItem value="Kbps">Kbps</MenuItem>
                                  </Select>
                                  <span className="text-gray-500 text-sm whitespace-nowrap min-w-[100px] inline-block">
                                    ({values.uploadUnit === 'Kbps' ? '1-10485760' : '1-10240'})
                                  </span>
                                </div>
                              )}
                            </div>
                          </Grid>
                        </>
                      )}

                      {/* SSID Rate Limit */}
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>SSID Rate Limit Profile</InputLabel>
                          <Select name="ssidRateLimit" value={values.ssidRateLimit} onChange={handleChange}>
                            <MenuItem value="Default">Default</MenuItem>
                            <MenuItem value="Custom">Custom</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      {values.ssidRateLimit === 'Custom' && (
                        <>
                          {/* SSID Download Limit */}
                          <Grid item xs={12}>
                            <div className="flex items-center gap-2">
                              <FormControlLabel
                                className="w-[175px]"
                                control={<Switch checked={values.ssidDownloadEnabled} onChange={handleChange} name="ssidDownloadEnabled" />}
                                label="Download Limit"
                              />
                              {isSsidDownloadEnabled && (
                                <div className="flex-1 flex items-center gap-2">
                                  <TextField
                                    fullWidth
                                    name="ssidDownloadLimit"
                                    type="number"
                                    value={values.ssidDownloadLimit}
                                    onChange={handleChange}
                                    inputProps={{ min: 1, max: 10240 }}
                                  />
                                  <Select
                                    className="min-w-[85px]"
                                    name="ssidDownloadUnit"
                                    value={values.ssidDownloadUnit}
                                    onChange={handleChange}
                                  >
                                    <MenuItem value="Mbps">Mbps</MenuItem>
                                    <MenuItem value="Kbps">Kbps</MenuItem>
                                  </Select>
                                  <span className="text-gray-500 text-sm whitespace-nowrap min-w-[100px] inline-block">
                                    ({values.ssidDownloadUnit === 'Kbps' ? '1-10485760' : '1-10240'})
                                  </span>
                                </div>
                              )}
                            </div>
                          </Grid>

                          {/* SSID Upload Limit */}
                          <Grid item xs={12}>
                            <div className="flex items-center gap-2">
                              <FormControlLabel
                                className="w-[175px]"
                                control={<Switch checked={values.ssidUploadEnabled} onChange={handleChange} name="ssidUploadEnabled" />}
                                label="Upload Limit"
                              />
                              {isSsidUploadEnabled && (
                                <div className="flex-1 flex items-center gap-2">
                                  <TextField
                                    fullWidth
                                    name="ssidUploadLimit"
                                    type="number"
                                    value={values.ssidUploadLimit}
                                    onChange={handleChange}
                                    inputProps={{ min: 1, max: 10485760 }}
                                  />
                                  <Select
                                    className="min-w-[85px]"
                                    name="ssidUploadUnit"
                                    value={values.ssidUploadUnit}
                                    onChange={handleChange}
                                  >
                                    <MenuItem value="Mbps">Mbps</MenuItem>
                                    <MenuItem value="Kbps">Kbps</MenuItem>
                                  </Select>
                                  <span className="text-gray-500 text-sm whitespace-nowrap min-w-[100px] inline-block">
                                    ({values.ssidUploadUnit === 'Kbps' ? '1-10485760' : '1-10240'})
                                  </span>
                                </div>
                              )}
                            </div>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* Hotspot 2.0 Accordion */}
              <Grid item xs={12}>
                <Accordion className="border rounded-md shadow-sm">
                  <AccordionSummary>
                    <Typography className="font-semibold">Hotspot 2.0</Typography>
                  </AccordionSummary>
                  <AccordionDetails className="space-y-4">
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={<Switch checked={values.hs20Enable} onChange={handleChange} name="hs20Enable" />}
                          label="Hotspot 2.0 Enable"
                        />
                      </Grid>
                      {values.hs20Enable && (
                        <>
                          <Grid item xs={12}>
                            <Select fullWidth name="networkType" value={values.networkType} onChange={handleChange}>
                              {networkTypes.map((t) => (
                                <MenuItem key={t} value={t}>
                                  {t}
                                </MenuItem>
                              ))}
                            </Select>
                          </Grid>
                          <Grid item xs={12}>
                            <FieldArray
                              name="plmnIds"
                              render={(arrayHelpers) => (
                                <>
                                  {values?.plmnIds &&
                                    values.plmnIds.map((plmn, idx) => (
                                      <Grid container spacing={1} alignItems="center" key={idx} className="mb-2">
                                        <Grid item xs>
                                          <TextField
                                            fullWidth
                                            label={`PLMN ID #${idx + 1}`}
                                            name={`plmnIds.${idx}`}
                                            value={plmn}
                                            onChange={handleChange}
                                            placeholder="10000-999999"
                                            inputProps={{ pattern: '^[0-9]{5,6}$' }}
                                          />
                                        </Grid>
                                        <Grid item>
                                          {idx === 0 ? (
                                            <Tooltip title="Add PLMN ID">
                                              <IconButton onClick={() => arrayHelpers.push('')} size="small" color="primary">
                                                <Add fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                          ) : (
                                            <Tooltip title="Remove">
                                              <IconButton onClick={() => arrayHelpers.remove(idx)} size="small" color="error">
                                                <Trash fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                          )}
                                        </Grid>
                                      </Grid>
                                    ))}
                                </>
                              )}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <FieldArray
                              name="roamingOis"
                              render={(arrayHelpers) => (
                                <>
                                  {values?.roamingOis &&
                                    values.roamingOis.map((oi, idx) => (
                                      <Grid container spacing={1} alignItems="center" key={idx} className="mb-2">
                                        <Grid item xs>
                                          <TextField
                                            fullWidth
                                            label={`Roaming Consortium OI #${idx + 1}`}
                                            name={`roamingOis.${idx}`}
                                            value={oi}
                                            onChange={handleChange}
                                            placeholder="XX-XX-XX or XX-XX-XX-XX-XX"
                                          />
                                        </Grid>
                                        <Grid item>
                                          {idx === 0 ? (
                                            <Tooltip title="Add OI">
                                              <IconButton onClick={() => arrayHelpers.push('')} size="small" color="primary">
                                                <Add fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                          ) : (
                                            <Tooltip title="Remove">
                                              <IconButton onClick={() => arrayHelpers.remove(idx)} size="small" color="error">
                                                <Trash fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                          )}
                                        </Grid>
                                      </Grid>
                                    ))}
                                </>
                              )}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Operator Domain (optional)"
                              name="operatorDomain"
                              value={values.operatorDomain}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Operator Friendly Name (optional)"
                              name="operatorName"
                              value={values.operatorName}
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={<Switch checked={values.dgafDisable} onChange={handleChange} name="dgafDisable" />}
                              label="DGAF Disable"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="HESSID (optional)"
                              name="hessid"
                              value={values.hessid}
                              onChange={handleChange}
                              placeholder="AA-BB-CC-DD-EE-FF"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FormControlLabel
                              control={<Switch checked={values.internet} onChange={handleChange} name="internet" />}
                              label="Internet"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Select fullWidth name="ipv4Availability" value={values.ipv4Availability} onChange={handleChange}>
                              <MenuItem value="Address type not available">Address type not available</MenuItem>
                              <MenuItem value="Public IPv4 address available">Public IPv4 address available</MenuItem>
                              <MenuItem value="Port restricted IPv4">Port restricted IPv4</MenuItem>
                            </Select>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Select fullWidth name="ipv6Availability" value={values.ipv6Availability} onChange={handleChange}>
                              <MenuItem value="Address type not available">Address type not available</MenuItem>
                              <MenuItem value="Public IPv6 address available">Public IPv6 address available</MenuItem>
                            </Select>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Select fullWidth name="venueGroup" value={values.venueGroup} onChange={handleChange}>
                              {venueGroups.map((v) => (
                                <MenuItem key={v} value={v}>
                                  {v}
                                </MenuItem>
                              ))}
                            </Select>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Select fullWidth name="venueType" value={values.venueType} onChange={handleChange}>
                              <MenuItem value="Unspecified">Unspecified</MenuItem>
                              <MenuItem value="Arena">Arena</MenuItem>
                              <MenuItem value="Stadium">Stadium</MenuItem>
                            </Select>
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Venue Name (optional)"
                              name="venueName"
                              value={values.venueName}
                              onChange={handleChange}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* WLAN Schedule Accordion */}
              <Grid item xs={12}>
                <Accordion className="border rounded-md shadow-sm">
                  <AccordionSummary>
                    <Typography className="font-semibold">WLAN Schedule</Typography>
                  </AccordionSummary>
                  <AccordionDetails className="space-y-4">
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={<Switch checked={values.wlanScheduleConfig.wlanScheduleEnable} onChange={handleChange} name="wlanScheduleConfig.wlanScheduleEnable" />}
                          label="WLAN Schedule Enable"
                        />
                      </Grid>
                      {values.wlanScheduleConfig.wlanScheduleEnable && (
                        <>
                          <Grid item xs={12}>
                            <FormLabel component="legend">Action</FormLabel>
                            <RadioGroup row name="wlanScheduleConfig.action" value={values.wlanScheduleConfig.action} onChange={handleChange}>
                              <FormControlLabel value={1} control={<Radio />} label="Radio on" />
                              <FormControlLabel value={0} control={<Radio />} label="Radio off" />
                            </RadioGroup>
                          </Grid>
                          <Grid item xs={12}>
                            <FormControl fullWidth>
                              <InputLabel>Time Range</InputLabel>
                              <Select name="wlanScheduleConfig.scheduleId" value={values.wlanScheduleConfig.scheduleId} onChange={handleChange}>
                                <MenuItem value="range1">Office hours</MenuItem>
                                <MenuItem value="range2">Weekend</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* 802.11 Rate Control Accordion */}
              <Grid item xs={12}>
                <Accordion className="border rounded-md shadow-sm">
                  <AccordionSummary>
                    <Typography className="font-semibold">802.11 Rate Control</Typography>
                  </AccordionSummary>
                  <AccordionDetails className="space-y-4">
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography className="font-medium">2.4 GHz Data Rate Control</Typography>
                        <FormControlLabel
                          control={<Switch checked={values.rateControlConfig.rate2gCtrlEnable} onChange={handleChange} name="rateControlConfig.rate2gCtrlEnable" />}
                          label="Enable Minimum Data Rate Control"
                        />
                      </Grid>
                      {values.rateControlConfig.rate2gCtrlEnable && (
                        <>
                          <Grid item xs={12}>
                            <RateControlSlider name="rateControlConfig.lowerDensity2g" allowedRates={[1, 2, 5.5, 6, 9, 11, 12, 18, 24, 36, 48, 54]} />
                            <Box className="flex justify-between text-xs my-2">
                              <span>Lower Density</span>
                              <span>Higher Density</span>
                            </Box>

                            <Box
                              className={`p-3 rounded-lg text-sm flex items-center gap-2 ${values.rateControlConfig.lowerDensity2g === 1
                                ? 'bg-blue-100' //
                                : values?.rateControlConfig.lowerDensity2g && values.rateControlConfig.lowerDensity2g >= 12
                                  ? 'bg-yellow-100'
                                  : 'bg-orange-100'
                                }`}
                            >
                              <InfoCircle size={16} />

                              {values.rateControlConfig.lowerDensity2g === 1
                                ? 'Full device compatibility and range.'
                                : values?.rateControlConfig.lowerDensity2g && values.rateControlConfig.lowerDensity2g >= 12
                                  ? 'Limited range and no connectivity for 802.11b devices.'
                                  : 'Limited range and limited connectivity for 802.11b devices.'}
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={<Switch checked={values.rateControlConfig.cckRatesDisable} onChange={handleChange} name="rateControlConfig.cckRatesDisable" />}
                              label="Disable CCK Rates (1/2/5.5/11 Mbps)"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={<Switch checked={values.rateControlConfig.clientRatesRequire2g} onChange={handleChange} name="rateControlConfig.clientRatesRequire2g" />}
                              label="Require Clients to Use Rates at or Above the Specified Value"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={<Switch checked={values.rateControlConfig.sendBeacons2g} onChange={handleChange} name="rateControlConfig.sendBeacons2g" />}
                              label="Send Beacons at 1 Mbps"
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Typography className="font-medium mt-6">5 GHz Data Rate Control</Typography>
                      <FormControlLabel
                        control={<Switch checked={values.rateControlConfig.rate5gCtrlEnable} onChange={handleChange} name="rateControlConfig.rate5gCtrlEnable" />}
                        label="Enable Minimum Data Rate Control"
                      />
                      {values.rateControlConfig.rate5gCtrlEnable && (
                        <>
                          <Grid item xs={12}>
                            <RateControlSlider name="rateControlConfig.lowerDensity5g" allowedRates={[1, 2, 5.5, 6, 9, 11, 12, 18, 24, 36, 48, 54]} />
                            <Box className="flex justify-between text-xs my-2">
                              <span>Lower Density</span>
                              <span>Higher Density</span>
                            </Box>
                            <Box
                              className={`p-3 rounded-lg text-sm flex items-center gap-2 ${values.rateControlConfig.lowerDensity5g === 6 ? 'bg-blue-100' : 'bg-orange-100'
                                }`}
                            >
                              <InfoCircle size={16} />

                              {values.rateControlConfig.lowerDensity5g === 6 ? 'Full device compatibility and range.' : 'Limited range and connectivity.'}
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={<Switch checked={values.rateControlConfig.clientRatesRequire5g} onChange={handleChange} name="rateControlConfig.clientRatesRequire5g" />}
                              label="Require Clients to Use Rates at or Above the Specified Value"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={<Switch checked={values.rateControlConfig.sendBeacons5g} onChange={handleChange} name="rateControlConfig.sendBeacons5g" />}
                              label="Send Beacons at 6 Mbps"
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* MAC Filter Accordion */}
              <Grid item xs={12}>
                <Accordion className="border rounded-md shadow-sm">
                  <AccordionSummary>
                    <Typography className="font-semibold">MAC Filter</Typography>
                  </AccordionSummary>
                  <AccordionDetails className="space-y-4">
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={<Switch checked={values.macFilterEnable} onChange={handleChange} name="macFilterEnable" />}
                          label="MAC Filter Enable"
                        />
                      </Grid>
                      {values.macFilterEnable && (
                        <>
                          <Grid item xs={12}>
                            <FormLabel component="legend">Policy</FormLabel>
                            <RadioGroup row name="macPolicy" value={values.macPolicy} onChange={handleChange}>
                              <FormControlLabel value="allow" control={<Radio />} label="Allow List" />
                              <FormControlLabel value="deny" control={<Radio />} label="Deny List" />
                            </RadioGroup>
                          </Grid>
                          <Grid item xs={12}>
                            <FormControl fullWidth>
                              <InputLabel>MAC Addresses List</InputLabel>
                              <Select name="macGroup" value={values.macGroup} onChange={handleChange}>
                                <MenuItem value="group1">Staff Devices</MenuItem>
                                <MenuItem value="group2">Guest Devices</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
};

export default CreateWirelessForm;

export function RateControlSlider({ name, allowedRates }: { name: string, allowedRates: number[] }) {
  const formik = useFormikContext<any>();
  const value = formik.values[name];

  // Chuyển giá trị thực thành index
  const indexValue = allowedRates.indexOf(value);

  const handleChange = (_: Event, newIndex: number | number[]) => {
    const index = Array.isArray(newIndex) ? newIndex[0] : newIndex;
    const realValue = allowedRates[index];
    formik.setFieldValue(name, realValue);
  };

  const marks = allowedRates.map((rate, index) => ({
    value: index,
    label: index === 0 || index === allowedRates.length - 1 ? `${rate} Mbps` : '',
  }));

  return (
    <Slider
      min={0}
      max={allowedRates.length - 1}
      step={1}
      value={indexValue}
      onChange={handleChange}
      valueLabelDisplay="auto"
      valueLabelFormat={(index) => `${allowedRates[index]} Mbps`}
      marks={marks}
      sx={{
        color: '#1976d2',
        height: 4,
        '.MuiSlider-thumb': {
          width: 16,
          height: 16,
        },
        // '.MuiSlider-mark': {
        //   backgroundColor: '#ccc',
        //   height: 8,
        //   width: 2,
        // },
        '.MuiSlider-markLabel': {
          fontSize: 12,
        },
        '.MuiSlider-markLabel[data-index="0"]': {
          transform: 'translateX(0%)',
          textAlign: 'left',
        },
        '.MuiSlider-markLabel[data-index="12"]': {
          transform: 'translateX(-100%)',
          textAlign: 'right',
        },
      }}
    />

  );
}


const WPASelector: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<{
    entSettings: {
      versionEnt: number | null;
      encryptionEnt: number | null;
    }

  }>();

  const anchorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const [hoveredMode, setHoveredMode] = useState<number | null>(null);

  // Lấy giá trị từ formik
  const versionEnt = values.entSettings.versionEnt ?? null;
  const encryptionEnt = values.entSettings.encryptionEnt ?? null;

  const handleSelect = (mode: number, encryption: number) => {
    setFieldValue("entSettings.versionEnt", mode);
    setFieldValue("entSettings.encryptionEnt", encryption);
    setOpen(false);
  };

  const handleClick = () => setOpen((prev) => !prev);

  const handleClickAway = (event: MouseEvent | TouchEvent) => {
    if (
      anchorRef.current &&
      !anchorRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
      setHoveredMode(null);
    }
  };

  const displayValue =
    versionEnt && encryptionEnt
      ? `${wpaModes.find((m) => m.value === versionEnt)?.label} / ${encryptionOptions.find((e) => e.value === encryptionEnt)?.label}`
      : "Chọn WPA Mode";

  return (
    <Box sx={{ position: "relative", display: "inline-block", width: "100%" }}>
      <Box
        ref={anchorRef}
        onClick={handleClick}
        sx={{
          border: "1px solid #ccc",
          borderRadius: 1,
          px: 2,
          py: 1.5,
          width: "100%",
          cursor: "pointer",
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography fontSize={14}>{displayValue}</Typography>
        <ArrowDropDownIcon />
      </Box>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        style={{ zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={handleClickAway}>
          <Paper
            sx={{
              display: "flex",
              mt: 1,
              width: 360,
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: 3,
            }}
          >
            <Box sx={{ width: "60%", borderRight: "1px solid #eee" }}>
              {wpaModes.map((mode) => (
                <Box
                  key={mode.value}
                  onMouseEnter={() => setHoveredMode(mode.value)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    backgroundColor:
                      hoveredMode === mode.value ? "#f0f7ff" : "transparent",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#e8f0ff" },
                  }}
                >
                  <Typography fontSize={14}>{mode.label}</Typography>
                </Box>
              ))}
            </Box>

            {hoveredMode !== null && (
              <Box sx={{ width: "40%" }}>
                {encryptionOptions
                  .filter((enc) =>
                    wpaModes
                      .find((m) => m.value === hoveredMode)
                      ?.allowEncryption.includes(enc.value)
                  )
                  .map((enc) => (
                    <Box
                      key={enc.value}
                      onClick={() => handleSelect(hoveredMode, enc.value)}
                      sx={{
                        px: 2,
                        py: 1.5,
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "#e0f7ff",
                        },
                      }}
                    >
                      <Typography fontSize={14}>{enc.label}</Typography>
                    </Box>
                  ))}
              </Box>
            )}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
};


