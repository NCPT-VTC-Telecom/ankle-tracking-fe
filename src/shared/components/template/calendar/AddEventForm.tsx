// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  RadioGroup,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { LocalizationProvider, MobileDateTimePicker } from '@mui/x-date-pickers';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider, FormikValues } from 'formik';

// project-imports
import ColorPalette from './ColorPalette';
import IconButton from 'shared/components/@extended/IconButton';
import { dispatch } from 'shared/store';
import { openSnackbar } from 'shared/store/reducers/snackbar';
import { createEvent, deleteEvent, updateEvent } from 'shared/store/reducers/calendar';

// assets
import { Calendar, Trash } from 'iconsax-react';

// types
import { ThemeMode } from 'shared/types/config';
import { DateRange } from 'shared/types/calendar';
import { FormattedMessage, useIntl } from 'react-intl';

// constant
const getInitialValues = (event: FormikValues | null, range: DateRange | null) => {
  const newEvent = {
    title: '',
    description: '',
    color: '#1890ff',
    textColor: '#fff',
    allDay: false,
    start: range ? new Date(range.start) : new Date(),
    end: range ? new Date(range.end) : new Date()
  };

  if (event || range) {
    return _.merge({}, newEvent, event);
  }

  return newEvent;
};

// ==============================|| CALENDAR - EVENT ADD / EDIT / DELETE ||============================== //

export interface AddEventFormProps {
  event?: FormikValues | null;
  range: DateRange | null;
  onCancel: () => void;
}

