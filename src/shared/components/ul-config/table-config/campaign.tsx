import { Chip, IconButton, Tooltip, Typography } from '@mui/material';
import { Setting2, ShieldTick } from 'iconsax-react';
import { FormattedMessage } from 'react-intl';
import { Row } from 'react-table';
import { DataAds, DataCampaign } from 'shared/types';
import ColumnActions from './column-action-status/column-action';
import ColumnActionsV2 from './column-action-status/column-action-v2';
import dayjs from 'dayjs';
import { optionAdType } from 'shared/components/organisms/adSample/AdManager';

interface CampaignCols {
  currentPage: number;
  pageSize: number;
  handleAdd: () => void;
  handleClose: () => void;
  setRecord: (record: DataCampaign) => void;
  setRecordDelete: (record: DataCampaign) => void;
  setViewRecord: (record: DataCampaign) => void;
  handleChangeStatus?: (record: DataCampaign) => void;
  canWrite?: boolean;
}

interface ColumnsCampaignModerationParams {
  currentPage: number;
  pageSize: number;
  handleOpenApprove: (record: DataCampaign) => void;
  setRecord: (record: DataCampaign) => void;
  handleView: (record: DataCampaign) => void;
  canWrite?: boolean;
}

interface ColumnsAdModerationParams {
  currentPage: number;
  pageSize: number;
  handleOpenApprove: (record: DataAds) => void;
  setRecord: (record: DataAds) => void;
  handleView: (record: DataAds) => void;
  canWrite?: boolean;
}

export const columnsCampaign = (params: CampaignCols) => {
  return [
    // {
    //   Header: '#',
    //   disableSortBy: true,
    //   accessor: 'id',
    //   className: 'hidden',
    // },
    {
      align: 'center',
      sticky: 'left',
      width: 70,
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
      Header: <FormattedMessage id="name-campaign" />,
      disableSortBy: true,
      accessor: 'name'
    },
    {
      Header: <FormattedMessage id="ad" />,
      disableSortBy: true,
      accessor: 'ad.template_name'
    },
    {
      Header: <FormattedMessage id="ad-partner" />,
      disableSortBy: true,
      accessor: 'partner.name'
    },
    {
      Header: <FormattedMessage id="amount-ad" />,
      disableSortBy: true,
      accessor: 'amount',
      Cell: ({ value }: { value: number }) => {
        return <div>{value?.toLocaleString()}</div>;
      }
    },
    {
      Header: <FormattedMessage id="expired-date" />,
      disableSortBy: true,
      accessor: 'expired_date'
    },
    {
      Header: <FormattedMessage id="click-limit" />,
      disableSortBy: true,
      accessor: 'click_limit',
      Cell: ({ value }: { value: number }) => {
        return <div>{value?.toLocaleString()}</div>;
      }
    },
    {
      Header: <FormattedMessage id="impression-limit" />,
      disableSortBy: true,
      accessor: 'impression_limit',
      Cell: ({ value }: { value: number }) => {
        return <div>{value?.toLocaleString()}</div>;
      }
    },
    // {
    //   Header: <FormattedMessage id="site" />,
    //   disableSortBy: true,
    //   accessor: 'site_id'
    // },
    // {
    //   Header: <FormattedMessage id="region" />,
    //   disableSortBy: true,
    //   accessor: 'region_id'
    // },
    {
      Header: <FormattedMessage id="status" />,
      disableSortBy: true,
      accessor: 'status_id',
      className: 'cell-center',
      Cell: ({ value }: { value: number }) => {
        switch (value) {
          case 1:
            return <Chip color="success" label={<FormattedMessage id={'active'} />} size="small" variant="combined" />;
          case 2:
            return <Chip color="error" label={<FormattedMessage id={'inactive'} />} size="small" variant="combined" />;
          default:
            return <Chip color="warning" label={<FormattedMessage id={'pending-approval'} />} size="small" variant="combined" />;
        }
      }
    },
    {
      width: 150,
      sticky: 'right',
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<{}> }) => (
        <ColumnActions
          canWrite={params.canWrite}
          row={row}
          handleAdd={params.handleAdd}
          handleClose={params.handleClose}
          setRecord={params.setRecord}
          setRecordDelete={params.setRecordDelete}
          setViewRecord={params.setViewRecord}
          children={
            <Tooltip title={<FormattedMessage id="change-status" />}>
              <IconButton
                disabled={!params.canWrite}
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  params.handleChangeStatus?.(row.original as DataCampaign);
                }}
              >
                <Setting2 />
              </IconButton>
            </Tooltip>
          }
        />
      )
    }
  ];
};

