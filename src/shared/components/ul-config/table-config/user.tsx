import { Chip, Collapse, IconButton, Rating, Tooltip, Typography } from '@mui/material';
import ChipStatus from 'shared/components/atoms/ChipStatus';
import { MouseEvent, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Row } from 'react-table';
import { renderValue } from 'shared/utils/render';
import ColumnActions from './column-action-status/column-action';
import { ArrowDown2, ArrowUp2, Setting2 } from 'iconsax-react';

export const columnsEndUser = (
  currentPage: number,
  pageSize: number,
  handleAdd: () => void,
  handleClose: () => void,
  setRecord: (record: any) => void,
  setRecordDelete: (record: any) => void,
  onViewClick?: (record: any) => void,
  hiddenView?: boolean,
  onResetPassword?: (record: any) => void,
  canWrite?: boolean,
  onChangeStatus?: (id: string, status: number) => void
) => {
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
        return <div className="font-medium">#{rowNumber}</div>;
      }
    },
    {
      sticky: 'left',
      Header: <FormattedMessage id="name-user" />,
      disableSortBy: true,
      accessor: 'fullname'
    },
    {
      Header: <FormattedMessage id="username" />,
      disableSortBy: true,
      accessor: 'username'
    },
    {
      Header: <FormattedMessage id="email" />,
      disableSortBy: true,
      accessor: 'email'
    },
    {
      width: 100,
      Header: <FormattedMessage id="phone-number" />,
      disableSortBy: true,
      accessor: 'phone_number'
    },
    {
      width: 100,
      Header: <FormattedMessage id="role" />,
      disableSortBy: true,
      accessor: 'user_group',
      Cell: ({ value }: { value: number }) => {
        return <div>{value == 1 ? <FormattedMessage id="admin" /> : <FormattedMessage id="user" />}</div>;
      }
    },
    {
      Header: <FormattedMessage id="province" />,
      disableSortBy: true,
      accessor: 'province'
    },
    {
      Header: <FormattedMessage id="country" />,
      disableSortBy: true,
      accessor: 'country'
    },
    {
      width: 100,
      Header: <FormattedMessage id="postcode" />,
      disableSortBy: true,
      accessor: 'postcode'
    },
    {
      width: 100,
      align: 'center',
      Header: <FormattedMessage id="status" />,
      disableSortBy: true,
      accessor: 'status_id',
      className: 'cell-center',
      Cell: ({ value }: { value: number }) => {
        return <ChipStatus id={value} successLabel="active" errorLabel="inactive" warningLabel="inactive" />;
      }
    },
    {
      width: 120,
      sticky: 'right',
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
          isHiddenView={hiddenView}
          isHiddenResetPassword={false} // Hiển thị nút reset password cho bảng này
          onResetPassword={onResetPassword} // Truyền callback
          children={
            <>
              <Tooltip title={<FormattedMessage id="change-status" />}>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <IconButton
                    disabled={!canWrite}
                    color="primary"
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      if (onChangeStatus) {
                        const newStatus = (row.original as any).status_id === 1 ? 9 : 1;
                        onChangeStatus((row.original as any).id, newStatus);
                      }
                    }}
                  >
                    <Setting2 />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          }
        />
      )
    }
  ];
};

const cleanAnswer = (value: string): string => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join(', ') : parsed.toString();
  } catch {
    return value?.replace(/^\"|\"$/g, '') ?? '';
  }
};

