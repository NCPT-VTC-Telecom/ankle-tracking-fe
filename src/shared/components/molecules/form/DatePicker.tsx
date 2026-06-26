import { Grid, InputLabel, Stack, FormControl, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getIn } from 'formik';
import { AttributesPropsDatePickerField } from 'shared/types';
import useConfig from 'shared/hooks/useConfig';
import dayjs from 'dayjs';

const DatePickerField = ({
  name,
  field,
  formik,
  xs,
  md,
  sm,
  onlyFuture,
  onlyPast,
  onlyYear,
  inputLabel,
  startDate,
  required
}: AttributesPropsDatePickerField) => {
  const { errors, touched, getFieldProps, setFieldValue, values } = formik;
  const { i18n } = useConfig();

  const error = getIn(errors, field);
  const touch = getIn(touched, field);
  const value = getIn(values, field);

  // Chuẩn hóa giá trị ngày từ chuỗi hoặc Date
  const normalizeDate = (dateValue: any): Date | null => {
    if (!dateValue) {
      return null; // Nếu là null hoặc undefined, trả về null
    }
    // Thử phân tích chuỗi ngày với các định dạng DD/MM/YYYY hoặc MM/DD/YYYY
    const parsedDate = dayjs(dateValue, ['DD/MM/YYYY', 'MM/DD/YYYY'], true);
    if (parsedDate.isValid()) {
      return parsedDate.toDate(); // Chuyển thành đối tượng Date
    }
    // Trường hợp dự phòng: nếu đã là Date hoặc chuỗi khác
    const fallbackDate = new Date(dateValue);
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
  };

  // Chuyển đổi ngày thành định dạng YYYY-MM-DD để gửi lên server
  const formatDateForServer = (date: Date | null): string | null => {
    if (!date) return null;
    return dayjs(date).format('YYYY-MM-DD');
  };

  return (
    <Grid item xs={xs || 12} md={md || 12} sm={sm}>
      <Stack spacing={1.25}>
        <InputLabel htmlFor={name}>
          {inputLabel} {required ? <span className="text-red-500 text-[16px]"> *</span> : ''}
        </InputLabel>
        <FormControl fullWidth error={Boolean(touch && error)}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              views={onlyYear ? ['year'] : ['year', 'month', 'day']}
              format={i18n === 'vi' ? 'dd/MM/yyyy' : 'MM/dd/yyyy'} // Luôn hiển thị DD/MM/YYYY cho tiếng Việt
              {...getFieldProps(field)}
              value={normalizeDate(value)} // Hiển thị giá trị đã chuẩn hóa
              onChange={(newValue: Date | null) => {
                const serverValue = formatDateForServer(newValue); // Chuyển thành YYYY-MM-DD
                setFieldValue(field, serverValue); // Lưu giá trị dưới dạng chuỗi YYYY-MM-DD
              }}
              components={{
                TextField: TextField
              }}
              componentsProps={{
                textField: {
                  fullWidth: true,
                  error: Boolean(touch && error),
                  helperText: touch && error ? error : ''
                }
              }}
              disablePast={onlyFuture ? true : false} // Đảm bảo ngày trong tương lai nếu cần
              disableFuture={onlyPast ? true : false}
            />
          </LocalizationProvider>
        </FormControl>
      </Stack>
    </Grid>
  );
};

export default DatePickerField;