const AddEventFrom = ({ event, range, onCancel }: AddEventFormProps) => {
  const theme = useTheme();
  const intl = useIntl();
  const isCreating = !event;

  const backgroundColor = [
    {
      value: theme.palette.primary.main,
      color: 'primary.main'
    },
    {
      value: theme.palette.error.main,
      color: 'error.main'
    },
    {
      value: theme.palette.success.main,
      color: 'success.main'
    },
    {
      value: theme.palette.secondary.main,
      color: 'secondary.main'
    },
    {
      value: theme.palette.warning.main,
      color: 'warning.main'
    },
    {
      value: theme.palette.mode === ThemeMode.DARK ? theme.palette.primary.darker : theme.palette.primary.lighter,
      color: theme.palette.mode === ThemeMode.DARK ? 'primary.darker' : 'primary.lighter',
      isLight: true
    },
    {
      value: theme.palette.mode === ThemeMode.DARK ? theme.palette.error.darker : theme.palette.error.lighter,
      color: theme.palette.mode === ThemeMode.DARK ? 'error.darker' : 'error.lighter',
      isLight: true
    },
    {
      value: theme.palette.mode === ThemeMode.DARK ? theme.palette.success.darker : theme.palette.success.lighter,
      color: theme.palette.mode === ThemeMode.DARK ? 'success.darker' : 'success.lighter',
      isLight: true
    },
    {
      value: theme.palette.mode === ThemeMode.DARK ? theme.palette.secondary.darker : theme.palette.secondary.lighter,
      color: theme.palette.mode === ThemeMode.DARK ? 'secondary.darker' : 'secondary.lighter',
      isLight: true
    },
    {
      value: theme.palette.mode === ThemeMode.DARK ? theme.palette.warning.darker : theme.palette.warning.lighter,
      color: theme.palette.mode === ThemeMode.DARK ? 'warning.darker' : 'warning.lighter',
      isLight: true
    }
  ];

  const textColor = [
    {
      value: '#fff',
      color: 'white',
      isLight: true
    },
    {
      value: theme.palette.mode === ThemeMode.DARK ? theme.palette.error.darker : theme.palette.error.lighter,
      color: theme.palette.mode === ThemeMode.DARK ? 'error.darker' : 'error.lighter',
      isLight: true
    },
    {
      value: theme.palette.mode === ThemeMode.DARK ? theme.palette.success.darker : theme.palette.success.lighter,
      color: theme.palette.mode === ThemeMode.DARK ? 'success.darker' : 'success.lighter',
      isLight: true
    },
    {
      value: theme.palette.mode === ThemeMode.DARK ? theme.palette.secondary.darker : theme.palette.secondary.lighter,
      color: theme.palette.mode === ThemeMode.DARK ? 'secondary.darker' : 'secondary.lighter',
      isLight: true
    },
    {
      value: theme.palette.mode === ThemeMode.DARK ? theme.palette.warning.darker : theme.palette.warning.lighter,
      color: theme.palette.mode === ThemeMode.DARK ? 'warning.darker' : 'warning.lighter',
      isLight: true
    },
    {
      value: theme.palette.mode === ThemeMode.DARK ? theme.palette.primary.darker : theme.palette.primary.lighter,
      color: theme.palette.mode === ThemeMode.DARK ? 'primary.darker' : 'primary.lighter',
      isLight: true
    },
    {
      value: theme.palette.primary.main,
      color: 'primary.main'
    },
    {
      value: theme.palette.error.main,
      color: 'error.main'
    },
    {
      value: theme.palette.success.main,
      color: 'success.main'
    },
    {
      value: theme.palette.secondary.main,
      color: 'secondary.main'
    },
    {
      value: theme.palette.warning.main,
      color: 'warning.main'
    }
  ];

  const EventSchema = Yup.object().shape({
    title: Yup.string()
      .max(255)
      .required(intl.formatMessage({ id: 'title-maintenance-required' })),
    description: Yup.string().max(5000),
    end: Yup.date().when('start', (start, schema) => start && schema.min(start, intl.formatMessage({ id: 'end-date-after-start-date' }))),
    start: Yup.date(),
    color: Yup.string().max(255),
    textColor: Yup.string().max(255)
  });

  const deleteHandler = () => {
    dispatch(deleteEvent(event?.id));
    dispatch(
      openSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'delete-successfully' }),
        variant: 'alert',
        alert: {
          color: 'success'
        },
        close: false
      })
    );
  };

  const formik = useFormik({
    initialValues: getInitialValues(event!, range),
    validationSchema: EventSchema,
    onSubmit: (values, { setSubmitting }) => {
      try {
        const newEvent = {
          title: values.title,
          description: values.description,
          color: values.color,
          textColor: values.textColor,
          start: values.start,
          end: values.end
        };

        if (event) {
          dispatch(updateEvent(event.id, newEvent));
          dispatch(
            openSnackbar({
              open: true,
              message: intl.formatMessage({ id: 'update-successfully' }),
              variant: 'alert',
              alert: {
                color: 'success'
              },
              close: false
            })
          );
        } else {
          dispatch(createEvent(newEvent));
          dispatch(
            openSnackbar({
              open: true,
              message: intl.formatMessage({ id: 'add-successfully' }),
              variant: 'alert',
              alert: {
                color: 'success'
              },
              close: false
            })
          );
        }

        setSubmitting(false);
      } catch (error) {
        console.error(error);
      }
    }
  });

  const { values, errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

  return (
    <FormikProvider value={formik}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <DialogTitle>{event ? <FormattedMessage id="edit-event" /> : <FormattedMessage id="add-event" />}</DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 2.5 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="cal-title">
                    <FormattedMessage id="title-maintenance" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    id="cal-title"
                    placeholder={intl.formatMessage({ id: 'enter-title-maintenance' })}
                    {...getFieldProps('title')}
                    error={Boolean(touched.title && errors.title)}
                    helperText={touched.title && errors.title}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="cal-description">
                    <FormattedMessage id="desc" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    id="cal-description"
                    multiline
                    rows={3}
                    placeholder={intl.formatMessage({ id: 'enter-desc' })}
                    {...getFieldProps('description')}
                    error={Boolean(touched.description && errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="cal-start-date">
                    <FormattedMessage id="start-date" />
                  </InputLabel>
                  <MobileDateTimePicker
                    value={new Date(values.start)}
                    format="dd/MM/yyyy hh:mm a"
                    onChange={(date) => setFieldValue('start', date)}
                    slotProps={{
                      textField: {
                        InputProps: {
                          endAdornment: (
                            <InputAdornment position="end" sx={{ cursor: 'pointer' }}>
                              <Calendar />
                            </InputAdornment>
                          )
                        }
                      }
                    }}
                  />
                  {touched.start && errors.start && <FormHelperText error={true}>{errors.start as string}</FormHelperText>}
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="cal-end-date">
                    {' '}
                    <FormattedMessage id="end-date" />
                  </InputLabel>
                  <MobileDateTimePicker
                    value={new Date(values.end)}
                    format="dd/MM/yyyy hh:mm a"
                    onChange={(date) => setFieldValue('end', date)}
                    slotProps={{
                      textField: {
                        InputProps: {
                          endAdornment: (
                            <InputAdornment position="end" sx={{ cursor: 'pointer' }}>
                              <Calendar />
                            </InputAdornment>
                          )
                        }
                      }
                    }}
                  />
                  {touched.start && errors.start && <FormHelperText error={true}>{errors.start as string}</FormHelperText>}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      <FormattedMessage id="bg-color" />
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl>
                      <RadioGroup
                        row
                        aria-label="color"
                        {...getFieldProps('color')}
                        onChange={(e) => setFieldValue('color', e.target.value)}
                        name="color-radio-buttons-group"
                        sx={{ '& .MuiFormControlLabel-root': { mr: 2 } }}
                      >
                        {backgroundColor.map((item, index) => (
                          <ColorPalette key={index} value={item.value} color={item.color} isLight={item.isLight} />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      <FormattedMessage id="text-color" />
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl component="fieldset">
                      <RadioGroup
                        row
                        aria-label="textColor"
                        {...getFieldProps('textColor')}
                        onChange={(e) => setFieldValue('textColor', e.target.value)}
                        name="text-color-radio-buttons-group"
                        sx={{ '& .MuiFormControlLabel-root': { mr: 2 } }}
                      >
                        {textColor.map((item, index) => (
                          <ColorPalette key={index} value={item.value} color={item.color} isLight={item.isLight} />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                {!isCreating && (
                  <Tooltip title={intl.formatMessage({ id: 'delete-event' })} placement="top">
                    <IconButton onClick={deleteHandler} size="large" color="error">
                      <Trash variant="Bold" />
                    </IconButton>
                  </Tooltip>
                )}
              </Grid>
              <Grid item>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button color="error" onClick={onCancel}>
                    <FormattedMessage id="cancel" />
                  </Button>
                  <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {event ? <FormattedMessage id="edit" /> : <FormattedMessage id="add" />}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </DialogActions>
        </Form>
      </LocalizationProvider>
    </FormikProvider>
  );
};

export default AddEventFrom;
