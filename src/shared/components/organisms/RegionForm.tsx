import React, { useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

// project-import
import { Grid, Typography } from '@mui/material';
import { Checkbox, CheckMark, DatePicker, Input, RangePicker, Select, Switch } from 'shared/components/molecules/form';

// third-party
import { Form, FormikProvider, getIn } from 'formik';

// types
import { FieldConfig } from 'shared/types';
import LocationPickerMap from './LocationPickerMap';

interface StepConfig {
  label: string;
  fields: FieldConfig[];
}

interface RegionFormProps {
  steps?: StepConfig[];
  fields?: FieldConfig[];
  formik: any;
}

const RegionForm: React.FC<RegionFormProps> = ({ fields, formik }) => {
  const intl = useIntl();

  // Helper function to recursively map errors to touched state
  const mapErrorsToTouched = useCallback((errors: any): any => {
    if (typeof errors !== 'object' || errors === null) {
      return true;
    }

    return Object.keys(errors).reduce((acc, key) => {
      acc[key] = mapErrorsToTouched(errors[key]);
      return acc;
    }, {} as any);
  }, []);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    // setIsSubmitting(true);
    try {
      // await handleSubmit(e);
    } finally {
      // setIsSubmitting(false);
    }
  }, []);

  const renderField = useCallback(
    (field: FieldConfig) => {
      const fieldName = field.name;
      const commonProps = {
        name: fieldName,
        field: fieldName,
        formik,
        md: field.md,
        required: field.required
      };

      const fieldTypeRenderers = {
        text: () => (
          <Input
            {...commonProps}
            key={fieldName}
            inputLabel={intl.formatMessage({ id: field.label })}
            placeholder={intl.formatMessage({ id: field.placeholder || ' ' })}
            type="text"
            row={field.row ?? 1}
            unit={field.unit ? intl.formatMessage({ id: field.unit, defaultMessage: field.unit }) : ''}
            readOnly={field.readOnly}
          />
        ),
        email: () => (
          <Input
            {...commonProps}
            key={fieldName}
            inputLabel={intl.formatMessage({ id: field.label })}
            placeholder={intl.formatMessage({ id: field.placeholder || ' ' })}
            type="email"
            row={field.row ?? 1}
            readOnly={field.readOnly}
          />
        ),
        password: () => (
          <Input
            {...commonProps}
            key={fieldName}
            inputLabel={intl.formatMessage({ id: field.label })}
            placeholder={intl.formatMessage({ id: field.placeholder || ' ' })}
            type="password"
            row={field.row ?? 1}
            readOnly={field.readOnly}
          />
        ),
        number: () => (
          <Input
            {...commonProps}
            key={fieldName}
            inputLabel={intl.formatMessage({ id: field.label })}
            placeholder={intl.formatMessage({ id: field.placeholder || ' ' })}
            type="number"
            row={field.row ?? 1}
            unit={field.unit ? intl.formatMessage({ id: field.unit, defaultMessage: field.unit }) : ''}
            readOnly={field.readOnly}
          />
        ),
        select: () => (
          <Select
            {...commonProps}
            key={fieldName}
            inputLabel={intl.formatMessage({ id: field.label })}
            arrayOption={field.options || []}
            placeholder={intl.formatMessage({ id: field.placeholder }) || ' '}
          />
        ),
        date: () => (
          <DatePicker
            {...commonProps}
            key={fieldName}
            inputLabel={intl.formatMessage({ id: field.label })}
            onlyFuture={Boolean(field.future)}
          />
        ),
        categories: () => (
          <Grid item md={field.md} key={field.label}>
            <Typography variant="h5" component="div" sx={{ mb: 0.5 }}>
              <FormattedMessage id={field.name} />
            </Typography>
          </Grid>
        ),
        checkbox: () => (
          <Checkbox
            {...commonProps}
            key={fieldName}
            inputLabel={intl.formatMessage({ id: field.label })}
            arrayOption={field.options || []}
          />
        ),
        checkmark: () => (
          <CheckMark
            {...commonProps}
            key={fieldName}
            inputLabel={intl.formatMessage({ id: field.label })}
            arrayOption={field.options || []}
          />
        ),
        switch: () => <Switch {...commonProps} inputLabel={intl.formatMessage({ id: field.label })} />,
        rangeDatePicker: () => (
          <RangePicker
            {...commonProps}
            inputLabel={intl.formatMessage({ id: field.label })}
            secondField={field.secondField || ''}
            onlyFuture={Boolean(field.future)}
            onlyPast={Boolean(field.past)}
          />
        ),
        map: () => {
          return (
            <Grid item md={field.md} key={fieldName}>
              <Typography variant="h6" gutterBottom>
                {intl.formatMessage({ id: field.label })}
                {field.required && <span style={{ color: 'red' }}>*</span>}
              </Typography>
              <LocationPickerMap
                value={
                  getIn(formik.values, fieldName) && getIn(formik.values, fieldName)[0] && getIn(formik.values, fieldName)[1]
                    ? [Number(getIn(formik.values, fieldName)[0]), Number(getIn(formik.values, fieldName)[1])]
                    : null
                }
                onChange={(latlng, address) => {
                  formik.setFieldValue(fieldName, latlng);
                  formik.setFieldValue('region.address', address);
                }}
                fullHeight={false}
              />
              {getIn(formik.touched, fieldName) && getIn(formik.errors, fieldName) && (
                <div className="mt-1 text-sm text-red-500">{getIn(formik.errors, fieldName)}</div>
              )}
            </Grid>
          );
        }
      };

      const renderer = fieldTypeRenderers[field.type as keyof typeof fieldTypeRenderers];
      return renderer ? renderer() : null;
    },
    [formik, intl]
  );

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleFormSubmit}>
        <Grid container spacing={3}>
          {fields?.map(renderField)}
        </Grid>
      </Form>
    </FormikProvider>
  );
};

export default RegionForm;
