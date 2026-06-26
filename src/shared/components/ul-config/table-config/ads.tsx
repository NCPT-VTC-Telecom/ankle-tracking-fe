import { FormattedMessage } from 'react-intl';
import { Row } from 'react-table';

// project component
import { IconButton, Tooltip } from '@mui/material';
import ChipStatus from 'shared/components/atoms/ChipStatus';
import { ShieldTick } from 'iconsax-react';
import { DataAds } from 'shared/types';
import ColumnActionsV2 from './column-action-status/column-action-v2';

// types

interface ColumnsAdParams {
  currentPage: number;
  pageSize: number;
  handleAdd: () => void;
  handleOpenApprove: () => void;
  handleClose: () => void;
  setRecord: (record: DataAds) => void;
  canWrite?: boolean;
}

export const columnsAd = ({ currentPage, pageSize, handleAdd, handleClose, setRecord, canWrite, handleOpenApprove }: ColumnsAdParams) => {
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
      Header: <FormattedMessage id="ad-type" />,
      accessor: 'ad_type',
      disableSortBy: true
    },
    {
      Header: <FormattedMessage id="template-name" />,
      accessor: 'template_name',
      disableSortBy: true
    },
    {
      Header: <FormattedMessage id="placement" />,
      accessor: 'placement',
      disableSortBy: true
    },
    {
      Header: <FormattedMessage id="ssid" />,
      accessor: 'ssid',
      disableSortBy: true
    },
    {
      Header: <FormattedMessage id="time-start" />,
      accessor: 'time_start',
      disableSortBy: true
    },
    {
      Header: <FormattedMessage id="time-end" />,
      accessor: 'time_end',
      disableSortBy: true
    },
    {
      Header: <FormattedMessage id="status" />,
      accessor: 'status_id',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ value }: { value: number }) => <ChipStatus id={value} successLabel="active" errorLabel="inactive" />
    },
    {
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<DataAds> }) => (
        <ColumnActionsV2
          isHiddenEdit
          isHiddenView
          row={row}
          handleAdd={handleAdd}
          handleClose={handleClose}
          canWrite={canWrite}
          children={
            <Tooltip title="Approve" arrow>
              <IconButton color="success" size="small" onClick={() => handleOpenApprove()}>
                <ShieldTick size={20} />
              </IconButton>
            </Tooltip>
          }
        />
      )
    }
  ];
};
