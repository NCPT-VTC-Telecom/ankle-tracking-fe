import { FormattedMessage } from 'react-intl';

// material-ui
import { Button, Dialog, DialogContent, Stack, Typography } from '@mui/material';

// project-imports
import Avatar from 'shared/components/@extended/Avatar';
import { PopupTransition } from 'shared/components/@extended/Transitions';

// assets
import { Trash } from 'iconsax-react';
import LoadingButton from 'shared/components/@extended/LoadingButton';

// types
interface Props {
  alertDelete: string;
  nameRecord: string;
  labelDeleteButton?: string;
  descDelete?: string;
  open: boolean;
  handleClose: (status: boolean) => void;
  handleDelete: (status: boolean) => void;
  icon?: React.ReactNode;
  confirmButtonColor?: 'error' | 'inherit' | 'primary' | 'secondary' | 'success' | 'info' | 'warning';
  loadingButton?: boolean
}

export default function Alert({
  alertDelete,
  open,
  handleClose,
  handleDelete,
  nameRecord,
  labelDeleteButton,
  descDelete,
  icon,
  confirmButtonColor = 'error',
  loadingButton
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={() => handleClose(false)}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      aria-labelledby="column-delete-title"
      aria-describedby="column-delete-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack alignItems="center" spacing={3.5}>
          {icon ? (
            icon
          ) : (
            <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
              <Trash variant="Bold" size="36" />
            </Avatar>
          )}

          <Stack spacing={2}>
            <Typography variant="h4" align="center">
              <FormattedMessage id={alertDelete} />
            </Typography>
            <Typography align="center">
              {descDelete ? descDelete : <FormattedMessage id="alert-delete" />} <strong className="font-bold">"{nameRecord}"</strong> ?
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ width: 1, px: 5 }}>
            <Button fullWidth onClick={() => handleClose(false)} color="secondary" variant="outlined">
              <FormattedMessage id="cancel" />
            </Button>
            <LoadingButton
              loading={loadingButton}
              disabled={loadingButton}
              fullWidth
              color={confirmButtonColor}
              variant="contained"
              onClick={() => {
                handleClose(true);
                handleDelete(true);
              }}
            >
              {labelDeleteButton ? labelDeleteButton : <FormattedMessage id="delete" />}
            </LoadingButton>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
