import { Chip, IconButton, Tooltip } from '@mui/material';
import { ShieldTick } from 'iconsax-react';
import { MouseEvent } from 'react';
import { FormattedMessage } from 'react-intl';
import { Row } from 'react-table';
import { DeviceConnectionLog, DeviceSeverity } from 'shared/types/device-connection-log';
import ColumnActions from './column-action-status/column-action';

interface AlertLogCols {
  currentPage: number;
  pageSize: number;
  handleClose: () => void;
  canWrite?: boolean;
  handleResolveStatus: (record: DeviceConnectionLog) => void;
}

export const columnsAlertsMonitoring = (params: AlertLogCols) => {
  return [
    {
      sticky: 'left',
      width: 70,
      align: 'center',
      Header: <FormattedMessage id="no." />,
      disableSortBy: true,
      accessor: 'index',
      className: 'cell-center',
      Cell: ({ row }: { row: Row }) => {
        const rowNumber = (params.currentPage - 1) * params.pageSize + row.index + 1;
        return <div className="font-semibold">#{rowNumber}</div>;
      }
    },
    {
      disableSortBy: true,
      Header: <FormattedMessage id="device-name" />,
      accessor: 'device_name'
    },
    {
      disableSortBy: true,
      Header: <FormattedMessage id="device-type" />,
      accessor: 'device_type',
      Cell: ({ value }: { value: string }) => <span>{value === 'AP' ? 'Access Point' : 'Switch'}</span>
    },
    {
      disableSortBy: true,
      Header: <FormattedMessage id="ip-address" />,
      accessor: 'device_ip'
    },
    {
      disableSortBy: true,
      Header: <FormattedMessage id="location" />,
      accessor: 'region_name'
    },
    {
      disableSortBy: true,
      Header: <FormattedMessage id="severity" />,
      accessor: 'severity',
      Cell: ({ value }: { value: string }) => {
        const config = {
          [DeviceSeverity.LOW]: {
            color: 'success',
            label: 'low'
          },
          [DeviceSeverity.MEDIUM]: {
            color: 'warning',
            label: 'medium'
          },
          [DeviceSeverity.HIGH]: {
            color: 'error',
            label: 'high'
          },
          [DeviceSeverity.CRITICAL]: {
            color: 'default',
            label: 'critical'
          }
        }[value];

        return (
          <Chip
            color={config?.color as any}
            label={<FormattedMessage id={config?.label || 'no-data-available'} />}
            size="small"
            variant="filled"
          />
        );
      }
    },
    {
      disableSortBy: true,
      Header: <FormattedMessage id="alert-message" />,
      accessor: 'error_message',
      Cell: ({ value }: { value: string }) => <span className="line-clamp-2 max-w-[240px]">{value}</span>
    },
    // {
    //   Header: <FormattedMessage id="resolved-at" />,
    //   accessor: 'resolve_date',
    //   Cell: ({ value }: { value: string }) => <div>{value && dayjs(value).format('HH:mm DD/MM/YYYY')}</div>
    // },
    {
      align: 'center',
      width: 100,
      disableSortBy: true,
      Header: <FormattedMessage id="status" />,
      accessor: 'solve_status',
      Cell: ({ value }: { value: string }) => {
        const config = {
          UNRESOLVED: {
            color: 'warning',
            label: 'unresolved' // i18n key
          },
          RESOLVED: {
            color: 'success',
            label: 'resolved' // i18n key
          }
        }[value];

        return <Chip color={config?.color as any} label={<FormattedMessage id={config?.label} />} size="small" variant="light" />;
      }
    },
    {
      sticky: 'right',
      width: 70,
      align: 'center',
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<DeviceConnectionLog> }) => (
        <ColumnActions
          canWrite={params.canWrite}
          row={row}
          isHiddenEdit
          isHiddenDelete
          isHiddenView={true}
          handleClose={params.handleClose}
          handleAdd={() => ''}
          children={
            <>
              <Tooltip
                componentsProps={{
                  tooltip: {
                    sx: {
                      opacity: 0.9
                    }
                  }
                }}
                title={<FormattedMessage id="resolve" />}
              >
                <span>
                  <IconButton
                    color="info"
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      params?.handleResolveStatus?.(row.original);
                      params.handleClose();
                    }}
                  >
                    <ShieldTick size="16" color="#5B6B79" />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          }
        />
      )
    }
  ];
};
