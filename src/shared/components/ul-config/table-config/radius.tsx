import { FormattedMessage } from 'react-intl';

//third-party
import { Row } from 'react-table';

//project-import
import ColumnActions from './column-action-status/column-action';

//types
import { DataRadius } from 'shared/types';
import ChipStatus from 'shared/components/atoms/ChipStatus';
// import ChipStatus from 'shared/components/atoms/ChipStatus';

interface RadiusCols {
  currentPage: number;
  pageSize: number;
  handleAdd: () => void;
  handleClose: () => void;
  setRecord?: (record: DataRadius) => void;
  setRecordDelete?: (record: DataRadius) => void;
  onViewClick?: (record: DataRadius) => void;
  isHiddenView?: boolean;
  isHiddenEdit?: boolean;
  isHiddenDelete?: boolean;
  canWrite?: boolean;
}

export const columnsRadius = (params: RadiusCols) => {
  return [
    {
      align: 'center',
      width: 50,
      sticky: 'left',
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
      Header: <FormattedMessage id="name-server" />,
      disableSortBy: true,
      accessor: 'name'
    },
    {
      Header: <FormattedMessage id="ip-auth" />,
      disableSortBy: true,
      accessor: 'ip_auth'
    },
    {
      Header: <FormattedMessage id="port-auth" />,
      disableSortBy: true,
      accessor: 'port_auth'
    },
    {
      Header: <FormattedMessage id="ip-acct" />,
      disableSortBy: true,
      accessor: 'ip_acct'
    },
    {
      Header: <FormattedMessage id="port-acct" />,
      disableSortBy: true,
      accessor: 'port_acct'
    },
    {
      Header: <FormattedMessage id="update-interval-period" />,
      disableSortBy: true,
      accessor: 'update_interval_period'
    },
    {
      Header: <FormattedMessage id="site" />,
      disableSortBy: true,
      accessor: 'site.name'
    },
    {
      align: 'center',
      width: 100,
      Header: <FormattedMessage id="status" />,
      disableSortBy: true,
      accessor: 'status_id',
      Cell: ({ value }: { value: number }) => {
        return <ChipStatus id={value} successLabel="active" errorLabel="inactive" />;
      }
    },
    {
      align: 'center',
      width: 80,
      sticky: 'right',
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<{}> }) => (
        <ColumnActions
          canWrite={params.canWrite}
          setViewRecord={params.onViewClick}
          row={row}
          handleAdd={params.handleAdd}
          handleClose={params.handleClose}
          setRecord={params.setRecord}
          setRecordDelete={params.setRecordDelete}
          isHiddenView={params.isHiddenView}
          isHiddenEdit={params.isHiddenEdit}
          isHiddenDelete={params.isHiddenDelete}
        />
      )
    }
  ];
};
