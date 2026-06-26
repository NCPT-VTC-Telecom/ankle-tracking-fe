// import ChipStatus from 'shared/components/atoms/ChipStatus';
import { FormattedMessage } from 'react-intl';
import { Row } from 'react-table';
import { Agent } from 'shared/types/agent';
import ColumnActions from './column-action-status/column-action';
import dayjs from 'dayjs';
import ChipStatus from 'shared/components/atoms/ChipStatus';
import { Tooltip } from '@mui/material';
import { IconButton } from '@mui/material';
import { Copy, Eye, EyeSlash, Refresh } from 'iconsax-react';
import { MouseEvent, useState } from 'react';
import { message } from 'antd';

interface AgentCols {
  currentPage: number;
  pageSize: number;
  handleAdd: (record: Agent) => void;
  handleResetToken: (record: Agent) => void;
  handleClose: () => void;
  setRecord: (record: Agent) => void;
  setRecordDelete: (record: Agent) => void;
  setViewRecord: (record: Agent) => void;
  canWrite?: boolean;
}

export const columnsAgent = (params: AgentCols) => {
  return [
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
      Header: <FormattedMessage id="agency-name" />,
      accessor: 'agent_name'
    },
    {
      Header: <FormattedMessage id="username" />,
      accessor: 'user.username'
    },
    {
      Header: <FormattedMessage id="email" />,
      accessor: 'user.email'
    },
    {
      
      Header: <FormattedMessage id="token" />,
      accessor: 'token',
      Cell: ({ value }: { value: string }) => {
        const [visible, setVisible] = useState(false);

        const handleCopy = async () => {
          try {
            await navigator.clipboard.writeText(value);
            message.success('Token copied to clipboard');
          } catch (err) {
            message.error('Failed to copy');
          }
        };

        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()
          }>
            <span className="font-mono">{visible ? value : '**********'}</span>
            <Tooltip title={visible ? <FormattedMessage id="hide-token" /> : <FormattedMessage id="show-token" />}>
              <IconButton
                size="small"
                onClick={() => setVisible((prev) => !prev)}
              >
                {visible ? <Eye /> : <EyeSlash />}
              </IconButton>
            </Tooltip>
            <Tooltip title={<FormattedMessage id="Copy" />}>
              <IconButton size="small" onClick={handleCopy}>
                <Copy />
              </IconButton>
            </Tooltip>
          </div >
        );
      }
    },
    {
      Header: <FormattedMessage id="duration" />,
      accessor: 'expiry_date',
      Cell: ({ value }: { value: string }) => (
        <div>{dayjs(value).format('DD/MM/YYYY')}</div>
      )
    },
    {
      Header: <FormattedMessage id="status" />,
      accessor: 'status_id',
      Cell: ({ value }: { value: number }) => (
        <ChipStatus id={value} successLabel="active" errorLabel="inactive" />
      )
    },
    {
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<Agent> }) => (
        <ColumnActions
          canWrite={params.canWrite}
          isHiddenView={false}
          isHiddenDelete={row.original.status_id === 0}
          isHiddenEdit={row.original.status_id === 0}
          row={row}
          handleClose={params.handleClose}
          setRecord={params.setRecord}
          setRecordDelete={params.setRecordDelete}
          setViewRecord={params.setViewRecord}
          handleAdd={params.handleAdd}
          children={<Tooltip
            componentsProps={{
              tooltip: {
                sx: {
                  opacity: 0.9
                }
              }
            }}
            title={<FormattedMessage id="reset-token" />}
          >
            <span>
              <IconButton
                color="info"
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  params?.handleResetToken?.(row.original);
                  params.handleClose();
                }}
              >
                <Refresh size="16" color="#5B6B79" />
              </IconButton>
            </span>
          </Tooltip>} />
      )
    }
  ];
};
