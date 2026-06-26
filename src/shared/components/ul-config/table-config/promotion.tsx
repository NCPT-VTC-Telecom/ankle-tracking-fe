//third-party
import { Row } from 'react-table';

//project component
import { FormattedMessage } from 'react-intl';
import ColumnActions from './column-action-status/column-action';
import ChipStatus from 'shared/components/atoms/ChipStatus';

export const columnsVoucherRedeemed = (
  currentPage: number,
  pageSize: number,
  handleAdd: () => void,
  handleClose: () => void,
  setRecord?: (record: any) => void,
  setRecordDelete?: (record: any) => void,
  hiddenView?: boolean
) => {
  return [
    {
      Header: '#',
      disableSortBy: true,
      accessor: 'id',
      className: 'hidden'
    },
    {
      Header: <FormattedMessage id="no." />,
      disableSortBy: true,
      accessor: 'index',
      className: 'cell-center',
      Cell: ({ row }: { row: Row }) => {
        const rowNumber = (currentPage - 1) * pageSize + row.index + 1;
        return <div>{rowNumber}</div>;
      }
    },
    {
      Header: <FormattedMessage id="code" />,
      disableSortBy: true,
      accessor: 'voucher_code'
    },
    {
      Header: <FormattedMessage id="package-attached" />,
      disableSortBy: true,
      accessor: 'product.title'
    },
    {
      Header: <FormattedMessage id="start-date" />,
      disableSortBy: true,
      accessor: 'from_date'
    },
    {
      Header: <FormattedMessage id="end-date" />,
      disableSortBy: true,
      accessor: 'end_date'
    },
    {
      Header: <FormattedMessage id="status-active" />,
      disableSortBy: true,
      accessor: 'status_id',
      className: 'cell-center',
      Cell: ({ value }: { value: number }) => <ChipStatus id={value} successLabel="active" errorLabel="inactive" />
    },
    {
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<{}> }) => (
        <ColumnActions
          isHiddenView={hiddenView}
          row={row}
          handleAdd={handleAdd}
          handleClose={handleClose}
          setRecord={setRecord}
          setRecordDelete={setRecordDelete}
        />
      )
    }
  ];
};

export const columnsVoucherDiscount = (
  currentPage: number,
  pageSize: number,
  handleAdd: () => void,
  handleClose: () => void,
  setRecord?: (record: any) => void,
  setRecordDelete?: (record: any) => void,
  hiddenView?: boolean
) => {
  return [
    {
      Header: '#',
      disableSortBy: true,
      accessor: 'id',
      className: 'hidden'
    },
    {
      Header: <FormattedMessage id="no." />,
      disableSortBy: true,
      accessor: 'index',
      className: 'cell-center',
      Cell: ({ row }: { row: Row }) => {
        const rowNumber = (currentPage - 1) * pageSize + row.index + 1;
        return <div>{rowNumber}</div>;
      }
    },
    {
      Header: <FormattedMessage id="name-voucher" />,
      disableSortBy: true,
      accessor: 'name'
    },
    {
      Header: <FormattedMessage id="code" />,
      disableSortBy: true,
      accessor: 'code'
    },
    {
      Header: <FormattedMessage id="discount-type" />,
      disableSortBy: true,
      accessor: 'type',
      Cell: ({ value }: { value: string }) =>
        value === 'cash' ? <FormattedMessage id="direct-discount" /> : <FormattedMessage id="percentage-discount" />
    },
    {
      Header: <FormattedMessage id="discount-minimal" />,
      disableSortBy: true,
      accessor: 'minimal',
      className: 'cell-right'
    },
    {
      Header: <FormattedMessage id="discount-maximal" />,
      disableSortBy: true,
      accessor: 'maximal',
      className: 'cell-right'
    },
    {
      Header: <FormattedMessage id="date-start" />,
      disableSortBy: true,
      accessor: 'date_from'
    },
    {
      Header: <FormattedMessage id="date-end" />,
      disableSortBy: true,
      accessor: 'date_end'
    },
    {
      Header: <FormattedMessage id="status-active" />,
      disableSortBy: true,
      accessor: 'status_id',
      className: 'cell-center',
      Cell: ({ value }: { value: number }) => <ChipStatus id={value} successLabel="active" errorLabel="inactive" />
    },
    {
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<{}> }) => (
        <ColumnActions
          isHiddenView={hiddenView}
          row={row}
          handleAdd={handleAdd}
          handleClose={handleClose}
          setRecord={setRecord}
          setRecordDelete={setRecordDelete}
        />
      )
    }
  ];
};

export const columnsCampaign = (
  currentPage: number,
  pageSize: number,
  handleAdd: () => void,
  handleClose: () => void,
  setRecord?: (record: any) => void,
  setRecordDelete?: (record: any) => void,
  hiddenView?: boolean
) => {
  return [
    {
      Header: '#',
      disableSortBy: true,
      accessor: 'id',
      className: 'hidden'
    },
    {
      Header: <FormattedMessage id="no." />,
      disableSortBy: true,
      accessor: 'index',
      className: 'cell-center',
      Cell: ({ row }: { row: Row }) => {
        const rowNumber = (currentPage - 1) * pageSize + row.index + 1;
        return <div>{rowNumber}</div>;
      }
    },
    {
      Header: <FormattedMessage id="name-campaign" />,
      disableSortBy: true,
      accessor: 'name'
    },
    {
      Header: <FormattedMessage id="budget" />,
      disableSortBy: true,
      accessor: 'budget',
      Cell: ({ value }: { value: number }) => {
        return <span>{value.toLocaleString('vi-VN') || 0} VND</span>;
      }
    },
    {
      Header: <FormattedMessage id="start-date" />,
      disableSortBy: true,
      accessor: 'start_date'
    },
    {
      Header: <FormattedMessage id="end-date" />,
      disableSortBy: true,
      accessor: 'end_date'
    },
    {
      Header: <FormattedMessage id="desc" />,
      disableSortBy: true,
      accessor: 'description'
    },
    {
      Header: <FormattedMessage id="status" />,
      disableSortBy: true,
      accessor: 'status_id',
      className: 'cell-center',
      Cell: ({ value }: { value: number }) => <ChipStatus id={value} successLabel="active" errorLabel="inactive" />
    },
    {
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<{}> }) => (
        <ColumnActions
          isHiddenView={hiddenView}
          row={row}
          handleAdd={handleAdd}
          handleClose={handleClose}
          setRecord={setRecord}
          setRecordDelete={setRecordDelete}
        />
      )
    }
  ];
};
