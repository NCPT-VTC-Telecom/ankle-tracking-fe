import { FormattedMessage } from 'react-intl';
import { Row } from 'react-table';

export const columnsIncidentFeedback = (currentPage: number, pageSize: number) => {
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
      Header: <FormattedMessage id="type" defaultMessage="Type" />,
      disableSortBy: true,
      accessor: 'type',
      Cell: ({ value }: { value: string }) => <span className="capitalize">{value}</span>
    },
    {
      Header: <FormattedMessage id="content" defaultMessage="Content" />,
      disableSortBy: true,
      accessor: 'content',
      Cell: ({ value }: { value: string }) => <div className="whitespace-pre-wrap">{value}</div>
    },
    {
      Header: <FormattedMessage id="status" defaultMessage="Status" />,
      disableSortBy: true,
      accessor: 'status',
      Cell: ({ value }: { value: 'resolved' | 'unresolved' }) => (
        <span className={`px-2 py-1 rounded text-white text-sm font-medium ${value === 'resolved' ? 'bg-green-500' : 'bg-yellow-500'}`}>
          {value}
        </span>
      )
    },
    {
      Header: <FormattedMessage id="time" defaultMessage="Time" />,
      disableSortBy: true,
      accessor: 'receivedAt',
      Cell: ({ value }: { value: string }) => {
        const date = new Date(value);
        return <span>{date.toLocaleString()}</span>;
      }
    }
  ];
};
