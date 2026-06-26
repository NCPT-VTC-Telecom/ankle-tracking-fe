import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

// material-ui
import { Box, Button, Dialog, DialogContent, Stack, Typography, type DialogProps } from '@mui/material';

// project-imports
import LoadingButton from 'shared/components/@extended/LoadingButton';
import { PopupTransition } from 'shared/components/@extended/Transitions';

// assets
import { InfoCircle, TickCircle, Trash, Warning2 } from 'iconsax-react';

// types
export type ConfirmationVariant = 'delete' | 'warning' | 'info' | 'success' | 'custom';

export interface ConfirmationDialogProps {
  /** Translation key for dialog title */
  titleKey: string;
  /** Name/identifier of the target item */
  itemName?: string;
  /** Custom description or translation key for description */
  description?: string | React.ReactNode;
  /** Controls dialog visibility */
  open: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Callback when action is confirmed */
  onConfirm: () => void;
  /** Label for confirm button */
  confirmLabel?: string | React.ReactNode;
  /** Label for cancel button */
  cancelLabel?: string | React.ReactNode;
  /** Custom icon to display */
  icon?: React.ReactNode;
  /** Predefined variant that sets default styling */
  variant?: ConfirmationVariant;
  /** Color of the confirm button */
  confirmButtonColor?: 'error' | 'inherit' | 'primary' | 'secondary' | 'success' | 'info' | 'warning';
  /** Loading state for confirm button */
  isLoading?: boolean;
  /** Max width of the dialog */
  maxWidth?: DialogProps['maxWidth'];
  /** Additional props for the dialog */
  dialogProps?: Partial<DialogProps>;
  /** Show item name in description */
  showItemName?: boolean;
}

const VARIANT_CONFIG = {
  delete: {
    icon: <Trash variant="Bold" size="36" />,
    avatarColor: 'error' as const,
    confirmColor: 'error' as const,
    defaultConfirmLabel: 'delete',
    defaultDescription: 'alert-delete'
  },
  warning: {
    icon: <Warning2 variant="Bold" size="36" />,
    avatarColor: 'warning' as const,
    confirmColor: 'warning' as const,
    defaultConfirmLabel: 'confirm',
    defaultDescription: 'alert-warning'
  },
  info: {
    icon: <InfoCircle variant="Bold" size="36" />,
    avatarColor: 'info' as const,
    confirmColor: 'primary' as const,
    defaultConfirmLabel: 'confirm',
    defaultDescription: 'alert-info'
  },
  success: {
    icon: <TickCircle variant="Bold" size="36" />,
    avatarColor: 'success' as const,
    confirmColor: 'success' as const,
    defaultConfirmLabel: 'confirm',
    defaultDescription: 'alert-success'
  },
  custom: {
    icon: <InfoCircle variant="Bold" size="36" />,
    avatarColor: 'primary' as const,
    confirmColor: 'primary' as const,
    defaultConfirmLabel: 'confirm',
    defaultDescription: 'alert-confirm'
  }
};
/**
 * ConfirmationDialog - A reusable confirmation dialog component
 *
 * This component provides a standardized way to show confirmation dialogs
 * across the application. It supports multiple variants (delete, warning, info, success)
 * with predefined styling and can be fully customized when needed.
 *
 **/

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  titleKey,
  open,
  onClose,
  onConfirm,
  itemName,
  description,
  confirmLabel,
  cancelLabel,
  icon,
  variant = 'custom',
  confirmButtonColor,
  isLoading = false,
  maxWidth = 'xs',
  dialogProps,
  showItemName = true
}) => {
  const config = VARIANT_CONFIG[variant];
  const finalConfirmColor = confirmButtonColor || config.confirmColor;

  const handleClose = useCallback(() => {
    if (!isLoading) {
      onClose();
    }
  }, [isLoading, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const renderIcon = () => {
    if (icon) {
      return icon;
    }

    return (
      <Box
        color={config.avatarColor}
        sx={{
          width: 72,
          height: 72,
          bgcolor: `${config.avatarColor}.lighter`,
          color: `${config.avatarColor}.main`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '9999px'
        }}
        aria-label={`${variant} dialog icon`}
      >
        {config.icon}
      </Box>
    );
  };

  const renderDescription = () => {
    // If custom description is provided
    if (description) {
      if (typeof description === 'string') {
        return (
          <Typography align="center" component="div">
            <FormattedMessage id={description} />
            {showItemName && itemName && (
              <>
                {' '}
                <Typography component="strong" sx={{ fontWeight: 'bold' }} color="text.primary">
                  "{itemName}"
                </Typography>{' '}
                ?
              </>
            )}
          </Typography>
        );
      }
      return <div>{description}</div>;
    }

    // Use default description from variant
    return (
      <Typography align="center" component="div">
        <FormattedMessage id={config.defaultDescription} />
        {showItemName && itemName && (
          <>
            {' '}
            <Typography component="strong" sx={{ fontWeight: 'bold' }} color="text.primary">
              "{itemName}"
            </Typography>{' '}
            ?
          </>
        )}
      </Typography>
    );
  };

  const renderConfirmLabel = () => {
    if (confirmLabel) {
      return typeof confirmLabel === 'string' ? <FormattedMessage id={confirmLabel} /> : confirmLabel;
    }
    return <FormattedMessage id={config.defaultConfirmLabel} />;
  };

  const renderCancelLabel = () => {
    if (cancelLabel) {
      return typeof cancelLabel === 'string' ? <FormattedMessage id={cancelLabel} /> : cancelLabel;
    }
    return <FormattedMessage id="cancel" />;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth={maxWidth}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      {...dialogProps}
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack alignItems="center" spacing={3.5}>
          {renderIcon()}

          <Stack spacing={2} sx={{ textAlign: 'center' }}>
            <Typography variant="h4" align="center" id="confirmation-dialog-title">
              <FormattedMessage id={titleKey} />
            </Typography>

            <div id="confirmation-dialog-description">{renderDescription()}</div>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ width: 1, px: 5 }}>
            <Button fullWidth onClick={handleCancel} color="secondary" variant="outlined" disabled={isLoading} aria-label="Cancel action">
              {renderCancelLabel()}
            </Button>

            <LoadingButton
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              color={finalConfirmColor}
              variant="contained"
              onClick={handleConfirm}
              aria-label="Confirm action"
            >
              {renderConfirmLabel()}
            </LoadingButton>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
