import { FormattedMessage } from 'react-intl';

//third-party
import { Row } from 'react-table';

//project-import
import ColumnActions from './column-action-status/column-action';

//types
import { DataSites } from 'shared/types';
import ChipStatus from 'shared/components/atoms/ChipStatus';
import { Location } from 'iconsax-react';

export const columnsSite = (
  currentPage: number,
  pageSize: number,
  handleAdd: () => void,
  handleClose: () => void,
  setRecord?: (record: DataSites) => void,
  setRecordDelete?: (record: DataSites) => void,
  onViewClick?: (record: DataSites) => void,
  canWrite?: boolean
) => {
  return [
    {
      sticky: 'left',
      width: 50,
      align: 'center',
      Header: <FormattedMessage id="no." />,
      disableSortBy: true,
      accessor: 'index',
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
      Header: <FormattedMessage id="region" />,
      disableSortBy: true,
      accessor: 'region.name'
    },
    {
      Header: <FormattedMessage id="address" />,
      disableSortBy: true,
      accessor: 'address',
      Cell: ({ row }: { row: Row<DataSites> }) => (
        <span className="line-clamp-2 max-w-[300px] text-ellipsis">{row.original.address || 'Chưa cập nhật'}</span>
      )
    },
    {
      Header: <FormattedMessage id="country" />,
      disableSortBy: true,
      accessor: 'country'
    },

    // {
    //   Header: <FormattedMessage id="latitude" />,
    //   disableSortBy: true,
    //   accessor: 'lat_location'
    // },
    // {
    //   Header: <FormattedMessage id="longitude" />,
    //   disableSortBy: true,
    //   accessor: 'long_location'
    // },
    {
      Header: <FormattedMessage id="location" />,
      disableSortBy: true,
      accessor: 'location',
      Cell: ({ row }: { row: Row<DataSites> }) => (
        <>
          {row.original.lat_location && row.original.long_location ? (
            <div className="flex items-center gap-2">
              <Location size={18} className="text-red-500" variant="Bold" />
              <span>
                {row.original.lat_location}, {row.original.long_location}
              </span>
            </div>
          ) : (
            'Chưa cập nhật'
          )}
        </>
      )
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
      sticky: 'right',
      width: 80,
      align: 'center',
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<{}> }) => (
        <ColumnActions
          canWrite={canWrite}
          setViewRecord={onViewClick}
          row={row}
          handleAdd={handleAdd}
          handleClose={handleClose}
          setRecord={setRecord}
          setRecordDelete={setRecordDelete}
          isHiddenView
        />
      )
    }
  ];
};