export const columnsSurvey = (currentPage: number, pageSize: number, handleAdd: () => void, handleClose: () => void) => {
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
        const rowNumber = (currentPage - 1) * pageSize + row.index + 1;
        return <div className="font-semibold">#{rowNumber}</div>;
      }
    },
    // {
    //   sticky: 'left',
    //   width: 50,
    //   Header: '#',
    //   accessor: 'id',
    //   disableSortBy: true,
    //   className: 'hidden'
    // },
    {
      Header: <FormattedMessage id="fullname" />,
      accessor: 'fullname',
      disableSortBy: true,
      Cell: ({ value }: { value: string }) => <span>{renderValue(value)}</span>
    },
    {
      Header: <FormattedMessage id="email" />,
      accessor: 'email',
      disableSortBy: true,
      Cell: ({ value }: { value: string }) => <span>{renderValue(value)}</span>
    },
    {
      Header: <FormattedMessage id="phone-number" />,
      accessor: 'phone_number',
      disableSortBy: true,
      Cell: ({ value }: { value: string }) => <span>{renderValue(value)}</span>
    },
    {
      Header: <FormattedMessage id="site" />,
      accessor: 'site.name',
      disableSortBy: true,
      Cell: ({ value }: { value: string }) => <span>{renderValue(value)}</span>
    },
    {
      Header: <FormattedMessage id="ad" />,
      accessor: 'ad.template_name',
      disableSortBy: true,
      Cell: ({ value }: { value: string }) => <span>{renderValue(value)}</span>
    },
    {
      width: 250,
      Header: <FormattedMessage id="survey-result" />,
      accessor: 'optional_survey_question',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<any> }) => {
        const [open, setOpen] = useState(false);
        const data = row.original;

        return (
          <div>
            {/* Header row — click để mở/đóng collapse */}
            <div onClick={() => setOpen(!open)} className="cursor-pointer flex items-center justify-between">
              <Typography className="text-blue-500" variant="body2" sx={{ fontWeight: 500 }}>
                <FormattedMessage id="view-details" />
              </Typography>
              <Typography variant="body2">{open ? <ArrowUp2 size={14} /> : <ArrowDown2 size={14} />}</Typography>
            </div>

            {/* Nội dung collapse */}
            <Collapse in={open} timeout="auto" unmountOnExit>
              <div className="mt-2 p-2 space-y-1 text-sm">
                <div>
                  <strong>
                    <FormattedMessage id="question-1" />:
                  </strong>{' '}
                  {renderValue(data.optional_survey_question)}
                </div>
                <div>
                  <strong>
                    <FormattedMessage id="answer-1" />:
                  </strong>{' '}
                  {cleanAnswer(data.optional_survey_answer)}
                </div>
                <div>
                  <strong>
                    <FormattedMessage id="question-2" />:
                  </strong>{' '}
                  {renderValue(data.optional_survey_question_1)}
                </div>
                <div>
                  <strong>
                    <FormattedMessage id="answer-2" />:
                  </strong>{' '}
                  {cleanAnswer(data.optional_survey_answer_1)}
                </div>
                {data.rating && (
                  <div className="flex items-center gap-2">
                    <strong>
                      <FormattedMessage id="rating" />:
                    </strong>
                    <Rating name="read-only" value={Number(data.rating)} readOnly size="small" />
                  </div>
                )}
              </div>
            </Collapse>
          </div>
        );
      }
    },
    {
      sticky: 'right',
      Header: <FormattedMessage id="created-time" />,
      accessor: 'created_date',
      disableSortBy: true
    }
  ];
};

export const columnsRole = (
  currentPage: number,
  pageSize: number,
  handleAdd: () => void,
  handleClose: () => void,
  setRecord: (record: any) => void,
  setRecordDelete: (record: any) => void
) => {
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
      Header: <FormattedMessage id="name-role" />,
      disableSortBy: true,
      accessor: 'title'
    },
    {
      Header: <FormattedMessage id="permission" />,
      disableSortBy: true,
      accessor: 'permission',
      Cell: ({ value }: { value: string }) => {
        return <div style={{ display: 'flex', gap: '2px' }}>{renderPermissions(value)}</div>;
      }
    },
    {
      Header: <FormattedMessage id="desc" />,
      disableSortBy: true,
      accessor: 'description'
    },

    {
      Header: <FormattedMessage id="status-active" />,
      disableSortBy: true,
      accessor: 'status_id',
      className: 'cell-center',
      Cell: ({ value }: { value: number }) => {
        switch (value) {
          case 1:
            return <Chip color="success" label={<FormattedMessage id="active" />} size="small" variant="light" />;
          default:
            return <Chip color="error" label={<FormattedMessage id="inactive" />} size="small" variant="light" />;
        }
      }
    },
    {
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<{}> }) => (
        <ColumnActions
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

const renderPermissions = (permissionJson: string) => {
  try {
    const permissions = JSON.parse(permissionJson);
    // Initialize an array to hold the final elements including commas
    const elements: any[] = [];

    permissions.forEach((perm: string, index: number) => {
      const action = perm.split('_')[1]; // Strip the prefix like "user" or "admin"

      // Add the permission span element
      elements.push(
        <span key={`perm-${index}`}>{action === 'get' ? <FormattedMessage id="read-only" /> : <FormattedMessage id="sync" />}</span>
      );

      // Add a comma after the element if it's not the last one
      if (index < permissions.length - 1) {
        elements.push(<span key={`comma-${index}`}>, </span>);
      }
    });

    return elements;
  } catch (error) {
    return <span>{permissionJson}</span>; // Return original string if parsing fails
  }
};