export const columnsCampaignModeration = ({
  currentPage,
  pageSize,
  setRecord,
  canWrite,
  handleView,
  handleOpenApprove
}: ColumnsCampaignModerationParams) => {
  return [
    // {
    //   Header: '#',
    //   disableSortBy: true,
    //   accessor: 'id',
    //   className: 'hidden'
    // },
    {
      width: 50,
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
      Header: <FormattedMessage id="name-campaign" />,
      disableSortBy: true,
      accessor: 'name'
    },
    {
      Header: <FormattedMessage id="ad" />,
      disableSortBy: true,
      accessor: 'ad.template_name'
    },
    {
      Header: <FormattedMessage id="ad-partner" />,
      disableSortBy: true,
      accessor: 'partner.name'
    },
    {
      Header: <FormattedMessage id="amount-ad" />,
      disableSortBy: true,
      accessor: 'amount',
      Cell: ({ value }: { value: number }) => {
        return <div>{value?.toLocaleString()}</div>;
      }
    },
    {
      Header: <FormattedMessage id="expired-date" />,
      disableSortBy: true,
      accessor: 'expired_date'
    },
    {
      Header: <FormattedMessage id="click-limit" />,
      disableSortBy: true,
      accessor: 'click_limit',
      Cell: ({ value }: { value: number }) => {
        return <div>{value?.toLocaleString()}</div>;
      }
    },
    {
      Header: <FormattedMessage id="impression-limit" />,
      disableSortBy: true,
      accessor: 'impression_limit',
      Cell: ({ value }: { value: number }) => {
        return <div>{value?.toLocaleString()}</div>;
      }
    },
    // {
    //   Header: <FormattedMessage id="site" />,
    //   disableSortBy: true,
    //   accessor: 'site_id'
    // },
    // {
    //   Header: <FormattedMessage id="region" />,
    //   disableSortBy: true,
    //   accessor: 'region_id'
    // },
    {
      Header: <FormattedMessage id="status" />,
      disableSortBy: true,
      accessor: 'status_id',
      className: 'cell-center',
      Cell: ({ value }: { value: number }) => {
        switch (value) {
          case 1:
            return <Chip color="success" label={<FormattedMessage id={'active'} />} size="small" variant="combined" />;
          case 2:
            return <Chip color="error" label={<FormattedMessage id={'inactive'} />} size="small" variant="combined" />;
          default:
            return <Chip color="warning" label={<FormattedMessage id={'pending-approval'} />} size="small" variant="combined" />;
        }
      }
    },
    {
      width: 80,
      sticky: 'right',
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<DataCampaign> }) => (
        <ColumnActionsV2
          isHiddenEdit
          // isHiddenView
          onView={handleView}
          row={row}
          handleAdd={() => ''}
          handleClose={() => ''}
          canWrite={canWrite}
          children={
            canWrite ? (
              <Tooltip title="Approve" arrow>
                <IconButton
                  color="success"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenApprove(row.original);
                  }}
                >
                  <ShieldTick size={20} />
                </IconButton>
              </Tooltip>
            ) : null
          }
        />
      )
    }
  ];
};

export const columnsAdModeration = ({
  currentPage,
  pageSize,
  setRecord,
  canWrite,
  handleView,
  handleOpenApprove
}: ColumnsAdModerationParams) => {
  return [
    // {
    //   Header: '#',
    //   disableSortBy: true,
    //   accessor: 'id',
    //   className: 'hidden'
    // },
    {
      width: 50,
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
      Header: <FormattedMessage id="name-template" />,
      disableSortBy: true,
      accessor: 'template_name'
    },
    {
      Header: <FormattedMessage id="ssid" />,
      disableSortBy: true,
      accessor: 'ssid'
    },
    {
      Header: <FormattedMessage id="type-ads" />,
      disableSortBy: true,
      accessor: 'ad_type',
      Cell: ({ value, row }: { value: number; row: Row<DataAds> }) => {
        return (
          <Typography variant="body1" className="block">
            {optionAdType.find((opt) => opt.value === row.original.ad_type)?.label || row.original.ad_type}
          </Typography>
        );
      }
    },
    {
      Header: <FormattedMessage id="time" />,
      disableSortBy: true,
      accessor: 'amount',
      Cell: ({ value, row }: { value: number; row: Row<DataAds> }) => {
        return (
          <Typography variant="body1">
            {row.original.time_start && row.original.time_end
              ? `${dayjs(row.original.time_start, 'HH:mm:ss').format('HH:mm')} - ${dayjs(row.original.time_end, 'HH:mm:ss').format(
                  'HH:mm'
                )}`
              : 'Chưa cập nhật'}
          </Typography>
        );
      }
    },

    // {
    //   Header: <FormattedMessage id="site" />,
    //   disableSortBy: true,
    //   accessor: 'site_id'
    // },
    // {
    //   Header: <FormattedMessage id="region" />,
    //   disableSortBy: true,
    //   accessor: 'region_id'
    // },
    {
      Header: <FormattedMessage id="status" />,
      disableSortBy: true,
      accessor: 'status_id',
      className: 'cell-center',
      Cell: ({ value }: { value: number }) => {
        switch (value) {
          case 1:
            return <Chip color="success" label={<FormattedMessage id={'active'} />} size="small" variant="combined" />;
          case 2:
            return <Chip color="error" label={<FormattedMessage id={'inactive'} />} size="small" variant="combined" />;
          default:
            return <Chip color="warning" label={<FormattedMessage id={'pending-approval'} />} size="small" variant="combined" />;
        }
      }
    },
    {
      width: 80,
      sticky: 'right',
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<DataAds> }) => (
        <ColumnActionsV2
          isHiddenEdit
          // isHiddenView
          onView={handleView}
          row={row}
          handleAdd={() => ''}
          handleClose={() => ''}
          canWrite={canWrite}
          children={
            canWrite ? (
              <Tooltip title="Approve" arrow>
                <IconButton
                  color="success"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenApprove(row.original);
                  }}
                >
                  <ShieldTick size={20} />
                </IconButton>
              </Tooltip>
            ) : null
          }
        />
      )
    }
  ];
};
