import { IconButton, Tooltip } from '@mui/material';
import ChipStatus from 'shared/components/atoms/ChipStatus';
import { ShieldCross, ShieldTick } from 'iconsax-react';
import { MouseEvent } from 'react';
import { FormattedMessage } from 'react-intl';
import { Row } from 'react-table';
import { SSIDClientData, SSIDClientStatus } from 'shared/types';
import ColumnActionsV2 from './column-action-status/column-action-v2';

interface SSIDClientCols {
  currentPage: number;
  pageSize: number;
  handleAdd: () => void;
  handleClose: () => void;
  handleEdit?: (record: SSIDClientData) => void;
  handleDelete?: (record: SSIDClientData) => void;
  handleViewClick?: (record: SSIDClientData) => void;
  handleToggleBlock?: (record: SSIDClientData) => void;
  isHiddenView?: boolean;
  isHiddenEdit?: boolean;
  isHiddenDelete?: boolean;
  canWrite?: boolean;
}

export const columnsSSIDClient = (params: SSIDClientCols) => [
  {
    align: 'center',
    width: 50,
    sticky: 'left',
    Header: <FormattedMessage id="no." />,
    disableSortBy: true,
    accessor: 'index',
    Cell: ({ row }: { row: Row<SSIDClientData> }) => {
      const rowNumber = (params.currentPage - 1) * params.pageSize + row.index + 1;
      return <div className="font-semibold">#{rowNumber}</div>;
    }
  },
  {
    Header: <FormattedMessage id="name" />,
    accessor: 'name',
    disableSortBy: true
  },
  {
    Header: <FormattedMessage id="ip_address" />,
    accessor: 'ip_address',
    disableSortBy: true
  },
  {
    Header: <FormattedMessage id="ssid" />,
    accessor: 'ssid',
    disableSortBy: true
  },
  {
    Header: <FormattedMessage id="ap_name" />,
    id: 'ap_name',
    accessor: (row: SSIDClientData) => row.ap_name,
    disableSortBy: true
  },
  {
    Header: <FormattedMessage id="site" />,
    id: 'site_name',
    accessor: (row: SSIDClientData) => row.site_information?.name,
    disableSortBy: true
  },
  {
    Header: <FormattedMessage id="last_seen" />,
    accessor: 'last_seen',
    disableSortBy: true
  },
  {
    Header: <FormattedMessage id="status" />,
    accessor: 'status_id',
    disableSortBy: true,
    className: 'cell-center',
    Cell: ({ value }: { value: number }) => <ChipStatus id={value} successLabel="online" errorLabel="offline" />
  },
  {
    sticky: 'right',
    align: 'center',
    width: 50,
    Header: ' ',
    id: 'actions',
    disableSortBy: true,
    className: 'cell-center',
    Cell: ({ row }: { row: Row<SSIDClientData> }) => (
      <ColumnActionsV2
        row={row}
        handleAdd={params.handleAdd}
        handleClose={params.handleClose}
        onView={params.handleViewClick}
        onEdit={params.handleEdit}
        onDelete={params.handleDelete}
        isHiddenView={params.isHiddenView}
        isHiddenEdit={params.isHiddenEdit}
        isHiddenDelete={params.isHiddenDelete}
        canWrite={params.canWrite}
        children={
          row.original.status_id !== SSIDClientStatus.OFFLINE ? (
            <>
              <Tooltip
                componentsProps={{
                  tooltip: {
                    sx: { opacity: 0.9 }
                  }
                }}
                title={
                  row.original.status_id === SSIDClientStatus.ONLINE ? <FormattedMessage id="block" /> : <FormattedMessage id="unblock" />
                }
              >
                <span>
                  <IconButton
                    color={row.original.status_id === 1 ? 'warning' : 'success'}
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      params?.handleToggleBlock?.(row.original);
                    }}
                  >
                    {row.original.status_id === 1 ? <ShieldCross size="16" color="#ffa000" /> : <ShieldTick size="16" color="#2e7d32" />}
                  </IconButton>
                </span>
              </Tooltip>
            </>
          ) : null
        }
      />
    )
  }
];
