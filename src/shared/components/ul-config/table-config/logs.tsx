import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import ChipStatus from 'shared/components/atoms/ChipStatus';
import dayjs from 'dayjs';
import { Activity, ArrowDown2, ArrowUp, ArrowUp2, Data, Login, Monitor, Setting2 } from 'iconsax-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

//third-party
import { Row } from 'react-table';
import { Log } from 'shared/types/log';

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case 'config_ad':
      return <Setting2 size="16" color="#3B82F6" />;
    case 'submit_access':
      return <Login size="16" color="#10B981" />;
    case 'login_activities':
      return <Activity size="16" color="#F59E0B" />;
    default:
      return <Monitor size="16" color="#6B7280" />;
  }
};

const getStatusFromResponse = (responseContent: string) => {
  try {
    const parsed = JSON.parse(responseContent);
    const status = parsed.status || parsed.response?.code;

    if (status >= 200 && status < 300) {
      return { label: 'Success', color: 'success' as const };
    } else if (status >= 400 && status < 500) {
      return { label: 'Warning', color: 'warning' as const };
    } else if (status >= 500) {
      return { label: 'Error', color: 'error' as const };
    }
    return { label: 'Unknown', color: 'default' as const };
  } catch {
    return { label: 'Unknown', color: 'default' as const };
  }
};

export const columnsLogSoftware = (currentPage: number, pageSize: number) => {
  return [
    {
      sticky: 'left',
      width: 70,
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
      Header: <FormattedMessage id="ip-address" />,
      disableSortBy: true,
      accessor: 'ipaddress',
      className: 'max-w-[150px]',
      Cell: ({ row }: { row: Row<Log> }) => (
        <Box>
          <Typography variant="body2" fontFamily="monospace" fontWeight="bold">
            {row.original.ipaddress}
          </Typography>
        </Box>
      )
    },
    {
      Header: <FormattedMessage id="type" />,
      disableSortBy: true,
      accessor: 'action_type',
      className: 'max-w-[150px]',
      Cell: ({ row }: { row: Row<Log> }) => (
        <Box display="flex" alignItems="center" gap={1}>
          {getActionIcon(row.original.action_type)}
          <Typography variant="body2" fontWeight="medium">
            {row.original.action_type}
          </Typography>
        </Box>
      )
    },
    {
      Header: <FormattedMessage id="table" />,
      disableSortBy: true,
      accessor: 'table_name',
      className: 'max-w-[120px]',
      Cell: ({ row }: { row: Row<Log> }) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Data size="16" color="#6B7280" />
          <Typography variant="body2">{row.original?.table_name}</Typography>
        </Box>
      )
    },
    {
      Header: <FormattedMessage id="status" />,
      disableSortBy: true,
      accessor: 'response_content',
      className: 'max-w-[120px]',
      Cell: ({ row }: { row: Row<Log> }) => {
        const status = getStatusFromResponse(row.original.response_content);
        return <Chip label={status.label} color={status.color} size="small" variant="outlined" />;
      }
    },
    {
      Header: <FormattedMessage id="time" />,
      disableSortBy: true,
      accessor: 'action_time',
      className: 'max-w-[180px]',
      Cell: ({ row }: { row: Row<Log> }) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2">{dayjs(row.original.created_date).format('DD/MM/YYYY HH:mm:ss')}</Typography>
        </Box>
      )
    },
    {
      width: 50,
      align: 'center',
      Header: '',
      disableSortBy: true,
      accessor: 'actions',
      className: 'max-w-[50px] cell-center',
      Cell: ({ row }: { row: Row<Log> }) => (
        <Tooltip title={<FormattedMessage id="view-details" />}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              row.toggleRowExpanded();
            }}
          >
            {row.isExpanded ? <ArrowUp2 size="16" /> : <ArrowDown2 size="16" />}
          </IconButton>
        </Tooltip>
      )
    }
  ];
};

export const columnsLogHardware = (currentPage: number, pageSize: number, type: 'alert' | 'event') => {
  const contentKey = type === 'alert' ? 'content_alert_hardware' : 'content_event_hardware';
  const timeKey = type === 'alert' ? 'time_alert_hardware' : 'time_event_hardware';

  return [
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
      Header: <FormattedMessage id="type" />,
      disableSortBy: true,
      accessor: 'type'
    },
    {
      Header: <FormattedMessage id="content" />,
      disableSortBy: true,
      accessor: contentKey
    },
    {
      Header: <FormattedMessage id="time" />,
      disableSortBy: true,
      accessor: timeKey
    }
  ];
};

