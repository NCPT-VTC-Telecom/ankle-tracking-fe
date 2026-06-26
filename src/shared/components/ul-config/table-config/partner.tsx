import { FormattedMessage } from 'react-intl';

//third-party
import { Row } from 'react-table';

//project component
import ColumnActions from './column-action-status/column-action';

//types
import { PartnerData } from 'shared/types';
import ChipStatus from 'shared/components/atoms/ChipStatus';

export const columnsPartner = (
  currentPage: number,
  pageSize: number,
  handleAdd: () => void,
  handleClose: () => void,
  setRecord: (record: PartnerData) => void,
  setRecordDelete: (record: PartnerData) => void,
  canWrite?: boolean
) => {
  return [
    // {
    //   Header: '#',
    //   disableSortBy: true,
    //   accessor: 'id',
    //   className: 'hidden'
    // },
    {
      sticky: 'left',
      width: 50,
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
      Header: <FormattedMessage id="name-partner" />,
      disableSortBy: true,
      accessor: 'name'
    },
    {
      Header: <FormattedMessage id="address" />,
      disableSortBy: true,
      accessor: 'address',
      Cell: ({ row }: { row: Row<PartnerData> }) => (
        <span className="line-clamp-2 max-w-[300px] text-ellipsis">{row.original.address || 'Chưa cập nhật'}</span>
      )
    },
    {
      Header: <FormattedMessage id="country" />,
      disableSortBy: true,
      accessor: 'country'
    },
    {
      Header: <FormattedMessage id="contact" />,
      disableSortBy: true,
      accessor: 'phone_number'
    },

    {
      Header: <FormattedMessage id="start-date" />,
      disableSortBy: true,
      accessor: 'from_date'
    },
    {
      Header: <FormattedMessage id="end-date" />,
      disableSortBy: true,
      accessor: 'expired_date'
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
      Cell: ({ value }: { value: number }) => {
        return <ChipStatus id={value} successLabel="active" errorLabel="inactive" />;
      }
    },
    {
      sticky: 'right',
      width: 120,
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<{}> }) => (
        <ColumnActions
          row={row}
          handleAdd={handleAdd}
          handleClose={handleClose}
          setRecord={setRecord}
          setRecordDelete={setRecordDelete}
          canWrite={canWrite}
          // setViewRecord={setViewRecord}
        />
      )
    }
  ];
};

export const columnsDeviceProvider = (
  currentPage: number,
  pageSize: number,
  handleAdd: () => void,
  handleClose: () => void,
  setRecord: (record: PartnerData) => void,
  setRecordDelete: (record: PartnerData) => void,
  canWrite?: boolean
) => {
  return [
    {
      width: 70,
      align: 'center',
      sticky: 'left',
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
      Header: <FormattedMessage id="name-partner" />,
      disableSortBy: true,
      accessor: 'name'
    },
    {
      Header: <FormattedMessage id="address" />,
      disableSortBy: true,
      accessor: 'address',
      Cell: ({ row }: { row: Row<PartnerData> }) => (
        <span className="line-clamp-2 max-w-[300px] text-ellipsis">{row.original.address || 'Chưa cập nhật'}</span>
      )
    },
    {
      Header: <FormattedMessage id="country" />,
      disableSortBy: true,
      accessor: 'country'
    },
    {
      Header: <FormattedMessage id="contact" />,
      disableSortBy: true,
      accessor: 'phone_number'
    },

    {
      Header: <FormattedMessage id="desc" />,
      disableSortBy: true,
      accessor: 'description'
    },
    {
      width: 100,
      align: 'center',
      Header: <FormattedMessage id="status" />,
      disableSortBy: true,
      accessor: 'status_id',
      className: 'cell-center',
      Cell: ({ value }: { value: number }) => {
        return <ChipStatus id={value} successLabel="active" errorLabel="inactive" />;
      }
    },
    {
      width: 100,
      align: 'center',
      sticky: 'right',
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<PartnerData> }) => (
        <ColumnActions
          canWrite={canWrite}
          row={row}
          handleAdd={handleAdd}
          handleClose={handleClose}
          setRecord={setRecord}
          setRecordDelete={setRecordDelete}
          isHiddenDelete={row.original.name === 'Ruckus'}
          // setViewRecord={setViewRecord}
        />
      )
    }
  ];
};
