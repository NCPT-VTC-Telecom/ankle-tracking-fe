import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button, Grid, DialogContent, Dialog, DialogTitle, DialogActions } from '@mui/material';

// import Transitions from 'shared/components/@extended/Transitions';
import FieldView from 'shared/components/molecules/view-modal/DetailRow';
import { getValueByPath } from 'shared/utils/handleData';

interface FieldConfig {
  key: string;
  label: string;
  transform?: (value: any) => string | React.ReactNode | null;
  unit?: string | React.ReactNode;
  md?: number;
}

interface ViewDialogProps {
  title: string;
  open: boolean;
  onClose: () => void;
  data: any;
  config: FieldConfig[]; // Array of configurations
}

const ViewDialog: React.FC<ViewDialogProps> = ({ title, open, onClose, data, config }) => {
  const intl = useIntl();
  if (!data) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      // TransitionComponent={Transitions}
      aria-labelledby="admin-dialog-title"
      sx={{
        '& .MuiDialog-container': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          '& > .MuiPaper-root': {
            tabIndex: -1 // Ensure this is set if not already
          }
        }
      }}
    >
      <DialogTitle id="admin-dialog-title">{intl.formatMessage({ id: title })}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {config.map(({ key, label, transform, md, unit }, index) => {
            let value = getValueByPath(data, key);
            const formattedLabel = intl.formatMessage({ id: label });

            if (value === undefined || value === null || value === '') {
              value = <FormattedMessage id="empty" defaultMessage="Không có dữ liệu" />;
            } else {
              value = transform ? transform(value) : value;
            }

            return (
              <FieldView key={index} md={md} name={formattedLabel} field={unit && typeof value === 'string' ? `${value} ${unit}` : value} />
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          {intl.formatMessage({ id: 'close' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewDialog;
