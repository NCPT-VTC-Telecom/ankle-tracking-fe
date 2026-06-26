import { useEffect, useState } from 'react';
// types
import { FieldConfig, OptionList } from 'shared/types';
import { Form, FormikProvider } from 'formik';
import {
  Button,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
  Stack,
  Select,
  FormHelperText,
  TextField
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { Input, Switch } from 'shared/components/molecules/form';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { InputAdornment } from '@mui/material';

interface StepConfig {
  label: string;
  fields: FieldConfig[];
}

export interface Props {
  onCancel: () => void;
  title: string;
  isEditMode?: boolean;
  ssidOptions: any[];
  portalOptions?: any[];
  rateLimitOptions?: any[];

  siteOptions: any[];
  steps?: StepConfig[];
  fieldConfig?: FieldConfig[];
  formik: any;
}

const FormVoucher = ({ onCancel, formik, title, ssidOptions, portalOptions, siteOptions, rateLimitOptions, isEditMode }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [siteId, setSiteId] = useState<string>(formik.values.siteId || '');
  const [ssidId, setSsidId] = useState<string>(formik.values.ssidId || '');
  const [limitType, setLimitType] = useState<number>(formik.values.limitType || 0);
  const [validityType, setValidityType] = useState<number>(formik.values.validityType || 0);
  const [ratelimitMode, setRatelimitMode] = useState<number>(formik.values.rateLimitMode || 0);
  const [rateLimitId, setRateLimitId] = useState<number>(formik.values.rateLimitId || 0);
  const [trafficLimitFrequency, setTrafficLimitFrequency] = useState<number>(formik.values.trafficLimitFrequency || 0);
  const [applyToAllPortals, setApplyToAllPortals] = useState<string>(formik.values.applyToAllPortals || 'true');
  const [validityValue, setValidityValue] = useState<{
    expiration_time: number | null;
    effective_time: number | null;
  }>({
    expiration_time: dayjs().startOf('day').valueOf(), // Store as timestamp (milliseconds)
    effective_time: dayjs().endOf('day').valueOf() // Store as timestamp (milliseconds)
  });

  const [duration, setDurationValue] = useState<string>(
    formik.values.duration || (formik.values?.duration && formik.values?.duration ? 'custom' : 60)
  );

  const navigate = useNavigate();
  const { handleSubmit, setValues, resetForm } = formik;
  const intl = useIntl();

  useEffect(() => {
    resetForm({
      touched: {},
      errors: {}
    });
    setValues(formik.initialValues);
    // eslint-disable-next-line
  }, [formik.initialValues]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await handleSubmit(e);
    setIsSubmitting(false);
  };
  const handleSiteChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as string;
    setSiteId(value);
    formik.setFieldValue('siteId', value);
  };

  const handleLimitTypeChange = (event: SelectChangeEvent<number>) => {
    const value = event.target.value as number;
    setLimitType(value);
    formik.setFieldValue('limitType', value);
  };

  const handleVoucherValidityChange = (event: SelectChangeEvent<number>) => {
    const value = event.target.value as number;
    setValidityType(value);
    formik.setFieldValue('validityType', value);
  };

  const handleLimitRatelimitMode = (event: SelectChangeEvent<number>) => {
    const value = event.target.value as number;
    setRatelimitMode(value);
    formik.setFieldValue('limitType', value);
  };

  const handleLimitRatelimitId = (event: SelectChangeEvent<number>) => {
    const value = event.target.value as number;
    setRateLimitId(value);
    if (event.target.value === 'add-profile') {
      navigate('/network-management/ratelimit-management');
    } else {
      formik.setFieldValue('rateLimitId', value);
    }
  };

  const handleLimitTrafficLimitFrequency = (event: SelectChangeEvent<number>) => {
    const value = event.target.value as number;
    setTrafficLimitFrequency(value);
    formik.setFieldValue('trafficLimitFrequency', value);
  };

  const handleApplyPortal = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as string;
    setApplyToAllPortals(value);
    formik.setFieldValue('setApplyToAllPortals', value);
  };

  const handleTimeoutChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as string;
    setDurationValue(value);

    // formik.setFieldValue('timeoutValue', value);

    // Reset custom fields nếu không chọn "Custom"
    if (value !== 'custom') {
      switch (value) {
        case '1h':
          formik.setFieldValue('duration', 60);
          break;
        case '8h':
          formik.setFieldValue('duration', 480);
          break;
        case '1d':
          formik.setFieldValue('duration', 1440);
          break;
        default:
          formik.setFieldValue('duration', 60);
          break;
      }
    }
  };

  const handleExpirationDateChange = (date: any) => {
    setValidityValue((prev) => ({
      ...prev,
      expiration_time: date ? date.endOf('day').valueOf() : null
    }));
  };

  const handleEffectiveDateChange = (date: any) => {
    setValidityValue((prev) => ({
      ...prev,
      effective_time: date ? date.endOf('day').valueOf() : null
    }));
  };

  useEffect(() => {
    formik.resetForm({ values: formik.initialValues });
    // eslint-disable-next-line
  }, [formik.initialValues]);

  const codeFormOptions: OptionList[] = [
    { value: 0, label: intl.formatMessage({ id: 'number' }) },
    { value: 1, label: intl.formatMessage({ id: 'letter' }) }
  ];

  const portalPrivilegeOptions: OptionList[] = [
    { value: 'true', label: intl.formatMessage({ id: 'apply-to-all-portals' }) },
    { value: 'false', label: intl.formatMessage({ id: 'significant-portal' }) }
  ];

  const limitTypeOptions: OptionList[] = [
    { value: 0, label: intl.formatMessage({ id: 'limited-usage-counts' }) },
    { value: 1, label: intl.formatMessage({ id: 'limited-online-users' }) },
    { value: 2, label: intl.formatMessage({ id: 'unlimited-for-usage' }) }
  ];

  const durationTypeOptions: OptionList[] = [
    { value: 0, label: intl.formatMessage({ id: 'client-duration' }) },
    { value: 1, label: intl.formatMessage({ id: 'voucher-duration' }) }
  ];

  const timingTypeOptions: OptionList[] = [
    { value: 0, label: intl.formatMessage({ id: 'timing-by-time' }) },
    { value: 1, label: intl.formatMessage({ id: 'timing-by-usage' }) }
  ];

  const rateLimitModeOptions: OptionList[] = [
    { value: 0, label: intl.formatMessage({ id: 'custom-rate-limit' }) },
    { value: 1, label: intl.formatMessage({ id: 'rate-limit-profile-id' }) }
  ];

  const voucherValidityModeOptions: OptionList[] = [
    { value: 0, label: intl.formatMessage({ id: 'no' }) },
    { value: 1, label: intl.formatMessage({ id: 'yes' }) }
  ];

  const trafficLimitFrequencyOptions: OptionList[] = [
    { value: 0, label: intl.formatMessage({ id: 'total-traffic' }) },
    { value: 1, label: intl.formatMessage({ id: 'daily' }) },
    { value: 2, label: intl.formatMessage({ id: 'weekly' }) },
    { value: 3, label: intl.formatMessage({ id: 'monthly' }) }
  ];

  return (
    <div>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleFormSubmit}>
          <DialogTitle className="text-base">{title}</DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 2.5 }}>
            <Grid container spacing={3}>
              <Input
                key="name"
                name="name"
                inputLabel={intl.formatMessage({ id: 'voucher-group-name' })}
                field="name"
                placeholder={intl.formatMessage({ id: 'enter-voucher-group-name' })}
                formik={formik}
                // md={6}
                type="text"
                required={true}
              />
              <Grid item xs={6}>
                <FormControl fullWidth error={Boolean(formik.touched['siteId'] && formik.errors['siteId'])}>
                  <InputLabel>{intl.formatMessage({ id: 'select-site' })}</InputLabel>
                  <Select
                    name="siteId"
                    value={siteId}
                    onChange={handleSiteChange}
                    onBlur={formik.handleBlur}
                    required
                    label={intl.formatMessage({ id: 'site' })}
                  >
                    <MenuItem value="" disabled>
                      {intl.formatMessage({ id: 'select-site-network' })}
                    </MenuItem>
                    {siteOptions?.map((option) => (
                      <MenuItem key={option.value} value={option.value} disabled={option.label == 'System'}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {formik.touched['siteId'] && formik.errors['siteId'] && (
                  <FormHelperText className="!mt-[2px]" error id="standard-weight-helper-text-email-login" sx={{ pl: 1, marginTop: 0 }}>
                    {formik.errors['siteId']}
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth error={Boolean(formik.touched['ssidId'] && formik.errors['ssidId'])}>
                  <InputLabel>{intl.formatMessage({ id: 'select-ssid' })}</InputLabel>
                  <Select
                    disabled={!siteId}
                    name="ssidId"
                    value={ssidId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSsidId(value);
                      formik.setFieldValue('ssidId', value);
                    }}
                    onBlur={formik.handleBlur}
                    required
                    label={intl.formatMessage({ id: 'ssid' })}
                  >
                    {ssidOptions?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {formik.touched['siteId'] && formik.errors['siteId'] && (
                  <FormHelperText className="!mt-[2px]" error id="standard-weight-helper-text-email-login" sx={{ pl: 1, marginTop: 0 }}>
                    {formik.errors['siteId']}
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth error={Boolean(formik.touched['applyToAllPortals'] && formik.errors['applyToAllPortals'])}>
                  <InputLabel>{intl.formatMessage({ id: 'select-apply-to-all-portals' })}</InputLabel>
                  <Select
                    name="apply_to_all_portals"
                    value={applyToAllPortals}
                    onChange={handleApplyPortal}
                    onBlur={formik.handleBlur}
                    disabled={!siteId}
                    label={intl.formatMessage({ id: 'apply-to-all-portals' })}
                  >
                    <MenuItem value="" disabled>
                      {intl.formatMessage({ id: 'select-apply-to-all-portals' })}
                    </MenuItem>
                    {portalPrivilegeOptions?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {formik.touched['applyToAllPortals'] && formik.errors['applyToAllPortals'] && (
                  <FormHelperText className="!mt-[2px]" error id="standard-weight-helper-text-email-login" sx={{ pl: 1, marginTop: 0 }}>
                    {formik.errors['applyToAllPortals']}
                  </FormHelperText>
                )}
              </Grid>
              {applyToAllPortals === 'false' && (
                <Grid item xs={12}>
                  <FormControl fullWidth error={Boolean(formik.touched['codeFormat'] && formik.errors['portals'])}>
                    <InputLabel>{intl.formatMessage({ id: 'select-portals' })}</InputLabel>
                    <Select
                      name="portals"
                      // multiple
                      disabled={!siteId}
                      value={formik.values.portals || []}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label={intl.formatMessage({ id: 'select-portals' })}
                      renderValue={(selected) => (
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(selected) &&
                            selected?.map((value: number) => {
                              const option = portalOptions?.find((opt) => opt.value === value);
                              return <Chip key={value} label={option?.label || value} />;
                            })}
                        </div>
                      )}
                    >
                      <MenuItem value="" disabled>
                        {intl.formatMessage({ id: 'select-portals' })}
                      </MenuItem>
                      {portalOptions?.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {formik.touched['ssid_id'] && formik.errors['ssid_id'] && (
                    <FormHelperText className="!mt-[2px]" error id="standard-weight-helper-text-email-login" sx={{ pl: 1, marginTop: 0 }}>
                      {formik.errors['ssid_id']}
                    </FormHelperText>
                  )}
                </Grid>
              )}

              <Grid item xs={6}>
                {/* <Input
                  key="codeLength"
                  name="codeLength"
                  disable={!siteId}
                  inputLabel={intl.formatMessage({ id: 'code-length' })}
                  field="codeLength"
                  placeholder={intl.formatMessage({ id: 'enter-voucher-group-code-length' })}
                  formik={formik}
                  type="number"
                  required={true}
                /> */}
                <TextField
                  key="codeLength"
                  name="codeLength"
                  label={intl.formatMessage({ id: 'code-length' })}
                  placeholder={intl.formatMessage({ id: 'enter-voucher-group-code-length' })}
                  value={formik.values.codeLength}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  type="number"
                  disabled={!siteId}
                  required
                  fullWidth
                  error={formik.touched.codeLength && Boolean(formik.errors.codeLength)}
                  helperText={formik.touched.codeLength && formik.errors.codeLength}
                />
              </Grid>
              <Grid item xs={6}>
                {/* <Input
                  key="amount"
                  name="amount"
                  disable={!siteId}
                  inputLabel={intl.formatMessage({ id: 'amount-voucher-group' })}
                  field="amount"
                  placeholder={intl.formatMessage({ id: 'enter-voucher-group-amount' })}
                  formik={formik}
                  type="number"
                  required={true}
                /> */}
                <TextField
                  key="amount"
                  name="amount"
                  label={intl.formatMessage({ id: 'amount-voucher-group' })}
                  placeholder={intl.formatMessage({ id: 'enter-voucher-group-amount' })}
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  type="number"
                  disabled={!siteId}
                  required
                  fullWidth
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                  helperText={formik.touched.amount && formik.errors.amount}
                />
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth error={Boolean(formik.touched['codeForm'] && formik.errors['codeForm'])}>
                  <InputLabel required>{intl.formatMessage({ id: 'select-code-form' })}</InputLabel>
                  <Select
                    name="codeForm"
                    multiple
                    disabled={!siteId}
                    value={formik.values.codeForm || []}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    label={intl.formatMessage({ id: 'select-code-form' })}
                    renderValue={(selected) => (
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(selected) &&
                          selected?.map((value: number) => {
                            const option = codeFormOptions?.find((opt) => opt.value === value);
                            return <Chip key={value} label={option?.label || value} />;
                          })}
                      </div>
                    )}
                  >
                    <MenuItem value="" disabled>
                      {intl.formatMessage({ id: 'select-code-form' })}
                    </MenuItem>
                    {codeFormOptions?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {formik.touched['codeForm'] && formik.errors['codeForm'] && (
                  <FormHelperText className="!mt-[2px]" error id="standard-weight-helper-text-email-login" sx={{ pl: 1, marginTop: 0 }}>
                    {formik.errors['codeForm']}
                  </FormHelperText>
                )}
              </Grid>

              <Grid item xs={12} className="flex flex-col md:flex-row">
                <Grid item xs={6} className="">
                  <FormControl fullWidth error={Boolean(formik.touched['limitType'] && formik.errors['limitType'])}>
                    <InputLabel>{intl.formatMessage({ id: 'select-limit-type' })}</InputLabel>
                    <Select
                      name="limitType"
                      value={limitType}
                      onChange={handleLimitTypeChange}
                      onBlur={formik.handleBlur}
                      disabled={!siteId}
                      label={intl.formatMessage({ id: 'limit-type' })}
                    >
                      <MenuItem value="" disabled>
                        {intl.formatMessage({ id: 'select-limit-type' })}
                      </MenuItem>
                      {limitTypeOptions?.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {formik.touched['limitType'] && formik.errors['limitType'] && (
                    <FormHelperText className="!mt-[2px]" error id="standard-weight-helper-text-email-login" sx={{ pl: 1, marginTop: 0 }}>
                      {formik.errors['limitType']}
                    </FormHelperText>
                  )}
                </Grid>
                {limitType !== 2 && (
                  <Grid item xs={6} className="">
                    {/* <Input
                      key="limitNum"
                      name="limitNum"
                      inputLabel={intl.formatMessage({ id: 'voucher-limit-num' })}
                      field="limitNum"
                      placeholder={intl.formatMessage({ id: 'enter-voucher-limit-num' })}
                      formik={formik}
                      disable={!siteId}
                      type="number"
                    /> */}
                    <TextField
                      key="limitNum"
                      name="limitNum"
                      label={intl.formatMessage({ id: 'voucher-limit-num' })}
                      placeholder={intl.formatMessage({ id: 'enter-voucher-limit-num' })}
                      value={formik.values.limitNum}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      type="number"
                      disabled={!siteId}
                      fullWidth
                      error={formik.touched.limitNum && Boolean(formik.errors.limitNum)}
                      helperText={formik.touched.limitNum && formik.errors.limitNum}
                    />
                  </Grid>
                )}
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth error={Boolean(formik.touched['durationType'] && formik.errors['durationType'])}>
                  <InputLabel>{intl.formatMessage({ id: 'select-duration-type' })}</InputLabel>
                  <Select
                    name="durationType"
                    onBlur={formik.handleBlur}
                    onChange={(e) => {
                      formik.setFieldValue('durationType', e.target.value);
                    }}
                    disabled={!siteId}
                    label={intl.formatMessage({ id: 'duration-type' })}
                  >
                    <MenuItem value="" disabled>
                      {intl.formatMessage({ id: 'select-duration-type' })}
                    </MenuItem>
                    {durationTypeOptions?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {formik.touched['durationType'] && formik.errors['durationType'] && (
                  <FormHelperText className="!mt-[2px]" error id="standard-weight-helper-text-email-login" sx={{ pl: 1, marginTop: 0 }}>
                    {formik.errors['durationType']}
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth error={Boolean(formik.touched['timingType'] && formik.errors['timingType'])}>
                  <InputLabel>{intl.formatMessage({ id: 'select-timing-type' })}</InputLabel>
                  <Select
                    name="timingType"
                    onBlur={formik.handleBlur}
                    onChange={(e) => {
                      formik.setFieldValue('timingType', e.target.value);
                    }}
                    disabled={!siteId}
                    label={intl.formatMessage({ id: 'timing_type-type' })}
                  >
                    <MenuItem value="" disabled>
                      {intl.formatMessage({ id: 'select-timing-type' })}
                    </MenuItem>
                    {timingTypeOptions?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {formik.touched['durationType'] && formik.errors['durationType'] && (
                  <FormHelperText className="!mt-[2px]" error id="standard-weight-helper-text-email-login" sx={{ pl: 1, marginTop: 0 }}>
                    {formik.errors['durationType']}
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={duration === 'custom' ? 6 : 12}>
                <FormControl fullWidth>
                  <InputLabel>{intl.formatMessage({ id: 'custom-auth-timeout' })}</InputLabel>
                  <Select
                    name="duration"
                    value={duration}
                    disabled={!siteId}
                    onChange={handleTimeoutChange}
                    onBlur={formik.handleBlur}
                    label={intl.formatMessage({ id: 'custom-auth-timeout' })}
                  >
                    <MenuItem value="1h">{intl.formatMessage({ id: '1-hour' })}</MenuItem>
                    <MenuItem value="8h">{intl.formatMessage({ id: '8-hours' })}</MenuItem>
                    <MenuItem value="1d">{intl.formatMessage({ id: '1-day' })}</MenuItem>
                    <MenuItem value="custom">{intl.formatMessage({ id: 'custom' })}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {duration === 'custom' && (
                <Grid item xs={6}>
                  {/* <Input
                    key="duration"
                    name="duration"
                    inputLabel={intl.formatMessage({ id: 'custom-duration' })}
                    field="duration"
                    disable={!siteId}
                    placeholder={intl.formatMessage({ id: 'enter-duration' })}
                    formik={formik}
                    type="number"
                    unit={intl.formatMessage({ id: 'minute' })}
                  /> */}
                  <TextField
                    key="duration"
                    name="duration"
                    label={intl.formatMessage({ id: 'custom-duration' })}
                    placeholder={intl.formatMessage({ id: 'enter-duration' })}
                    type="number"
                    disabled={!siteId}
                    value={formik.values.duration}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(formik.touched.duration && formik.errors.duration)}
                    helperText={formik.touched.duration && formik.errors.duration}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">{intl.formatMessage({ id: 'minute' })}</InputAdornment>
                    }}
                  />
                </Grid>
              )}

              <Grid item xs={ratelimitMode == 1 ? 6 : 12}>
                <FormControl fullWidth error={Boolean(formik.touched['rateLimitMode'] && formik.errors['rateLimitMode'])}>
                  <InputLabel>{intl.formatMessage({ id: 'select-ratelimit-mode' })}</InputLabel>
                  <Select
                    name="rateLimitMode"
                    value={ratelimitMode}
                    onChange={handleLimitRatelimitMode}
                    onBlur={formik.handleBlur}
                    disabled={!siteId}
                    label={intl.formatMessage({ id: 'ratelimit-mode' })}
                  >
                    <MenuItem value="" disabled>
                      {intl.formatMessage({ id: 'select-ratelimit-mode' })}
                    </MenuItem>
                    {rateLimitModeOptions?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {formik.touched['rateLimitMode'] && formik.errors['rateLimitMode'] && (
                  <FormHelperText className="!mt-[2px]" error id="standard-weight-helper-text-email-login" sx={{ pl: 1, marginTop: 0 }}>
                    {formik.errors['rateLimitMode']}
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={12}>
                <Switch
                  key="logout"
                  name="logout"
                  inputLabel={intl.formatMessage({ id: 'logout' })}
                  field="logout"
                  disabled={!siteId}
                  note={`(${intl.formatMessage({ id: 'logout-note' })})`}
                  formik={formik}
                  xsCheckBox={12}
                  mdCheckBox={12}
                />
              </Grid>
              {ratelimitMode === 1 ? (
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>{intl.formatMessage({ id: 'ratelimit-id' })}</InputLabel>
                    <Select
                      name="rateLimitId"
                      value={rateLimitId}
                      onChange={handleLimitRatelimitId}
                      onBlur={formik.handleBlur}
                      label={intl.formatMessage({ id: 'ratelimit-id' })}
                      disabled={!siteId}
                    >
                      {rateLimitOptions?.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                      <hr></hr>
                      <MenuItem value="add-profile">+ {intl.formatMessage({ id: 'add-profile' })}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              ) : (
                <>
                  <Grid item xs={12} className="flex flex-col lg:flex-row">
                    <Switch
                      key="customRateLimitDownEnable"
                      name="customRateLimitDownEnable"
                      inputLabel={intl.formatMessage({ id: 'custom-ratelimit-down-enable' })}
                      field="customRateLimitDownEnable"
                      disabled={!siteId}
                      formik={formik}
                      md={6}
                    />
                    {formik.values.customRateLimitDownEnable === 'true' && (
                      <Input
                        key="customRateLimitDown"
                        name="customRateLimitDown"
                        inputLabel={intl.formatMessage({ id: 'custom-ratelimit-down' })}
                        field="customRateLimitDown"
                        placeholder={intl.formatMessage({ id: 'enter-custom-ratelimit-down' })}
                        formik={formik}
                        disable={!siteId}
                        unit="Kbps"
                        type="number"
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} className="flex flex-col lg:flex-row mt-3">
                    <Switch
                      key="customRateLimitUpEnable"
                      name="customRateLimitUpEnable"
                      inputLabel={intl.formatMessage({ id: 'custom-ratelimit-up-enable' })}
                      field="customRateLimitUpEnable"
                      disabled={!siteId}
                      formik={formik}
                      md={6}
                    />
                    {formik.values.customRateLimitUpEnable === 'true' && (
                      <Input
                        key="customRateLimitUp"
                        name="customRateLimitUp"
                        inputLabel={intl.formatMessage({ id: 'custom-ratelimit-up' })}
                        field="customRateLimitUp"
                        placeholder={intl.formatMessage({ id: 'enter-custom-ratelimit-up' })}
                        formik={formik}
                        disable={!siteId}
                        unit="Kbps"
                        type="number"
                      />
                    )}
                  </Grid>
                </>
              )}
              <Grid item xs={12} className="mt-0 lg:mt-5">
                <Grid item xs={12} className="flex flex-col lg:flex-row">
                  <Switch
                    key="trafficLimitEnable"
                    name="trafficLimitEnable"
                    inputLabel={intl.formatMessage({ id: 'custom-traffic-limit-enable' })}
                    field="trafficLimitEnable"
                    disabled={!siteId}
                    formik={formik}
                    md={4}
                  />
                  {formik.values.trafficLimitEnable === 'true' && (
                    <Grid item xs={8} className="flex flex-row">
                      <Grid item xs={5} className="mt-0 lg:mt-8 mr-0 lg:mr-5">
                        <FormControl
                          fullWidth
                          error={Boolean(formik.touched['trafficLimitFrequency'] && formik.errors['trafficLimitFrequency'])}
                        >
                          <InputLabel>{intl.formatMessage({ id: 'select-traffic-limit-frequency' })}</InputLabel>
                          <Select
                            name="trafficLimitFrequency"
                            value={trafficLimitFrequency}
                            onChange={handleLimitTrafficLimitFrequency}
                            onBlur={formik.handleBlur}
                            label={intl.formatMessage({ id: 'traffic-limit-frequency' })}
                          >
                            <MenuItem value="" disabled>
                              {intl.formatMessage({ id: 'select-traffic-limit-frequency' })}
                            </MenuItem>
                            {trafficLimitFrequencyOptions?.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {formik.touched['trafficLimitFrequency'] && formik.errors['trafficLimitFrequency'] && (
                          <FormHelperText
                            className="!mt-[2px]"
                            error
                            id="standard-weight-helper-text-email-login"
                            sx={{ pl: 1, marginTop: 0 }}
                          >
                            {formik.errors['siteId']}
                          </FormHelperText>
                        )}
                      </Grid>
                      <Input
                        key="trafficLimit"
                        name="trafficLimit"
                        inputLabel={intl.formatMessage({ id: 'traffic-limit' })}
                        field="trafficLimit"
                        placeholder={intl.formatMessage({ id: 'enter-traffic-limit' })}
                        formik={formik}
                        disable={!siteId}
                        xs={9}
                        unit="MB"
                        type="number"
                      />
                    </Grid>
                  )}
                </Grid>
              </Grid>
              <Grid item xs={12} className="flex flex-col lg:flex-row mt-0 lg:mt-5">
                <Grid item lg={3} xs={12} className="lg:mt-5">
                  <FormControl fullWidth error={Boolean(formik.touched['validityType'] && formik.errors['validityType'])}>
                    <InputLabel>{intl.formatMessage({ id: 'select-validity-type' })}</InputLabel>
                    <Select
                      name="validityType"
                      value={validityType}
                      onChange={handleVoucherValidityChange}
                      disabled={!siteId}
                      onBlur={formik.handleBlur}
                      label={intl.formatMessage({ id: 'validity-type' })}
                    >
                      <MenuItem value="" disabled>
                        {intl.formatMessage({ id: 'select-validity-type' })}
                      </MenuItem>
                      {voucherValidityModeOptions?.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {formik.touched['siteId'] && formik.errors['siteId'] && (
                    <FormHelperText className="!mt-[2px]" error id="standard-weight-helper-text-email-login" sx={{ pl: 1, marginTop: 0 }}>
                      {formik.errors['siteId']}
                    </FormHelperText>
                  )}
                </Grid>
                {validityType === 1 && (
                  <Grid item lg={9} xs={12} className="flex flex-col lg:flex-row gap-2 lg:ml-2">
                    <Grid item lg={6}>
                      <InputLabel>{intl.formatMessage({ id: 'effective-time' })}</InputLabel>
                      <DatePicker
                        format="DD/MM/YYYY"
                        onChange={handleEffectiveDateChange}
                        style={{ width: '100%', height: '40px' }}
                        value={validityValue.effective_time ? dayjs(validityValue.effective_time) : undefined}
                        placeholder={intl.formatMessage({ id: 'effective-time' })}
                      />
                    </Grid>
                    <Grid item lg={6}>
                      <InputLabel>{intl.formatMessage({ id: 'expiration-time' })}</InputLabel>
                      <DatePicker
                        format="DD/MM/YYYY"
                        onChange={handleExpirationDateChange}
                        style={{ width: '100%', height: '40px' }}
                        value={validityValue.expiration_time ? dayjs(validityValue.expiration_time) : undefined}
                        placeholder={intl.formatMessage({ id: 'expiration-time' })}
                      />
                    </Grid>
                  </Grid>
                )}
              </Grid>
              <Grid item xs={6}>
                <Input
                  key="unitPrice"
                  name="unitPrice"
                  inputLabel={intl.formatMessage({ id: 'unit-price' })}
                  field="unitPrice"
                  disable={!siteId}
                  placeholder={intl.formatMessage({ id: 'enter-unit-price' })}
                  formik={formik}
                  type="number"
                  unit={intl.formatMessage({ id: 'VND' })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Stack direction="row" spacing={2} alignItems="flex-end">
                  <Button aria-hidden={false} color="error" onClick={onCancel} disabled={isSubmitting}>
                    <FormattedMessage id="cancel" />
                  </Button>
                  <Button aria-hidden={false} type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} /> : <FormattedMessage id={isEditMode ? 'edit' : 'confirm'} />}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </DialogActions>
        </Form>
      </FormikProvider>
    </div>
  );
};

export default FormVoucher;
