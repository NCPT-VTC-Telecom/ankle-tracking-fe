import { IconButton, Stack, Tooltip, useTheme } from '@mui/material';
import { Add, Edit, Eye, Lock, Trash } from 'iconsax-react';
import { FC, MouseEvent, ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

// Typing cho row React Table
interface TableRow<T = any> {
  original: T;
  isExpanded?: boolean;
  toggleRowExpanded?: () => void;
  values?: Record<string, any>;
}

interface ColumnActionsV2Props<T = any> {
  row: TableRow<T>;
  handleAdd: (record?: T) => void;
  handleClose: () => void;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onView?: (record: T) => void;

  isHiddenView?: boolean;
  isHiddenEdit?: boolean;
  isHiddenDelete?: boolean;
  isHiddenResetPassword?: boolean;
  isDeletable?: boolean;
  canWrite?: boolean;

  titleEdit?: string;
  titleDelete?: string;
  deleteIcon?: ReactNode;
  onResetPassword?: (record: T) => void;

  children?: ReactNode;
}

const ColumnActionsV2 = <T,>({
  row,
  handleAdd,
  handleClose,
  onEdit,
  onDelete,
  onView,
  onResetPassword,
  isHiddenView = false,
  isHiddenEdit = false,
  isHiddenDelete = false,
  isHiddenResetPassword = true,
  isDeletable = false,
  canWrite = true,
  titleEdit,
  titleDelete,
  deleteIcon,
  children
}: ColumnActionsV2Props<T>) => {
  const theme = useTheme();

  const collapseIcon = row.isExpanded ? <Add style={{ color: theme.palette.error.main, transform: 'rotate(45deg)' }} /> : <Eye />;

  const ActionButton: FC<{
    title: ReactNode;
    disabled?: boolean;
    color?: 'inherit' | 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    onClick: (e: MouseEvent<HTMLButtonElement>) => void;
    children: ReactNode;
  }> = ({ title, disabled, color, onClick, children }) => (
    <Tooltip title={title}>
      <span
        onClick={(e) => {
          e.stopPropagation(); // tránh toggle row khi disable
        }}
      >
        <IconButton disabled={disabled} color={color} onClick={onClick}>
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );

  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
      {!isHiddenView && onView && row.toggleRowExpanded && (
        <ActionButton
          title={<FormattedMessage id="view-details" />}
          onClick={(e) => {
            e.stopPropagation();
            onView(row.original);
            row.toggleRowExpanded?.();
          }}
        >
          {collapseIcon}
        </ActionButton>
      )}

      {!isHiddenEdit && onEdit && (
        <ActionButton
          title={titleEdit ? <FormattedMessage id={titleEdit} /> : <FormattedMessage id="edit" />}
          color="primary"
          disabled={!canWrite}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row.original);
            handleAdd(row.original);
          }}
        >
          <Edit />
        </ActionButton>
      )}

      {!isHiddenDelete && onDelete && (
        <ActionButton
          title={titleDelete ? <FormattedMessage id={titleDelete} /> : <FormattedMessage id="delete" />}
          color="error"
          disabled={isDeletable || !canWrite}
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
            onDelete(row.original);
          }}
        >
          {deleteIcon || <Trash />}
        </ActionButton>
      )}

      {!isHiddenResetPassword && onResetPassword && (
        <ActionButton
          title={<FormattedMessage id="reset-password" />}
          color="warning"
          disabled={!canWrite}
          onClick={(e) => {
            e.stopPropagation();
            onResetPassword(row.original);
          }}
        >
          <Lock />
        </ActionButton>
      )}

      {children}
    </Stack>
  );
};

export default ColumnActionsV2;
