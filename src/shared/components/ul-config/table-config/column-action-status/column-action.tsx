// components/ColumnActions.tsx
import { IconButton, Stack, Tooltip, useTheme } from '@mui/material';
import { Add, Edit, Eye, Lock, Trash } from 'iconsax-react';
import { FC, MouseEvent } from 'react';
import { FormattedMessage } from 'react-intl';

interface ColumnActionsProps {
  row: any;
  handleAdd: (record?: any) => void;
  handleClose: () => void;
  setRecord?: (record: any) => void;
  setRecordDelete?: (record: any) => void;

  isHiddenView?: boolean;
  setViewRecord?: any;

  isHiddenEdit?: boolean;
  titleEdit?: string;

  isHiddenDelete?: boolean;
  newDeleteIcon?: any;
  isDeletable?: boolean;
  titleDelete?: string;

  isHiddenResetPassword?: boolean; // Thêm prop để ẩn/hiện nút
  // reset password
  canWrite?: boolean;
  onResetPassword?: (row: any) => void; // Callback khi nhấn reset password

  children?: any;
}

const ColumnActions: FC<ColumnActionsProps> = ({
  row,
  handleAdd,
  handleClose,
  setRecord,
  setRecordDelete,

  isHiddenView,
  setViewRecord,

  isHiddenEdit,
  titleEdit,

  isHiddenDelete,
  isDeletable,
  newDeleteIcon,
  titleDelete,

  isHiddenResetPassword = true, // Mặc định ẩn reset password
  canWrite = true,
  onResetPassword,

  children
}) => {
  const theme = useTheme();

  const collapseIcon = row.isExpanded ? <Add style={{ color: theme.palette.error.main, transform: 'rotate(45deg)' }} /> : <Eye />;

  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
      {!isHiddenView && (
        <Tooltip title={<FormattedMessage id="view-details" />}>
          <span>
            <IconButton
              color="secondary"
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                if (row.values && setViewRecord) {
                  setViewRecord(row.original);
                }
                row.toggleRowExpanded();
              }}
            >
              {collapseIcon}
            </IconButton>
          </span>
        </Tooltip>
      )}
      {!isHiddenEdit && setRecord && (
        <Tooltip title={titleEdit ? <FormattedMessage id={titleEdit} /> : <FormattedMessage id="edit" />}>
          <span
            onClick={(e) => {
              //Dù IconButton bị disable, span vẫn nhận được click
              e.stopPropagation();
            }}
          >
            <IconButton
              disabled={!canWrite}
              color="primary"
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                setRecord(row.original);
                handleAdd(row.original);
              }}
            >
              <Edit />
            </IconButton>
          </span>
        </Tooltip>
      )}
      {!isHiddenDelete && setRecordDelete && (
        <Tooltip title={titleDelete ? <FormattedMessage id={titleDelete} /> : <FormattedMessage id="delete" />}>
          <span
            onClick={(e) => {
              //Dù IconButton bị disable, span vẫn nhận được click
              e.stopPropagation();
            }}
          >
            <IconButton
              color="error"
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                handleClose();
                setRecordDelete(row.original);
              }}
              disabled={isDeletable || !canWrite}
            >
              {newDeleteIcon ? newDeleteIcon : <Trash />}
            </IconButton>
          </span>
        </Tooltip>
      )}
      {!isHiddenResetPassword && onResetPassword && (
        <Tooltip title={<FormattedMessage id="reset-password" />}>
          <span
            onClick={(e) => {
              //Dù IconButton bị disable, span vẫn nhận được click
              e.stopPropagation();
            }}
          >
            <IconButton
              disabled={!canWrite}
              color="warning"
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onResetPassword(row.original);
              }}
            >
              <Lock />
            </IconButton>
          </span>
        </Tooltip>
      )}
      {children}
    </Stack>
  );
};

export default ColumnActions;
