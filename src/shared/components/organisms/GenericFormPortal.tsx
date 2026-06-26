import React, { useState, useEffect, useCallback } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';

// project-import
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Typography
} from '@mui/material';
import { Input, Select, Checkbox, DatePicker, Switch, CheckMark, RangePicker } from 'shared/components/molecules/form';

// third-party
import { Form, FormikProvider } from 'formik';

// types
import { FieldConfig } from 'shared/types';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    await handleSubmit(e);
    setIsSubmitting(false);
  };

  const renderField = (field: FieldConfig) => {
    const fieldName = steps
      ? `${steps[activeStep].label === intl.formatMessage({ id: 'create-region' }) ? 'region' : 'device'}.${field.name}`
      : field.name;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
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
          <Stepper activeStep={activeStep} sx={{ pt: 2, px: 2.5 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        ) : null}
        <DialogContent sx={{ p: 2.5 }}>
          <Grid container spacing={3}>
            <Grid item xs={1}></Grid>
            <Grid item xs={10}>
              <Grid container spacing={3}>
                {steps && steps[activeStep] && steps[activeStep].fields
                  ? steps[activeStep].fields.map((field) => renderField(field))
                  : fields
                  ? fields.map((field) => renderField(field))
                  : children}
              </Grid>
            </Grid>
            <Grid item xs={1}></Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5 }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              {steps && activeStep > 0 && (
                <Button onClick={handleBack} color="primary">
                  <FormattedMessage id="back" />
                </Button>
              )}
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={2} alignItems="flex-end">
                <Button aria-hidden={false} color="error" onClick={onCancel} disabled={isSubmitting}>
                  <FormattedMessage id="cancel" />
                </Button>
                {steps && activeStep < steps.length - 1 ? (
                  <Button aria-hidden={false} onClick={handleNext} variant="contained" disabled={isSubmitting}>
                    <FormattedMessage id="next" />
                  </Button>
                ) : (
                  <Button aria-hidden={false} type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} /> : <FormattedMessage id={isEditMode ? 'edit' : 'confirm'} />}
                  </Button>
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
