import { FormattedMessage } from 'react-intl';

//third-party
import { Row } from 'react-table';

//project-import
import ColumnActions from './column-action-status/column-action';

//types
import { SSIDData } from 'shared/types';
import ChipStatus from 'shared/components/atoms/ChipStatus';
// import ChipStatus from 'shared/components/atoms/ChipStatus';

interface SSIDCols {
  currentPage: number;
  pageSize: number;
  handleAdd: () => void;
  handleClose: () => void;
  setRecord?: (record: SSIDData) => void;
  setRecordDelete?: (record: SSIDData) => void;
  onViewClick?: (record: SSIDData) => void;
  isHiddenView?: boolean;
  isHiddenEdit?: boolean;
  isHiddenDelete?: boolean;
  canWrite?: boolean;
}

export const columnsSSID = (params: SSIDCols) => {
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
        const rowNumber = (params.currentPage - 1) * params.pageSize + row.index + 1;
        return <div className="font-semibold">#{rowNumber}</div>;
      }
    },
    {
      Header: <FormattedMessage id="name" />,
      disableSortBy: true,
      accessor: 'name'
    },
    {
      Header: <FormattedMessage id="site" />,
      disableSortBy: true,
      accessor: 'site.name'
    },
    {
      Header: <FormattedMessage id="vlan_id" />,
      disableSortBy: true,
      accessor: 'vlan_id'
    },
    {
      width: 100,
      align: 'center',
      Header: <FormattedMessage id="broadcast" />,
      disableSortBy: true,
      accessor: 'broadcast',
      className: 'cell-center',
      Cell: ({ value }: { value: string }) => <ChipStatus id={value === 'true' ? 1 : 0} successLabel="online" errorLabel="offline" />
    },
    {
      width: 100,
      align: 'center',
      Header: <FormattedMessage id="vlan_enable" />,
      disableSortBy: true,
      accessor: 'vlan_enable',
      Cell: ({ value }: { value: string }) => <ChipStatus id={value === 'true' ? 1 : 0} successLabel="enabled" errorLabel="disabled" />
    },

    {
      sticky: 'right',
      width: 50,
      align: 'center',
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
          isHiddenView={params.isHiddenView}
          isHiddenEdit={params.isHiddenEdit}
          isHiddenDelete={params.isHiddenDelete}
        />
      )
    }
  ];
};
