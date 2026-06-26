import { FormattedMessage } from 'react-intl';

//third-party
import { Row } from 'react-table';

//project-import
import ColumnActions from './column-action-status/column-action';

//utils
import ChipStatus from 'shared/components/atoms/ChipStatus';

//types
import { IconButton, Tooltip } from '@mui/material';
import IconPower from 'shared/components/atoms/icon/power';
import { WifiSquare } from 'iconsax-react';
import { MouseEvent, useState } from 'react';
import { DataDevice } from 'shared/types';

interface ColDeviceInterface {
  currentPage: number;
  pageSize: number;
  handleAdd: () => void;
  handleClose: () => void;
  setRecord?: (record: DataDevice) => void;
  setRecordDelete?: (record: DataDevice) => void;
  handleReboot?: (record: any) => void;
  handleCheckConnection?: (record: any) => void;
  onViewClick?: (record: DataDevice) => void;
  hiddenView?: boolean;
  hiddenEdit?: boolean;
  hiddenDelete?: boolean;
  hiddenReboot?: boolean;
  hiddenCheckConnection?: boolean;
  canWrite?: boolean;
}

interface ColDeviceOverviewInterface {
  currentPage: number;
  pageSize: number;
  setRecord?: (record: DataDevice) => void;
}

export const columnsDeviceOverview = (params: ColDeviceOverviewInterface) => {
  return [
    // {
    //   Header: <FormattedMessage id="device-id" />,
    //   disableSortBy: true,
    //   accessor: 'id_device',
    //   className: 'hidden'
    // },
    {
      align: 'center',
      width: 70,
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
      Header: <FormattedMessage id="device-name" />,
      disableSortBy: true,
      accessor: 'name'
    },
    {
      Header: <FormattedMessage id="latitude" />,
      disableSortBy: true,
      accessor: 'device_lat'
    },
    {
      Header: <FormattedMessage id="longitude" />,
      disableSortBy: true,
      accessor: 'device_lng'
    },
    {
      Header: <FormattedMessage id="ip-address" />,
      disableSortBy: true,
      accessor: 'ip_address'
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
        const displayValue = isRevealed || isHovered ? value : '*****************';

        return (
          <div
            className="min-w-[150px]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
          >
            {displayValue}
          </div>
        );
      }
    },
    {
      align: 'center',
      width: 100,
      Header: <FormattedMessage id="status" />,
      disableSortBy: true,
      accessor: 'status_id',
      className: 'cell-center',
      Cell: ({ value }: { value: number }) => (
        <ChipStatus
          id={value}
          successLabel="connected"
          errorLabel="disconnected"
          warningLabel="pending"
          dangerLabel="hearbeat_missed"
          isolatedLabel="isolated"
        />
      )
    }
  ];
};

export const columnsDevice = (params: ColDeviceInterface) => {
  return [
    // {
    //   Header: <FormattedMessage id="device-id" />,
    //   disableSortBy: true,
    //   accessor: 'id_device',
    //   className: 'hidden'
    // },
    {
      width: 70,
      align: 'center',
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
      Header: <FormattedMessage id="device-name" />,
      disableSortBy: true,
      accessor: 'name'
    },
    {
      Header: <FormattedMessage id="latitude" />,
      disableSortBy: true,
      accessor: 'device_lat'
    },
    {
      Header: <FormattedMessage id="longitude" />,
      disableSortBy: true,
      accessor: 'device_lng'
    },
    // {
    //   Header: <FormattedMessage id="model" />,
    //   disableSortBy: true,
    //   accessor: 'model',
    //   className: 'hidden'
    // },
    {
      Header: <FormattedMessage id="ip-address" />,
      disableSortBy: true,
      accessor: 'ip_address'
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
        const displayValue = isRevealed || isHovered ? value : '*****************';

        return (
          <div
            className="min-w-[150px]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
          >
            {displayValue}
          </div>
        );
      }
    },
    {
      width: 70,
      Header: <FormattedMessage id="type" />,
      disableSortBy: true,
      accessor: 'type'
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
      Cell: ({ value }: { value: number }) => (
        <ChipStatus
          id={value}
          successLabel="connected"
          errorLabel="disconnected"
          warningLabel="pending"
          dangerLabel="hearbeat_missed"
          isolatedLabel="isolated"
        />
      )
    },
    {
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
          isHiddenView={params.hiddenView}
          isHiddenEdit={params.hiddenEdit}
          isHiddenDelete={params.hiddenDelete}
          children={
            !params.hiddenReboot && (
              <Tooltip
                componentsProps={{
                  tooltip: {
                    sx: {
                      opacity: 0.9
                    }
                  }
                }}
                title={<FormattedMessage id="reboot" />}
              >
                <span>
                  <IconButton
                    disabled={!params.canWrite}
                    color="secondary"
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      params?.handleReboot?.(row.original);
                      params.handleClose();
                    }}
                  >
                    {<IconPower className="!size-4" fill="#5B6B79" />}
                  </IconButton>
                </span>
              </Tooltip>
            )
          }
        />
      )
    }
  ];
};

export const columnsDeviceController = (params: ColDeviceInterface) => {
  return [
    {
      align: 'center',
      width: 70,
      sticky: 'left',
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
      Header: <FormattedMessage id="device-name" />,
      disableSortBy: true,
      accessor: 'name'
    },
    {
      Header: <FormattedMessage id="model" />,
      disableSortBy: true,
      accessor: 'model',
      className: 'hidden'
    },
    {
      Header: <FormattedMessage id="firmware" />,
      disableSortBy: true,
      accessor: 'firmware'
    },
    {
      Header: <FormattedMessage id="ip-address" />,
      disableSortBy: true,
      accessor: 'ip_address'
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
      Header: <FormattedMessage id="manufacturer-date" />,
      disableSortBy: true,
      accessor: 'manufacturer_date'
    },
    {
      Header: <FormattedMessage id="desc" />,
      disableSortBy: true,
      accessor: 'description'
    },
    {
      align: 'center',
      width: 120,
      Header: <FormattedMessage id="status" />,
      disableSortBy: true,
      accessor: 'status_id',
      className: 'cell-center',
      Cell: ({ value }: { value: number }) => (
        <ChipStatus
          id={value}
          successLabel="connected"
          errorLabel="disconnected"
          warningLabel="pending"
          dangerLabel="hearbeat_missed"
          isolatedLabel="isolated"
        />
      )
    },
    {
      align: 'center',
      width: 120,
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
          isHiddenView={params.hiddenView}
          isHiddenEdit={params.hiddenEdit}
          isHiddenDelete={params.hiddenDelete}
          children={
            <>
              {/* Nút Kiểm tra kết nối */}
              {!params.hiddenCheckConnection && (
                <Tooltip
                  componentsProps={{
                    tooltip: {
                      sx: {
                        opacity: 0.9
                      }
                    }
                  }}
                  title={<FormattedMessage id="check-connection" />}
                >
                  <span>
                    <IconButton
                      color="info"
                      onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        params?.handleCheckConnection?.(row.original);
                        params.handleClose();
                      }}
                    >
                      <WifiSquare size="16" color="#5B6B79" />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {!params.hiddenReboot && (
                <Tooltip
                  componentsProps={{
                    tooltip: {
                      sx: {
                        opacity: 0.9
                      }
                    }
                  }}
                  title={<FormattedMessage id="reboot" />}
                >
                  <span>
                    <IconButton
                      color="secondary"
                      onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        params?.handleReboot?.(row.original);
                        params.handleClose();
                      }}
                    >
                      {<IconPower className="!size-4" fill="#5B6B79" />}
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </>
          }
        />
      )
    }
  ];
};
