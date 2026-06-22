import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

// project-import
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography
} from '@mui/material';
import { Checkbox, CheckMark, DatePicker, Input, RangePicker, Select, Switch } from 'components/molecules/form';

// third-party
import { Form, FormikProvider } from 'formik';

// types
import LoadingButton from 'components/@extended/LoadingButton';
import NumberInputField from 'components/molecules/form/NumberInputField';
import { FieldConfig } from 'types';
import LocationPickerMap from './LocationPickerMap';
import { TimePicker } from 'antd';
import dayjs from 'dayjs';

interface StepConfig {
  label: string;
  fields: FieldConfig[];
}

interface GenericFormProps {
  onCancel: () => void;
  title: string;
  isEditMode?: boolean;
  steps?: StepConfig[];
  fields?: FieldConfig[];
  formik: any;
  children?: React.ReactNode;
  onCreateRegion?: (regionData: any) => Promise<void>;
}

const GenericForm: React.FC<GenericFormProps> = ({ onCancel, title, isEditMode, steps, fields, formik, children, onCreateRegion }) => {
  const intl = useIntl();
  const [activeStep, setActiveStep] = useState(0);

  const { handleSubmit, setValues, resetForm, values } = formik;

  useEffect(() => {
    resetForm({
      touched: {},
      errors: {}
    });
    setValues(formik.initialValues);
    // eslint-disable-next-line
  }, [formik.initialValues]);

  const handleNext = useCallback(async () => {
    if (steps && activeStep < steps.length - 1) {
      if (activeStep === 0 && onCreateRegion) {
        await onCreateRegion(values.region);
      }
      setActiveStep((prevActiveStep) => {
        const newStep = prevActiveStep + 1;
        // console.log('Moving to step:', newStep);
        return newStep;
      });
    }
  }, [steps, activeStep, onCreateRegion, values]);

  const handleBack = useCallback(() => {
    if (steps && activeStep > 0) {
      setActiveStep((prevActiveStep) => {
        const newStep = prevActiveStep - 1;
        // console.log('Moving to step:', newStep);
        return newStep;
      });
    }
  }, [steps, activeStep]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
  };

  const renderField = (field: FieldConfig) => {
    if (field.customRender) {
      return field.customRender(formik);
    }

    const fieldName = steps
      ? `${steps[activeStep].label === intl.formatMessage({ id: 'create-region' }) ? 'region' : 'device'}.${field.name}`
      : field.name;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <Input
            key={fieldName}
            name={fieldName}
            inputLabel={intl.formatMessage({ id: field.label })}
            field={fieldName}
            placeholder={intl.formatMessage({ id: field.placeholder || ' ' })}
            formik={formik}
            md={field.md}
            type={field.type ? field.type : 'text'}
            row={field.row ? field.row : 1}
            unit={field.unit ? intl.formatMessage({ id: field.unit, defaultMessage: field.unit }) : ''}
            readOnly={field.readOnly}
            required={field.required}
          />
        );
      case 'number':
        return (
          <NumberInputField
            key={fieldName}
            name={fieldName}
            inputLabel={intl.formatMessage({ id: field.label })}
            field={fieldName}
            placeholder={intl.formatMessage({ id: field.placeholder || ' ' })}
            formik={formik}
            md={field.md}
            type={field.type ? field.type : 'text'}
            row={field.row ? field.row : 1}
            unit={field.unit ? intl.formatMessage({ id: field.unit, defaultMessage: field.unit }) : ''}
            readOnly={field.readOnly}
            required={field.required}
          />
        );
      case 'select':
        return (
          <Select
            key={fieldName}
            name={fieldName}
            inputLabel={intl.formatMessage({ id: field.label })}
            field={fieldName}
            arrayOption={field.options || []}
            formik={formik}
            placeholder={intl.formatMessage({ id: field.placeholder }) || ' '}
            md={field.md}
            required={field.required}
            loading={field.loading}
          />
        );
      case 'date':
        return (
          <DatePicker
            key={fieldName}
            name={fieldName}
            inputLabel={intl.formatMessage({ id: field.label })}
            field={fieldName}
            formik={formik}
            md={field.md}
            onlyFuture={field.future ? true : false}
            required={field.required}
          />
        );
      case 'categories':
        return (
          <Grid item md={field.md} key={field.label}>
            <Typography variant="h5" component="div" sx={{ mb: 0.5 }}>
              <FormattedMessage id={field.name} />
            </Typography>
          </Grid>
        );
      case 'checkbox':
        return (
          <Checkbox
            key={fieldName}
            name={fieldName}
            inputLabel={intl.formatMessage({ id: field.label })}
            field={fieldName}
            formik={formik}
            required={field.required}
            arrayOption={field.options || []}
            md={field.md}
          />
        );
      case 'checkmark':
        return (
          <CheckMark
            key={fieldName}
            name={fieldName}
            inputLabel={intl.formatMessage({ id: field.label })}
            // placeholder={intl.formatMessage({ id: field.placeholder })}
            field={fieldName}
            formik={formik}
            required={field.required}
            arrayOption={field.options || []}
            md={field.md}
          />
        );
      case 'switch':
        return (
          <Switch
            key={fieldName}
            name={fieldName}
            inputLabel={intl.formatMessage({ id: field.label })}
            field={fieldName}
            formik={formik}
            required={field.required}
            md={field.md}
          />
        );
      case 'rangeDatePicker':
        return (
          <RangePicker
            key={fieldName}
            md={field.md}
            name={fieldName}
            inputLabel={intl.formatMessage({ id: field.label })}
            field={fieldName}
            secondField={field.secondField || ''}
            formik={formik}
            required={field.required}
            onlyFuture={field.future ? true : false}
            onlyPast={field.past ? true : false}
          />
        );
      case 'timeRange':
        return (
          <Grid item md={field.md} key={fieldName}>
            <Typography variant="h6" gutterBottom>
              {intl.formatMessage({ id: field.label })}
              {field.required && <span style={{ color: 'red' }}>*</span>}
            </Typography>

            <TimePicker.RangePicker
              popupClassName="z-[2000]"
              format="HH:mm"
              minuteStep={1}
              value={
                formik.values[fieldName] && formik.values[fieldName][0]
                  ? [dayjs(formik.values[fieldName][0], 'HH:mm'), dayjs(formik.values[fieldName][1], 'HH:mm')]
                  : null
              }
              onChange={(values) => {
                if (!values) {
                  formik.setFieldValue(fieldName, ['', '']);
                  return;
                }
                const [start, end] = values;
                formik.setFieldValue(fieldName, [start ? start.format('HH:mm') : '', end ? end.format('HH:mm') : '']);
              }}
              style={{ width: '100%', height: 44 }}
            />

            {formik.touched[fieldName] && formik.errors[fieldName] && (
              <div className="mt-1 text-sm text-red-500">{formik.errors[fieldName]}</div>
            )}
          </Grid>
        );
      case 'map':
        return (
          <Grid item md={field.md} key={fieldName}>
            <Typography variant="h6" gutterBottom>
              {intl.formatMessage({ id: field.label })}
              {field.required && <span style={{ color: 'red' }}>*</span>}
            </Typography>
            <LocationPickerMap
              value={
                formik.values[fieldName] && formik.values[fieldName][0] && formik.values[fieldName][1]
                  ? [Number(formik.values[fieldName][0]), Number(formik.values[fieldName][1])]
                  : null
              }
              onChange={(latlng, address) => {
                formik.setFieldValue(fieldName, latlng);
                formik.setFieldValue('address', address);
              }}
              fullHeight={false}
            />
            {formik.touched[fieldName] && formik.errors[fieldName] && (
              <div className="mt-1 text-sm text-red-500">{formik.errors[fieldName]}</div>
            )}
          </Grid>
        );
      default:
        // console.warn(`Unsupported field type: ${field.type}`);
        return null;
    }
  };

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleFormSubmit}>
        <DialogTitle className="text-base">{title}</DialogTitle>
        <Divider />
        {steps && steps.length > 0 ? (
          <Stepper
            activeStep={activeStep}
            sx={{
              pt: { xs: 1.5, sm: 2 },
              px: { xs: 1.5, sm: 2.5 }
            }}
          >
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        ) : null}

        <DialogContent sx={{ px: { xs: 3, sm: 8 }, py: { xs: 3, sm: 4 } }}>
          <Grid container spacing={2}>
            {/* <Grid item xs={12} md={1}></Grid> */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {steps && steps[activeStep] && steps[activeStep].fields
                  ? steps[activeStep].fields.map((field) => renderField(field))
                  : fields
                  ? fields.map((field) => renderField(field))
                  : children}
              </Grid>
            </Grid>
            {/* <Grid item xs={12} md={1}></Grid> */}
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              {steps && activeStep > 0 && (
                <Button onClick={handleBack} color="primary">
                  <FormattedMessage id="back" />
                </Button>
              )}
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={1.5} alignItems="flex-end">
                <LoadingButton color="error" onClick={onCancel} disabled={formik.isSubmitting}>
                  <FormattedMessage id="cancel" />
                </LoadingButton>
                {steps && activeStep < steps.length - 1 ? (
                  <Button onClick={handleNext} variant="contained" disabled={formik.isSubmitting}>
                    <FormattedMessage id="next" />
                  </Button>
                ) : (
                  <LoadingButton loading={formik.isSubmitting} type="submit" variant="contained" disabled={formik.isSubmitting}>
                    <FormattedMessage id={isEditMode ? 'edit' : 'confirm'} />
                  </LoadingButton>
                )}
              </Stack>
            </Grid>
          </Grid>
        </DialogActions>
      </Form>
    </FormikProvider>
  );
};

export default GenericForm;
