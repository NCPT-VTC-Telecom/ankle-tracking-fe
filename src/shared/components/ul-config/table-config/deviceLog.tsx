import { FormattedMessage } from 'react-intl';
import { Row } from 'react-table';
import ColumnActions from './column-action-status/column-action';
import { DeviceConnectionLog } from 'shared/types/device-connection-log';
import dayjs from 'dayjs';
import { Chip } from '@mui/material';

interface DeviceLogCols {
  currentPage: number;
  pageSize: number;
  handleClose: () => void;
  setViewRecord: (record: DeviceConnectionLog) => void;
  canWrite?: boolean;
}

export const columnsDeviceLogs = (params: DeviceLogCols) => {
  return [
    {
      sticky: 'left',
      width: 70,
      align: 'center',
      Header: <FormattedMessage id="no." />,
      disableSortBy: true,
      accessor: 'index',
      className: 'cell-center',
      Cell: ({ row }: { row: Row<DeviceConnectionLog> }) => {
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
      width: 100,
      disableSortBy: true,
      Header: <FormattedMessage id="ip-address" />,
      accessor: 'device_ip'
    },
    {
      width: 120,
      disableSortBy: true,
      Header: <FormattedMessage id="mac-address" />,
      accessor: 'device_mac'
    },
    {
      disableSortBy: true,
      Header: <FormattedMessage id="region" />,
      accessor: 'region_name'
    },
    {
      disableSortBy: true,
      width: 100,
      align: 'center',
      Header: <FormattedMessage id="status" />,
      accessor: 'connection_status',
      Cell: ({ value }: { value: string }) => {
        const config = {
          DISCONNECTED: {
            color: 'error',
            label: 'disconnect' // id trong i18n
          },
          RECONNECTED: {
            color: 'success',
            label: 'reconnect' // id trong i18n
          }
        }[value];

        return (
          <Chip
            color={config?.color as any}
            label={<FormattedMessage id={config?.label} defaultMessage={''} />}
            size="small"
            variant="light"
          />
        );
      }
    },
    {
      width: 100,
      align: 'center',
      disableSortBy: true,
      Header: <FormattedMessage id="logged-at" />,
      accessor: 'logged_at',
      Cell: ({ value }: { value: string }) => <div>{dayjs(value).format('HH:mm:ss DD/MM/YYYY')}</div>
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
          isHiddenView={false}
          handleClose={params.handleClose}
          handleAdd={() => ''}
          setViewRecord={params.setViewRecord}
        />
      )
    }
  ];
};