export const columnsNetworkTraffic = (currentPage: number, pageSize: number) => {
  return [
    {
      width: 70,
      align: 'center',
      Header: <FormattedMessage id="no." />,
      disableSortBy: true,
      accessor: 'index',
      className: 'cell-center',
      Cell: ({ row }: { row: Row }) => {
        const rowNumber = (currentPage - 1) * pageSize + row.index + 1;
        return <div className="font-medium">#{rowNumber}</div>;
      }
    },
    {
      Header: <FormattedMessage id="time" />,
      disableSortBy: true,
      accessor: 'date',
      className: 'min-w-36'
    },
    {
      Header: <FormattedMessage id="time-see-welcome-page" />,
      disableSortBy: true,
      accessor: 'totalViews'
    },
    {
      Header: <FormattedMessage id="time-login-wifi" />,
      disableSortBy: true,
      accessor: 'successfulLogins',
      Cell: ({ row }: { row: any }) => {
        return (
          <div className="flex justify-between">
            {row.original.totalUsers}
            <Chip
              variant={Number(Number(row.original.successRate).toFixed(2)) === 0 ? 'filled' : 'combined'}
              color={Number(Number(row.original.successRate).toFixed(2)) === 0 ? 'default' : 'success'}
              icon={
                Number(Number(row.original.successRate).toFixed(2)) === 0 ? undefined : <ArrowUp style={{ transform: 'rotate(45deg)' }} />
              }
              label={`${Number(Number(row.original.successRate).toFixed(2))}%`}
              sx={{ ml: 1.25, pl: 1, borderRadius: 1, minWidth: '90px' }}
              size="small"
            />
          </div>
        );
      }
    },
    {
      Header: <FormattedMessage id="time-login-wifi-error" />,
      disableSortBy: true,
      accessor: 'failedLogins',
      Cell: ({ row }: { row: any }) => {
        return (
          <div className="flex justify-between">
            {row.original.failedLogins}
            <Chip
              variant={Number(Number(row.original.failRate).toFixed(2)) === 0 ? 'filled' : 'combined'}
              color={Number(Number(row.original.failRate).toFixed(2)) === 0 ? 'default' : 'error'}
              icon={Number(Number(row.original.failRate).toFixed(2)) === 0 ? undefined : <ArrowUp style={{ transform: 'rotate(45deg)' }} />}
              label={`${Number(Number(row.original.failRate).toFixed(2))}%`}
              sx={{ ml: 1.25, pl: 1, borderRadius: 1, minWidth: '90px' }}
              size="small"
            />
          </div>
        );
      }
    },
    {
      Header: <FormattedMessage id="total-user" />,
      disableSortBy: true,
      accessor: 'totalUsers'
    }
  ];
};

export const columnsActivitiesWiFi = (
  currentPage: number,
  pageSize: number,
  handleAdd: () => void,
  handleClose: () => void
  // setRecordDelete: (record: any) => void
  // onViewClick?: (record: any) => void,
  // hiddenView?: boolean
) => {
  return [
    {
      sticky: 'left',
      width: 70,
      Header: <FormattedMessage id="no." />,
      disableSortBy: true,
      accessor: 'index',
      align: 'center',
      className: 'cell-center',
      Cell: ({ row }: { row: Row }) => {
        const rowNumber = (currentPage - 1) * pageSize + row.index + 1;
        return <div className="font-semibold">#{rowNumber}</div>;
      }
    },
    // {
    //   sticky: 'left',
    //   width: 80,
    //   Header: '#',
    //   disableSortBy: true,
    //   accessor: 'id',
    //   className: 'hidden'
    // },

    {
      Header: <FormattedMessage id="device" />,
      disableSortBy: true,
      accessor: 'device'
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
      Header: <FormattedMessage id="ip-address" />,
      disableSortBy: true,
      accessor: 'ip_address'
    },
    {
      Header: <FormattedMessage id="browser" />,
      disableSortBy: true,
      accessor: 'browser'
    },
    {
      width: 120,
      Header: <FormattedMessage id="os" />,
      disableSortBy: true,
      accessor: 'os'
    },
    {
      Header: <FormattedMessage id="login-type" />,
      disableSortBy: true,
      accessor: 'login_type'
    },
    {
      align: 'center',
      Header: <FormattedMessage id="login-status" />,
      disableSortBy: true,
      accessor: 'login_status',
      className: 'cell-center',
      Cell: ({ value }: { value: string }) => {
        return <ChipStatus id={value === 'success' ? 1 : 2} successLabel="success" errorLabel="failed" />;
      }
    },
    {
      Header: <FormattedMessage id="login-failed-reason" />,
      disableSortBy: true,
      accessor: 'login_failed_reason'
    },
    {
      sticky: 'right',
      Header: <FormattedMessage id="date" />,
      disableSortBy: true,
      accessor: 'created_date'
    }
  ];
};
