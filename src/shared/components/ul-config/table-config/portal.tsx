import { FormattedMessage } from 'react-intl';
import { Row } from 'react-table';
import ColumnActions from './column-action-status/column-action';
import ChipStatus from 'shared/components/atoms/ChipStatus';
import { DataPortal } from 'shared/types/portal';

export const columnsPortal = (
  currentPage: number,
  pageSize: number,
  handleAdd: () => void,
  handleClose: () => void,
  setRecord: (record: DataPortal) => void,
  setRecordDelete: (record: DataPortal) => void,
  onViewClick?: (record: DataPortal) => void,
  canWrite?: boolean
) => {
  return [
    {
      Header: <FormattedMessage id="no." />,
      disableSortBy: true,
      accessor: 'index',
      align: 'center',
      sticky: 'left',
      width: 70,
      className: 'cell-center',
      Cell: ({ row }: { row: Row }) => {
        const rowNumber = (currentPage - 1) * pageSize + row.index + 1;
        return <div className="font-semibold">#{rowNumber}</div>;
      }
    },
    {
      Header: <FormattedMessage id="name" />,
      disableSortBy: true,
      accessor: 'name'
    },

    {
      Header: <FormattedMessage id="auth-type" />,
      disableSortBy: true,
      accessor: 'auth_type',
      Cell: ({ value }: { value: number }) => {
        const getAuthTypeLabel = (authValue: number): string => {
          switch (authValue) {
            case 0:
              return 'No Authentication';
            case 1:
              return 'Simple Password';
            case 2:
              return 'External Radius Server';
            case 4:
              return 'External Portal Server';
            case 11:
              return 'Hotspot';
            default:
              return '--'; // Giá trị mặc định nếu không khớp
          }
        };

        return <div>{getAuthTypeLabel(value)}</div>;
      }
    },
    {
      Header: <FormattedMessage id="host-type" />,
      disableSortBy: true,
      accessor: 'host_type',
      Cell: ({ value }: { value: number }) => <div>{value || '--'}</div>
    },
    {
      Header: <FormattedMessage id="site" />,
      disableSortBy: true,
      accessor: 'site.name',
      Cell: ({ value }: { value: string }) => <div>{value || '--'}</div>
    },
    {
      Header: <FormattedMessage id="landing-url" />,
      disableSortBy: true,
      accessor: 'landing_url',
      Cell: ({ value }: { value: string }) => <div>{value || '--'}</div>
    },
    {
      Header: <FormattedMessage id="server-url" />,
      disableSortBy: true,
      accessor: 'server_url',
      Cell: ({ value }: { value: string }) => <div>{value || '--'}</div>
    },
    {
      Header: <FormattedMessage id="status" />,
      disableSortBy: true,
      accessor: 'status_id',
      Cell: ({ value }: { value: number }) => {
        return <ChipStatus id={value} successLabel="active" errorLabel="inactive" />;
      }
    },
    {
      align: 'center',
      sticky: 'right',
      width: 100,
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<{}> }) => (
        <ColumnActions
          canWrite={canWrite}
          row={row}
          handleAdd={handleAdd}
          handleClose={handleClose}
          setRecord={setRecord}
          setRecordDelete={setRecordDelete}
          setViewRecord={onViewClick}
        />
      ),
      id: 'actions'
    }
  ];
};
