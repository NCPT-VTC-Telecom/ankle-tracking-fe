import { Chip } from '@mui/material';
import { useIntl } from 'react-intl';

const ColumnStatus = (value: number, labelSuccess: string, labelWarning: string, labelError: string) => {
  const intl = useIntl();

  switch (value) {
    case 1:
    case 14:
      return <Chip color="success" label={intl.formatMessage({ id: labelSuccess })} size="small" variant="light" />;
    case 6:
      return <Chip color="warning" label={intl.formatMessage({ id: labelWarning })} size="small" variant="light" />;
    default:
      return <Chip color="error" label={intl.formatMessage({ id: labelError })} size="small" variant="light" />;
  }
};

export default ColumnStatus;
