import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, Grid } from '@mui/material';
import { Input } from 'shared/components/molecules/form';
import { Form, FormikProvider } from 'formik';
import { useIntl } from 'react-intl';
import LocationPickerMap from './LocationPickerMap';
import { useEffect } from 'react';

interface EditDeviceDialogProps {
  openEditDevice: boolean;
  onClose: () => void;
  formik: any;
}

export default function EditDeviceDialog({ openEditDevice, onClose, formik }: EditDeviceDialogProps) {
  const intl = useIntl();

  const fieldsWithOptions = [
    { name: 'location', label: 'location', type: 'map', required: true, md: 12 },
    {
      name: 'lat',
      label: 'latitude',
      type: 'text',
      placeholder: 'enter-latitude',
      required: true,
      md: 6
    },
    {
      name: 'lng',
      label: 'longitude',
      type: 'text',
      placeholder: 'enter-longitude',
      required: true,
      md: 6
    }
  ] as const;

  useEffect(() => {
    if (openEditDevice) {
      formik.resetForm();
    }
  }, [openEditDevice]);

  return (
    <Dialog
      maxWidth="sm"
      keepMounted
      fullWidth
      open={openEditDevice}
      onClose={onClose}
      sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
    >
      <DialogTitle>{intl.formatMessage({ id: 'edit-info-device' })}</DialogTitle>
      <DialogContent>
        <FormikProvider value={formik}>
          <Form>
            <Grid container spacing={2} sx={{ p: 2 }}>
              {fieldsWithOptions.map((field) => {
                const fieldName = field.name;
                switch (field.type) {
                  case 'text':
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
                        required={field.required}
                      />
                    );

                  case 'map':
                    return (
                      <Grid item md={field.md} key={fieldName}>
                        <LocationPickerMap
                          loadingText="Đang lấy tọa độ"
                          value={
                            formik.values[fieldName] && formik.values[fieldName][0] && formik.values[fieldName][1]
                              ? [Number(formik.values[fieldName][0]), Number(formik.values[fieldName][1])]
                              : null
                          }
                          onChange={(latlng: [number, number]) => {
                            formik.setFieldValue('location', latlng);
                            formik.setFieldValue('lat', latlng[0].toString());
                            formik.setFieldValue('lng', latlng[1].toString());
                          }}
                        />
                      </Grid>
                    );

                  default:
                    return null;
                }
              })}
            </Grid>

            <Grid container justifyContent="flex-end" sx={{ p: 2 }}>
              <Button onClick={onClose} disabled={formik.isSubmitting}>
                {intl.formatMessage({ id: 'cancel' })}
              </Button>
              <Button type="submit" variant="contained" color="primary" sx={{ ml: 1 }} disabled={formik.isSubmitting || !formik.isValid}>
                {formik.isSubmitting ? <CircularProgress size={24} color="inherit" /> : intl.formatMessage({ id: 'save' })}
              </Button>
            </Grid>
          </Form>
        </FormikProvider>
      </DialogContent>
    </Dialog>
  );
}
