import { Grid, InputLabel, Stack, FormControl } from '@mui/material';
import { getIn } from 'formik';
import { AttributesPropsRangePicker } from 'shared/types';

import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useIntl } from 'react-intl';
import useConfig from 'shared/hooks/useConfig';
import { FormHelperText } from '@mui/material';
dayjs.extend(customParseFormat);

const DateRangePickerField = ({
  name,
  field,
  formik,
  xs,
  md,
  sm,
  inputLabel,
  required,
  secondField,
  onlyPast,
  onlyFuture
}: AttributesPropsRangePicker) => {
  const { errors, touched, setFieldValue, values } = formik;
  const intl = useIntl();

  const { i18n } = useConfig();
  const { RangePicker } = DatePicker;

  const dateFormat = i18n === 'vi' ? 'DD/MM/YYYY' : 'MM/DD/YYYY';

  const error = getIn(errors, field);
  const touch = getIn(touched, field);
  const startDate = getIn(values, field);
  const endDate = getIn(values, secondField);

  const handleChange = (dates: any) => {
    if (dates) {
      const start_date = dates[0]?.format('YYYY/MM/DD');
      const end_date = dates[1]?.format('YYYY/MM/DD');

      setFieldValue(field, start_date);
      setFieldValue(secondField, end_date);
    }
  };

  return (
    <Grid item xs={xs || 12} md={md || 12} sm={sm}>
      <Stack spacing={1.25}>
        <InputLabel htmlFor={name}>
          {inputLabel} {required ? <span className="text-red-500 text-[16px]"> *</span> : ''}
        </InputLabel>
        <FormControl fullWidth error={Boolean(touch && error)}>
          <RangePicker
            format={dateFormat}
            value={
              startDate && endDate
                ? [dayjs(startDate, ['YYYY/MM/DD', 'DD/MM/YYYY', 'MM/DD/YYYY']), dayjs(endDate, ['YYYY/MM/DD', 'DD/MM/YYYY', 'MM/DD/YYYY'])]
                : [null, null]
            }
            onChange={handleChange}
            getPopupContainer={(triggerNode) => {
              const container = triggerNode.parentNode instanceof HTMLElement ? triggerNode.parentNode : document.body;
              container.classList.add('date-picker-popup-container');
              return container;
            }}
            disabledDate={(current: Dayjs) => {
              return !!((onlyFuture && current.isBefore(dayjs().startOf('day'))) || (onlyPast && current.isAfter(dayjs().endOf('day'))));
            }}
            placeholder={[intl.formatMessage({ id: 'start-date' }), intl.formatMessage({ id: 'end-date' })]}
            style={{
              fontFamily: 'Arial, Helvetica, sans-serif',
              width: '100%',
              height: '48px',
              color: '#1D2630',
              borderColor: '#BEC8D0',
              borderRadius: '8px',
              fontSize: '0.875rem',
              lineHeight: '1.4375em'
            }}
          />
        </FormControl>
        {touched[field] && errors[field] && (
          <FormHelperText error id={name} sx={{ pl: 1.75 }}>
            {errors[field]}
          </FormHelperText>
        )}
      </Stack>
    </Grid>
  );
};

export default DateRangePickerField;
