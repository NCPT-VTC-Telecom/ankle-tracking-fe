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
  FormHelperText
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { Input, Switch } from 'shared/components/molecules/form';
import SelectInputField from './../molecules/form/Select';
import { useNavigate } from 'react-router-dom';

interface StepConfig {
  label: string;
  fields: FieldConfig[];
}

export interface Props {
  onCancel: () => void;
  title: string;
  isEditMode?: boolean;
  ssidOptions: any[];
  siteOptions: any[];
  radiusOptions: any[];
  steps?: StepConfig[];
  fieldConfig?: FieldConfig[];
  formik: any;
}

const FormPortal = ({ onCancel, formik, title, ssidOptions, siteOptions, radiusOptions, isEditMode }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [siteId, setSiteId] = useState<string>(formik.values.siteId || '');

  const [timeoutValue, setTimeoutValue] = useState<string>(
    formik.values.timeoutValue || (formik.values?.customTimeout && formik.values?.customTimeoutUnit ? 'custom' : '1h')
  );
  const [portalCustomizeValue, setPortalCustomizeValue] = useState<number>(
    formik.values.portalCustom || (formik.values?.portalCustom && formik.values?.portalCustom ? 2 : 1)
  );
  const navigate = useNavigate();
  const [landingPageValue, setLandingPageValue] = useState<number>(formik.values.landingPageValue || 1);
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

  const handleTimeoutChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as string;
    setTimeoutValue(value);

    // formik.setFieldValue('timeoutValue', value);

    // Reset custom fields nếu không chọn "Custom"
    if (value !== 'custom') {
      switch (value) {
        case '1h':
          formik.setFieldValue('customTimeout', 1);
          formik.setFieldValue('customTimeoutUnit', 2);
          break;
        case '8h':
          formik.setFieldValue('customTimeout', 8);
          formik.setFieldValue('customTimeoutUnit', 2);
          break;
        case '1d':
          formik.setFieldValue('customTimeout', 1);
          formik.setFieldValue('customTimeoutUnit', 3);
          break;
        default:
          formik.setFieldValue('customTimeout', 1);
          formik.setFieldValue('customTimeoutUnit', 2);
          break;
      }
    }
  };

  const handlePortalCustomize = (event: SelectChangeEvent<number>) => {
    const value = event.target.value as number;
    setPortalCustomizeValue(value);
  };

  const handleLandingPageChange = (event: SelectChangeEvent<number>) => {
    const value = event.target.value as number;
    setLandingPageValue(value);
    formik.setFieldValue('landingPageValue', value);

    // Reset custom URL nếu không chọn "Promotional URL" (2)
    if (value !== 2) {
      formik.setFieldValue('customLandingPageUrl', '');
    }
  };

  useEffect(() => {
    formik.resetForm({ values: formik.initialValues });
    // eslint-disable-next-line
  }, [formik.initialValues]);

  const dataAuthTypeOptions: OptionList[] = [
    { value: 0, label: intl.formatMessage({ id: 'no-auth' }) },
    { value: 1, label: intl.formatMessage({ id: 'simple-password' }) },
    { value: 2, label: intl.formatMessage({ id: 'external-radius-server' }) },
    { value: 11, label: intl.formatMessage({ id: 'hotspot' }) }
  ];

  const externalRadiusAuthOptions: OptionList[] = [
    { value: 1, label: intl.formatMessage({ id: 'pap' }) },
    { value: 2, label: intl.formatMessage({ id: 'chap' }) }
  ];

  const externalUrlSchemeOptions: OptionList[] = [
    { value: 'http', label: intl.formatMessage({ id: 'http' }) },
    { value: 'https', label: intl.formatMessage({ id: 'https' }) }
  ];

  const hotspotTypesOptions: OptionList[] = [
    { value: 3, label: intl.formatMessage({ id: 'voucher' }) },
    { value: 5, label: intl.formatMessage({ id: 'local-user' }) },
    { value: 8, label: intl.formatMessage({ id: 'hotspot-radius' }) },
    { value: 6, label: intl.formatMessage({ id: 'sms' }) },
    { value: 12, label: intl.formatMessage({ id: 'form-auth' }) }
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
                inputLabel={intl.formatMessage({ id: 'name' })}
                field="name"
                placeholder={intl.formatMessage({ id: 'enter-portal-name' })}
                formik={formik}
                // md={6}
                type="text"
                required={true}
              />
              <Switch
                key="enable"
                name="enable"
                inputLabel={intl.formatMessage({ id: 'enable' })}
                field="enable"
                formik={formik}
                required={true}
                // md={6}
              />

              <Grid item xs={10}>
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
              <Grid item xs={10}>
                <FormControl fullWidth error={Boolean(formik.touched['ssidList'] && formik.errors['ssidList'])}>
                  <InputLabel>{intl.formatMessage({ id: 'select-ssid-network' })}</InputLabel>
                  <Select
                    name="ssidList"
                    multiple
                    disabled={siteId.length === 0}
                    value={formik.values.ssid_list || []}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    label={intl.formatMessage({ id: 'select-ssid-network' })}
                    renderValue={(selected) => (
                      <div className="flex flex-wrap gap-2">
                        {selected.map((value: number) => {
                          const option = ssidOptions?.find((opt) => opt.value === value);
                          return <Chip key={value} label={option?.label || value} />;
                        })}
                      </div>
                    )}
                  >
                    <MenuItem value="" disabled>
                      {intl.formatMessage({ id: 'select-ssid-network' })}
                    </MenuItem>
                    {ssidOptions?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {formik.touched['ssidList'] && formik.errors['ssidList'] && (
                  <FormHelperText className="!mt-[2px]" error id="standard-weight-helper-text-email-login" sx={{ pl: 1, marginTop: 0 }}>
                    {formik.errors['ssidList']}
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={10}>
                <InputLabel>{intl.formatMessage({ id: 'select-authentication-type' })}</InputLabel>

                <SelectInputField
                  name="authType"
                  field="authType"
                  placeholder={intl.formatMessage({ id: 'select-authentication-type' })}
                  formik={formik}
                  arrayOption={dataAuthTypeOptions}
                />
              </Grid>
              <Grid item xs={10}>
                {formik.values.authType === 0 ? (
                  <>
                    <Grid item xs={10} className="mt-5">
                      <FormControl fullWidth>
                        <InputLabel>{intl.formatMessage({ id: 'custom-auth-timeout' })}</InputLabel>
                        <Select
                          name="timeoutValue"
                          value={timeoutValue}
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
                    {timeoutValue === 'custom' && (
                      <Grid item xs={10}>
                        <Grid container spacing={2} className="mt-2">
                          <Grid item xs={6}>
                            <Input
                              key="customTimeout"
                              name="customTimeout"
                              inputLabel={intl.formatMessage({ id: 'custom-auth-timeout' })}
                              field="customTimeout"
                              placeholder={intl.formatMessage({ id: 'enter-custom-timeout' })}
                              formik={formik}
                              type="number"
                              required={true}
                            />
                          </Grid>
                          <Grid item xs={6} className="mt-8">
                            <FormControl fullWidth>
                              <InputLabel>{intl.formatMessage({ id: 'unit' })}</InputLabel>
                              <Select
                                name="customTimeoutUnit"
                                value={formik.values.customTimeoutUnit || 2}
                                onChange={(e) => {
                                  formik.setFieldValue('customTimeoutUnit', e.target.value);
                                }}
                                label={intl.formatMessage({ id: 'unit' })}
                              >
                                <MenuItem value={1}>{intl.formatMessage({ id: 'minute' })}</MenuItem>
                                <MenuItem value={2}>{intl.formatMessage({ id: 'hour' })}</MenuItem>
                                <MenuItem value={3}>{intl.formatMessage({ id: 'day' })}</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </Grid>
                    )}
                    <Grid item xs={10} className="mt-3">
                      <Switch
                        key="dailyLimitEnable"
                        name="dailyLimitEnable"
                        inputLabel={intl.formatMessage({ id: 'daily-limit-access' })}
                        field="dailyLimitEnable"
                        formik={formik}
                        md={6}
                      />
                    </Grid>
                    <Grid item xs={10} className="mt-3">
                      <Switch
                        key="httpsRedirectEnable"
                        name="httpsRedirectEnable"
                        inputLabel={intl.formatMessage({ id: 'https-redirection' })}
                        field="httpsRedirectEnable"
                        formik={formik}
                        md={6}
                      />
                    </Grid>

                    <Grid item xs={10} className="mt-3">
                      <FormControl fullWidth>
                        <InputLabel>{intl.formatMessage({ id: 'landing-page' })}</InputLabel>
                        <Select
                          name="landingPage"
                          value={landingPageValue}
                          onChange={handleLandingPageChange}
                          onBlur={formik.handleBlur}
                          label={intl.formatMessage({ id: 'landing-page' })}
                          defaultValue={1}
                        >
                          <MenuItem value={1}>{intl.formatMessage({ id: 'redirect-to-original-url' })}</MenuItem>
                          <MenuItem value={2}>{intl.formatMessage({ id: 'redirect-to-promotional-url' })}</MenuItem>
                          <MenuItem value={3}>{intl.formatMessage({ id: 'redirect-to-success-page' })}</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {landingPageValue === 2 && (
                      <Grid item xs={10} className="mt-3">
                        <FormControl fullWidth>
                          <InputLabel>{intl.formatMessage({ id: 'landing-url-schemne' })}</InputLabel>
                          <Select
                            name="landingUrlScheme"
                            value={landingPageValue}
                            onChange={handleLandingPageChange}
                            onBlur={formik.handleBlur}
                            label={intl.formatMessage({ id: 'landing-page' })}
                          >
                            <MenuItem value="http">{intl.formatMessage({ id: 'http' })}</MenuItem>
                            <MenuItem value="https">{intl.formatMessage({ id: 'https' })}</MenuItem>
                          </Select>
                        </FormControl>
                        <Input
                          key="landingUrl"
                          name="landingUrl"
                          inputLabel={intl.formatMessage({ id: 'landing-page-url' })}
                          field={intl.formatMessage({ id: 'enter-landing-page-url' })}
                          placeholder={intl.formatMessage({ id: 'enter-landing-page-url' })}
                          formik={formik}
                          type="text"
                          required={true}
                        />
                      </Grid>
                    )}
                  </>
                ) : formik.values.authType === 1 ? (
                  <>
                    <Input
                      key="password"
                      name="password"
                      inputLabel={intl.formatMessage({ id: 'password' })}
                      field="password"
                      placeholder={intl.formatMessage({ id: 'enter-portal-password' })}
                      formik={formik}
                      md={6}
                      type="password"
                    />
                    <Grid item xs={10} className="mt-5">
                      <FormControl fullWidth>
                        <InputLabel>{intl.formatMessage({ id: 'custom-auth-timeout' })}</InputLabel>
                        <Select
                          name="timeoutValue"
                          value={timeoutValue}
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
                    {timeoutValue === 'custom' && (
                      <Grid item xs={10}>
                        <Grid container spacing={2} className="mt-2">
                          <Grid item xs={6}>
                            <Input
                              key="customTimeout"
                              name="customTimeout"
                              inputLabel={intl.formatMessage({ id: 'custom-auth-timeout' })}
                              field="customTimeout"
                              placeholder={intl.formatMessage({ id: 'enter-custom-timeout' })}
                              formik={formik}
                              type="number"
                              required={true}
                            />
                          </Grid>
                          <Grid item xs={6} className="mt-8">
                            <FormControl fullWidth>
                              <InputLabel>{intl.formatMessage({ id: 'unit' })}</InputLabel>
                              <Select
                                name="customTimeoutUnit"
                                value={formik.values.customTimeoutUnit || 2}
                                onChange={(e) => {
                                  formik.setFieldValue('customTimeoutUnit', e.target.value);
                                }}
                                label={intl.formatMessage({ id: 'unit' })}
                              >
                                <MenuItem value={1}>{intl.formatMessage({ id: 'minute' })}</MenuItem>
                                <MenuItem value={2}>{intl.formatMessage({ id: 'hour' })}</MenuItem>
                                <MenuItem value={3}>{intl.formatMessage({ id: 'day' })}</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </Grid>
                    )}
                  </>
                ) : formik.values.authType === 2 ? (
                  <>
                    {' '}
                    <Grid item xs={6}>
                      <InputLabel required={true}>{intl.formatMessage({ id: 'select-radius-profile' })}</InputLabel>
                      <div className="flex flex-col lg:flex-row">
                        {' '}
                        <SelectInputField
                          name="radiusProfileId"
                          isDisabled={siteId.length === 0}
                          field="radiusProfileId"
                          placeholder={intl.formatMessage({ id: 'select-radius-profile' })}
                          formik={formik}
                          arrayOption={radiusOptions}
                        />
                        <div
                          className="font-bold underline text-blue-500 w-full flex justify-center items-center lg:ml-2 mt-2 lg:mt-0 cursor-pointer"
                          onClick={() => {
                            navigate('/network-management/radius-management');
                          }}
                        >
                          <FormattedMessage id="manage-radius-profile" />
                        </div>
                      </div>
                    </Grid>
                    <Grid item xs={6} className="mt-3">
                      <InputLabel required={true}>{intl.formatMessage({ id: 'select-authentication-type' })}</InputLabel>
                      <SelectInputField
                        name="externalRadiusAuthMode"
                        field="externalRadiusAuthMode"
                        isDisabled={siteId.length === 0}
                        placeholder={intl.formatMessage({ id: 'select-authentication-radius-mode' })}
                        formik={formik}
                        arrayOption={externalRadiusAuthOptions}
                      />
                    </Grid>
                    <Grid item xs={6} className="mt-3">
                      <Input
                        key="nasId"
                        name="nasId"
                        inputLabel={intl.formatMessage({ id: 'nas-id' })}
                        field="nasId"
                        placeholder={intl.formatMessage({ id: 'enter-nas-id' })}
                        formik={formik}
                        // md={6}
                        disable={siteId.length === 0}
                        type="text"
                        required={true}
                      />
                    </Grid>
                    <Grid item xs={6} className="mt-3">
                      <Switch
                        key="disconnectReq"
                        name="disconnectReq"
                        inputLabel={intl.formatMessage({ id: 'disconnect-req' })}
                        field="disconnectReq"
                        formik={formik}
                        required={true}
                        // md={6}
                      />
                    </Grid>
                    <div>
                      <Grid item xs={6} className="mt-5">
                        <FormControl fullWidth>
                          <InputLabel>{intl.formatMessage({ id: 'custom-portal-type' })}</InputLabel>
                          <Select
                            name="portalCustom"
                            value={portalCustomizeValue}
                            onChange={handlePortalCustomize}
                            onBlur={formik.handleBlur}
                            label={intl.formatMessage({ id: 'custom-portal-type' })}
                          >
                            <MenuItem value={1}>{intl.formatMessage({ id: 'local-web-portal' })}</MenuItem>
                            <MenuItem value={2}>{intl.formatMessage({ id: 'external-web-portal' })}</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      {portalCustomizeValue === 2 && (
                        <Grid item xs={6} className="mt-3">
                          <div className="flex flex-row justify-center items-center">
                            <Grid item xs={2} className="mt-3">
                              <SelectInputField
                                name="externalUrlScheme"
                                field="externalUrlScheme"
                                placeholder={intl.formatMessage({ id: 'external-url-scheme' })}
                                formik={formik}
                                arrayOption={externalUrlSchemeOptions}
                              />
                            </Grid>
                            <Grid item xs={12} className="mt-3">
                              <Input
                                key="externalUrl"
                                name="externalUrl"
                                field="externalUrl"
                                placeholder={intl.formatMessage({ id: 'enter-external-url' })}
                                formik={formik}
                                // md={6}
                                type="text"
                              />
                            </Grid>
                          </div>
                        </Grid>
                      )}
                    </div>
                    <Grid item xs={6} className="mt-3">
                      <Input
                        key="receiverPort"
                        name="receiverPort"
                        inputLabel={intl.formatMessage({ id: 'receiver-port' })}
                        field="receiverPort"
                        placeholder={intl.formatMessage({ id: 'enter-receiver-port' })}
                        formik={formik}
                        // md={6}
                        type="number"
                      />
                    </Grid>
                  </>
                ) : formik.values.authType === 11 ? (
                  <>
                    <FormControl fullWidth>
                      <InputLabel>{intl.formatMessage({ id: 'select-enable-types' })}</InputLabel>
                      <Select
                        name="enabledTypes"
                        multiple
                        value={formik.values.enabledTypes || []}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        required
                        label={intl.formatMessage({ id: 'select-enable-types' })}
                        renderValue={(selected) => (
                          <div className="flex flex-wrap gap-2">
                            {selected.map((value: number) => {
                              const option = hotspotTypesOptions?.find((opt) => opt.value === value);
                              return <Chip key={value} label={option?.label || value} />;
                            })}
                          </div>
                        )}
                      >
                        <MenuItem value="" disabled>
                          {intl.formatMessage({ id: 'select-enable-types' })}
                        </MenuItem>
                        {hotspotTypesOptions?.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Grid item xs={10} className="mt-3">
                      <Switch
                        key="httpsRedirectEnable"
                        name="httpsRedirectEnable"
                        inputLabel={intl.formatMessage({ id: 'https-redirection' })}
                        field="httpsRedirectEnable"
                        formik={formik}
                        md={6}
                      />
                    </Grid>
                    <Grid item xs={10} className="mt-3">
                      <FormControl fullWidth>
                        <InputLabel>{intl.formatMessage({ id: 'landing-page' })}</InputLabel>
                        <Select
                          name="landingPage"
                          value={landingPageValue}
                          onChange={handleLandingPageChange}
                          onBlur={formik.handleBlur}
                          label={intl.formatMessage({ id: 'landing-page' })}
                          defaultValue={1}
                        >
                          <MenuItem value={1}>{intl.formatMessage({ id: 'redirect-to-original-url' })}</MenuItem>
                          <MenuItem value={2}>{intl.formatMessage({ id: 'redirect-to-promotional-url' })}</MenuItem>
                          <MenuItem value={3}>{intl.formatMessage({ id: 'redirect-to-success-page' })}</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {landingPageValue === 2 && (
                      <Grid item xs={10} className="mt-3">
                        <FormControl fullWidth>
                          <InputLabel>{intl.formatMessage({ id: 'landing-url-schemne' })}</InputLabel>
                          <Select
                            name="landingUrlScheme"
                            value={landingPageValue}
                            onChange={handleLandingPageChange}
                            onBlur={formik.handleBlur}
                            label={intl.formatMessage({ id: 'landing-page' })}
                          >
                            <MenuItem value="http">{intl.formatMessage({ id: 'http' })}</MenuItem>
                            <MenuItem value="https">{intl.formatMessage({ id: 'https' })}</MenuItem>
                          </Select>
                        </FormControl>
                        <Input
                          key="landingUrl"
                          name="landingUrl"
                          inputLabel={intl.formatMessage({ id: 'landing-page-url' })}
                          field={intl.formatMessage({ id: 'enter-landing-page-url' })}
                          placeholder={intl.formatMessage({ id: 'enter-landing-page-url' })}
                          formik={formik}
                          type="text"
                          required={true}
                        />
                      </Grid>
                    )}
                  </>
                ) : (
                  <></>
                )}
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

export default FormPortal;
