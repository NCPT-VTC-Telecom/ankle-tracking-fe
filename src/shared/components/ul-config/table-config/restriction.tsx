//third-party
import { Row } from 'react-table';
//project component
import { FormattedMessage } from 'react-intl';
import ColumnActions from './column-action-status/column-action';
// import ChipStatus from 'shared/components/atoms/ChipStatus';
import { BlackListDeviceData, BlackListDomainData } from 'shared/types';
import { useState } from 'react';

interface RestrictionDeviceCols {
  currentPage: number;
  pageSize: number;
  handleAdd: () => void;
  handleClose: () => void;
  setRecord?: (record: BlackListDeviceData) => void;
  setRecordDelete?: (record: BlackListDeviceData) => void;
  hiddenView?: boolean;
  hiddenEdit?: boolean;
  hiddenDelete?: boolean;
  canWrite?: boolean;
}

export const columnsRestrictionDevices = (params: RestrictionDeviceCols) => {
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
        const rowNumber = (params.currentPage - 1) * params.pageSize + row.index + 1;
        return <div className="font-semibold">#{rowNumber}</div>;
      }
    },
    {
      Header: <FormattedMessage id="device-name" />,
      disableSortBy: true,
      accessor: 'device_name'
    },
    {
      Header: <FormattedMessage id="ip-address" />,
      disableSortBy: true,
      accessor: 'ip_address',
      className: 'min-w-24'
    },
    {
      Header: <FormattedMessage id="ipv6-address" />,
      disableSortBy: true,
      accessor: 'ipv6_address'
    },
    {
      Header: <FormattedMessage id="mac-address" />,
      disableSortBy: true,
      accessor: 'mac_address',
      Cell: ({ value }: { value: string }) => {
        // Sử dụng state để theo dõi trạng thái hiển thị
        const [isRevealed, setIsRevealed] = useState(false);
        const [isHovered, setIsHovered] = useState(false);

        // Xử lý khi hover
        const handleMouseEnter = () => {
          setIsHovered(true);
        };

        const handleMouseLeave = () => {
          setIsHovered(false);
        };

        // Xử lý khi click
        const handleClick = () => {
          setIsRevealed((prev) => !prev);
        };

        // Hiển thị giá trị dựa trên trạng thái
        const displayValue = isRevealed || isHovered ? value : '***********';

        return (
          <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick} style={{ cursor: 'pointer' }}>
            {displayValue}
          </div>
        );
      }
    },
    {
      Header: <FormattedMessage id="restriction-reason" />,
      disableSortBy: true,
      accessor: 'reason'
    },
    {
      Header: <FormattedMessage id="restriction-date" />,
      disableSortBy: true,
      accessor: 'created_date'
    },
    {
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<{}> }) => (
        <ColumnActions
          canWrite={params.canWrite}
          isHiddenView={params.hiddenView}
          row={row}
          handleAdd={params.handleAdd}
          handleClose={params.handleClose}
          setRecord={params.setRecord}
          setRecordDelete={params.setRecordDelete}
        />
      )
    }
  ];
};

interface RestrictionDomainCols {
  currentPage: number;
  pageSize: number;
  handleAdd: () => void;
  handleClose: () => void;
  setRecord: (record: BlackListDomainData) => void;
  setRecordDelete: (record: BlackListDomainData) => void;
  isHiddenView?: boolean;
  isHiddenEdit?: boolean;
  isHiddenDelete?: boolean;
}

export const columnsRestrictionDomain = (params: RestrictionDomainCols) => {
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
        const rowNumber = (params.currentPage - 1) * params.pageSize + row.index + 1;
        return <div>{rowNumber}</div>;
      }
    },
    {
      Header: <FormattedMessage id="domain-name" />,
      disableSortBy: true,
      accessor: 'url',
      className: 'min-w-28'
    },
    {
      Header: <FormattedMessage id="categories" />,
      disableSortBy: true,
      accessor: 'category.name'
    },
    // {
    //   Header: <FormattedMessage id="ip-destination" />,
    //   disableSortBy: true,
    //   accessor: 'ip_address',
    //   className: 'min-w-28'
    // },
    // {
    //   Header: <FormattedMessage id="ipv6-address" />,
    //   disableSortBy: true,
    //   accessor: 'ipv6_address'
    // },
    // {
    //   Header: <FormattedMessage id="dns-address" />,
    //   disableSortBy: true,
    //   accessor: 'dns_address'
    // },
    {
      Header: <FormattedMessage id="restriction-reason" />,
      disableSortBy: true,
      accessor: 'reason'
    },
    {
      Header: <FormattedMessage id="restriction-date" />,
      disableSortBy: true,
      accessor: 'created_date'
    },
    {
      Header: <FormattedMessage id="status" />,
      disableSortBy: true,
      accessor: 'status_id',
      className: 'cell-center'
      // Cell: ({ value }: { value: number }) => <ChipStatus id={value} successLabel="active" errorLabel="inactive" />
    },
    {
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<{}> }) => (
        <ColumnActions
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
