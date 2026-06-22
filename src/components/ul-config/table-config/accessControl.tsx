
import { FormattedMessage } from 'react-intl';
import { Row } from 'react-table';
import { AccessControlType, AccessPolicy } from 'types/access-control';
import ColumnActions from './column-action-status/column-action';

interface AccessControlCols {
  currentPage: number;
  pageSize: number;
  handleAdd: () => void;
  handleClose: () => void;
  setRecordDelete: (record: AccessPolicy) => void;
  canWrite?: boolean;
}

export const renderAccessControlInfo = (accessPolicy: AccessPolicy) => {
  switch (accessPolicy.type) {
    case AccessControlType.IpRange:
      return `${accessPolicy.ip} / ${accessPolicy.subnet_mask}`;
    case AccessControlType.Url:
      return accessPolicy.url;
    case AccessControlType.ClientIp:
      return accessPolicy.client_ip;
    case AccessControlType.ClientMac:
      return accessPolicy.client_mac;

    default:
      break;
  }
};

export const getColumnsAccess = (params: AccessControlCols) => [
  {
    width: 50,
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
    Header: <FormattedMessage id="type" />,
    accessor: 'type',
    className: 'w-[400px]',
    disableSortBy: true,
    Cell: ({ row }: { row: Row<AccessPolicy> }) => { }
  },
  {
    Header: <FormattedMessage id="info" />,
    accessor: 'information',
    disableSortBy: true,
    Cell: ({ row }: { row: Row<AccessPolicy> }) => {
      return <div>{renderAccessControlInfo(row.original)}</div>;
    }
  },

  {
    width: 50,
    align: 'center',
    Header: ' ',
    className: 'cell-center',
    disableSortBy: true,
    Cell: ({ row }: { row: Row }) => (
      <ColumnActions
        canWrite={params.canWrite}
        row={row}
        handleAdd={params.handleAdd}
        handleClose={params.handleClose}
        setRecordDelete={params.setRecordDelete}
        isHiddenView
      />
    )
  }
];

export const getColumnsFree = (params: AccessControlCols) => [
  {
    Header: <FormattedMessage id="no." />,
    disableSortBy: true,
    accessor: 'index',
    className: 'cell-center',
    Cell: ({ row }: { row: Row }) => {
      const rowNumber = (params.currentPage - 1) * params.pageSize + row.index + 1;
      return <div>{rowNumber}</div>;
    }
  },
  {
    Header: <FormattedMessage id="type" />,
    accessor: 'type',
    className: 'w-[400px]',
    disableSortBy: true,
    Cell: ({ row }: { row: Row<AccessPolicy> }) => {
    }
  },
  {
    Header: <FormattedMessage id="info" />,
    accessor: 'information',
    disableSortBy: true,
    Cell: ({ row }: { row: Row<AccessPolicy> }) => {
      return <div>{renderAccessControlInfo(row.original)}</div>;
    }
  },

  {
    Header: ' ',
    className: 'cell-center w-[50px]',
    disableSortBy: true,
    Cell: ({ row }: { row: Row }) => (
      <ColumnActions
        canWrite={params.canWrite}
        row={row}
        handleAdd={params.handleAdd}
        handleClose={params.handleClose}
        setRecordDelete={params.setRecordDelete}
        isHiddenView
      />
    )
  }
];
