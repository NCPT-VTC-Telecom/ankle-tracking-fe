import { FormattedMessage } from 'react-intl';

//third-party
import { Row } from 'react-table';

//project-import
import ColumnActions from './column-action-status/column-action';

//types
import { WLANData } from 'shared/types';
import ChipStatus from 'shared/components/atoms/ChipStatus';

interface RadiusCols {
  currentPage: number;
  pageSize: number;
  handleAdd: () => void;
  handleClose: () => void;
  setRecord?: (record: WLANData) => void;
  setRecordDelete?: (record: WLANData) => void;
  onViewClick?: (record: WLANData) => void;
  isHiddenView?: boolean;
  isHiddenEdit?: boolean;
  isHiddenDelete?: boolean;
  canWrite?: boolean;
}

export const columnsVLAN = (params: RadiusCols) => {
  return [
    {
      align: 'center',
      sticky: 'left',
      width: 50,
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
      Header: <FormattedMessage id="name-vlan" />,
      disableSortBy: true,
      accessor: 'name'
    },
    {
      Header: <FormattedMessage id="site" />,
      disableSortBy: true,
      accessor: 'site.name'
    },
    {
      align: 'center',
      width: 80,
      Header: <FormattedMessage id="status" />,
      disableSortBy: true,
      accessor: 'status_id',
      Cell: ({ value }: { value: number }) => {
        return <ChipStatus id={value} successLabel="active" errorLabel="inactive" />;
      }
    },
    {
      align: 'center',
      sticky: 'right',
      width: 80,
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
