import { Chip } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface ChipStatusProps {
  id: number;
  successLabel: string;
  errorLabel: string;
  warningLabel?: string;
  dangerLabel?: string;
  infoLabel?: string;
  isolatedLabel?: string;
}

const ChipStatus = ({
  id,
  successLabel,
  errorLabel,
  warningLabel = '',
  dangerLabel = '',
  infoLabel = '',
  isolatedLabel = ''
}: ChipStatusProps) => {
  switch (id) {
    case 9:
    case 10:
    case 31:
      return (
        <Chip
          color="warning"
          label={<FormattedMessage id={warningLabel} />}
          size="small"
          variant="light"
        />
      );
    case 1:
    case 8:
    case 14:
      return (
        <Chip
          color="success"
          label={<FormattedMessage id={successLabel} />}
          size="small"
          variant="light"
        />
      );
    case 27:
      return (
        <Chip
          sx={{ bgcolor: '#FE9900' }}
          label={<FormattedMessage id={dangerLabel} />}
          size="small"
          variant="light"
        />
      );
    case 33:
      return (
        <Chip
          color="info"
          label={<FormattedMessage id={infoLabel} />}
          size="small"
          variant="light"
        />
      );
    case 11:
      return (
        <Chip
          color="warning"
          label={<FormattedMessage id={isolatedLabel} />}
          size="small"
          variant="light"
        />
      );
    default:
      return (
        <Chip
          color="error"
          label={<FormattedMessage id={errorLabel} />}
          size="small"
          variant="light"
        />
      );
  }
};

export default ChipStatus;
