import { Row } from 'react-table';

import { FormattedMessage } from 'react-intl';
import ColumnActions from './column-action-status/column-action';
import ChipStatus from 'shared/components/atoms/ChipStatus';

export const columnsProduct = (
  currentPage: number,
  pageSize: number,
  handleAdd: () => void,
  handleClose: () => void,
  setRecord: (record: any) => void,
  setRecordDelete: (record: any) => void,
  onViewClick: (record: any) => void
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
      Header: <FormattedMessage id="plan-name" />,
      disableSortBy: true,
      accessor: 'title'
    },
    {
      Header: <FormattedMessage id="data-total" />,
      disableSortBy: true,
      accessor: 'data_total',
      className: 'cell-right',
      Cell: ({ value }: { value?: number }) => {
        if (typeof value === 'number') {
          return <span>{value} MB</span>;
        }
        return <span>--</span>;
      }
    },
    {
      Header: <FormattedMessage id="access-time" />,
      disableSortBy: true,
      accessor: 'total_time',
      className: 'cell-right',
      Cell: ({ value }: { value?: number }) => {
        if (typeof value === 'number') {
          return (
            <span>
              {value} <FormattedMessage id="minutes" />
            </span>
          );
        }
        return <span>--</span>;
      }
    },
    {
      Header: <FormattedMessage id="bandwidth-upload" />,
      disableSortBy: true,
      accessor: 'bandwidth_upload',
      className: 'cell-right',
      Cell: ({ value }: { value?: number }) => {
        if (typeof value === 'number') {
          return <span>{value} Mbps</span>;
        }
        return <span>--</span>;
      }
    },
    {
      Header: <FormattedMessage id="bandwidth-download" />,
      disableSortBy: true,
      accessor: 'bandwidth_download',
      className: 'cell-right',
      Cell: ({ value }: { value?: number }) => {
        if (typeof value === 'number') {
          return <span>{value} Mbps</span>;
        }
        return <span>--</span>;
      }
    },
    {
      Header: <FormattedMessage id="data-upload" />,
      disableSortBy: true,
      accessor: 'data_upload',
      className: 'hidden',
      Cell: ({ value }: { value?: number }) => {
        if (typeof value === 'number') {
          return <span>{value} MB</span>;
        }
        return <span>--</span>;
      }
    },
    {
      Header: <FormattedMessage id="data-download" />,
      disableSortBy: true,
      accessor: 'data_download',
      className: 'hidden',
      Cell: ({ value }: { value?: number }) => {
        if (typeof value === 'number') {
          return <span>{value} MB</span>;
        }
        return <span>--</span>;
      }
    },
    {
      Header: <FormattedMessage id="original-price" />,
      disableSortBy: true,
      accessor: 'price.original_price',
      className: 'cell-right',
      Cell: ({ value }: { value?: number }) => {
        // Check if 'value' is not undefined and is a number before attempting to format it
        if (typeof value === 'number') {
          return <span>{value.toLocaleString('vi-VN')} VND</span>; // Using 'vi-VN' to ensure Vietnamese currency formatting
        }
        return <span>--</span>; // Return a placeholder or some default UI if the value is undefined
      }
    },
    {
      Header: <FormattedMessage id="new-price" />,
      disableSortBy: true,
      accessor: 'price.new_price',
      className: 'cell-right',
      Cell: ({ value }: { value?: number }) => {
        // Check if 'value' is not undefined and is a number before attempting to format it
        if (typeof value === 'number') {
          return <span>{value.toLocaleString('vi-VN')} VND</span>; // Using 'vi-VN' to ensure Vietnamese currency formatting
        }
        return <span>--</span>; // Return a placeholder or some default UI if the value is undefined
      }
    },
    {
      Header: <FormattedMessage id="desc" />,
      disableSortBy: true,
      accessor: 'description',
      className: 'hidden'
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
      Header: <FormattedMessage id="units-sold" />,
      disableSortBy: true,
      accessor: 'product_sold'
    },
    {
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<{}> }) => (
        <ColumnActions
          setViewRecord={onViewClick}
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
