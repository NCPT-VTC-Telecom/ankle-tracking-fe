import { useMemo, Fragment, useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useMediaQuery,
  Skeleton,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import ImportFileButton from 'shared/components/atoms/ImportFileButton';

// third-party
import {
  useFilters,
  useExpanded,
  useGlobalFilter,
  useRowSelect,
  useSortBy,
  useTable,
  usePagination,
  HeaderGroup,
  Row,
  Cell
} from 'react-table';

// project-imports
import { CSVExport, HeaderSort, TablePagination } from 'shared/components/third-party/ReactTable';
import { renderFilterTypes, GlobalFilter } from 'shared/utils/react-table';

// assets
import { Add, Refresh } from 'iconsax-react';

//types
import { GeneralizedTableProps } from 'shared/types/table';
import { FormattedMessage, useIntl } from 'react-intl';
import useConfig from 'shared/hooks/useConfig';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import LoadingButton from 'shared/components/@extended/LoadingButton';
import DynamicFilterRenderer, { FilterConfig } from './DynamicFilterRenderer';

const { RangePicker } = DatePicker;

const GeneralizedTable = ({
  columns,
  data,
  handleAdd,
  renderRowSubComponent,
  csvFilename,
  addButtonLabel,
  buttonRefresh,
  sortColumns,
  isDecrease,
  size,
  isReload,
  totalPages,
  totalResults,
  onPageChange,
  onRowExpandedChange,
  hiddenPagination,
  className,
  spacing,
  onRowClick,
  isLoading,
  searchFilter,
  getDataExcel,
  dataHandlerExcel,
  handleExportExcel,
  handleExportFormat,
  handleRefresh,
  statusOptions, // New prop
  onStatusFilterChange, // New prop
  floorOptions, // New prop
  onFloorFilterChange,
  typeOptions, // New prop
  defaultType = null,
  onTypeFilterChange, // New prop,
  handleDateFilter,
  dateFilter,
  isLoadingRefresh,
  exportExcelBtn,
  canWrite = true,
  filterConfigs = []
}: GeneralizedTableProps) => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const filterTypes = useMemo(() => renderFilterTypes, []);
  const [reload, setReload] = useState(false);
  const intl = useIntl();
  const { i18n } = useConfig();

  const sortBy = { id: sortColumns || 'id', desc: isDecrease || false };
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null); // State for selected status
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null); // State for selected status
  const [selectedType, setSelectedType] = useState<string | null>(defaultType); // State for selected status

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    // setHiddenColumns,
    visibleColumns,
    page,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize, expanded }
    // preGlobalFilteredRows
  } = useTable(
    {
      columns,
      data,
      filterTypes,
      initialState: { pageIndex: 0, pageSize: size || 10, hiddenColumns: ['avatar'], sortBy: [sortBy] }
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect
  );

  useEffect(() => {
    if (isReload) {
      setReload(true);
    }
    if (reload) {
      setReload(false);
    }
  }, [isReload, reload]);

  useEffect(() => {
    gotoPage(pageIndex - 1);
  }, [pageIndex, gotoPage]);

  useEffect(() => {
    if (matchDownSM) {
      // setHiddenColumns(['age', 'contact', 'visits', 'email', 'status', 'avatar', 'fatherName']);
    } else {
      // setHiddenColumns(['avatar', 'email', 'fatherName']);
    }

    // eslint-disable-next-line
  }, [matchDownSM]);

  const handlePageChange = (newPageIndex: number) => {
    gotoPage(newPageIndex - 1);
    onPageChange?.(newPageIndex, pageSize);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    gotoPage(0);
    onPageChange?.(0, newPageSize);
  };

  const cellStyle = {
    maxWidth: '150px', // or any other suitable default width
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };

  return (
    <>
      <Stack spacing={spacing || 3}>
        {csvFilename || addButtonLabel || getDataExcel || searchFilter ? (
          <Stack
            direction={matchDownSM ? 'column' : 'row'}
            spacing={1}
            justifyContent="space-between"
            alignItems={matchDownSM ? 'flex-start' : 'center'}
            sx={{ p: 3, pb: 0 }}
          >
            <div className={matchDownSM ? 'flex flex-col gap-2' : 'flex flex-row gap-2'}>
              <div className="">{searchFilter && <GlobalFilter searchFilter={searchFilter} />}</div>
              {dateFilter && (
                <RangePicker
                  format={i18n === 'vi' ? 'DD/MM/YYYY' : 'MM/DD/YYYY'}
                  onChange={handleDateFilter}
                  value={[
                    dateFilter?.start_date ? dayjs(dateFilter.start_date) : null,
                    dateFilter?.end_date ? dayjs(dateFilter.end_date) : null
                  ]}
                  placeholder={[intl.formatMessage({ id: 'departure_start' }), intl.formatMessage({ id: 'departure_end' })]}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #E0E3E6',
                    borderRadius: '8px',
                    height: 'auto',
                    minHeight: '40px',
                    maxWidth: '320px'
                  }}
                />
              )}
              {statusOptions && (
                <div>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id="status-filter-label">{intl.formatMessage({ id: 'status' })}</InputLabel>
                    <Select
                      labelId="status-filter-label"
                      value={selectedStatus || 1}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : Number(e.target.value);
                        setSelectedStatus(value);
                        onStatusFilterChange?.(value);
                      }}
                      label="Status"
                    >
                      <MenuItem value="">{intl.formatMessage({ id: 'all' })}</MenuItem>
                      {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              )}
              {floorOptions && (
                <div>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id="floor-filter-label">{intl.formatMessage({ id: 'floor' })}</InputLabel>
                    <Select
                      labelId="floor-filter-label"
                      value={selectedFloor || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : String(e.target.value);
                        setSelectedFloor(value !== null ? value.toString() : null);
                        onFloorFilterChange?.(value);
                      }}
                      label="Floor"
                    >
                      <MenuItem value="">{intl.formatMessage({ id: 'all' })}</MenuItem>
                      {floorOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              )}
              {typeOptions && (
                <div>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id="type-filter-label">{intl.formatMessage({ id: 'type' })}</InputLabel>
                    <Select
                      labelId="type-filter-label"
                      value={selectedType || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : String(e.target.value);
                        setSelectedType(value !== null ? value.toString() : null);
                        onTypeFilterChange?.(value);
                      }}
                      label="type"
                    >
                      <MenuItem value="">{intl.formatMessage({ id: 'all' })}</MenuItem>
                      {typeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              )}
              {filterConfigs?.length > 0 && <DynamicFilterRenderer filters={filterConfigs as FilterConfig[]} />}

              {exportExcelBtn && exportExcelBtn}
            </div>

            <Stack direction={matchDownSM ? 'column' : 'row'} alignItems={matchDownSM ? 'flex-start' : 'center'} gap={1} spacing={2}>
              {dataHandlerExcel && getDataExcel ? (
                <ImportFileButton labelButton="import-excel" getDataExcel={getDataExcel} dataHandler={dataHandlerExcel} />
              ) : (
                ''
              )}

              {totalResults && totalResults > 0 && <div>{intl.formatMessage({ id: 'total-results' }) + ' ' + totalResults}</div>}
              {handleExportExcel && handleExportFormat && (
                <CSVExport onClickExportExcel={handleExportExcel} onClickExportFormat={handleExportFormat} />
              )}
              {buttonRefresh && handleRefresh && (
                <LoadingButton
                  loading={isLoadingRefresh}
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => {
                    handleRefresh(true);
                  }}
                  size="small"
                  className="justify-end !py-[3px] h-10"
                >
                  {buttonRefresh}
                </LoadingButton>
              )}
              {addButtonLabel && (
                <Button
                  disabled={!canWrite}
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAdd}
                  size="small"
                  className="justify-end !ml-0 h-10"
                >
                  {addButtonLabel}
                </Button>
              )}
            </Stack>
          </Stack>
        ) : (
          ''
        )}
        <Table className={className} {...getTableProps()}>
          <TableHead>
            {headerGroups.map((headerGroup: HeaderGroup<{}>, headerGroupIndex) => {
              const headerGroupProps = headerGroup.getHeaderGroupProps();
              return (
                <TableRow {...headerGroupProps} key={`header-group-${headerGroupIndex}`} sx={{ '& > th:first-of-type': { width: '58px' } }}>
                  {headerGroup.headers.map((column: HeaderGroup, columnIndex) => {
                    const headerProps = column.getHeaderProps([{ className: column.className }]);
                    return (
                      <TableCell
                        {...headerProps}
                        key={`header-${headerGroupIndex}-${columnIndex}`}
                        align="center"
                        style={{
                          ...cellStyle,
                          maxWidth: column.maxWidth || '200px',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}
                      >
                        <HeaderSort column={column} sort />
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {isLoading ? (
              Array.from({ length: pageSize }, (_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((column, cellIndex) => (
                    <TableCell key={`skeleton-cell-${index}-${cellIndex}`}>
                      <Skeleton animation="wave" height={30} width="100%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : Array.isArray(data) && data.length > 0 && page.length > 0 ? (
              page.map((row: Row, i: number) => {
                prepareRow(row);
                const rowProps = row.getRowProps();
                return (
                  <Fragment key={`row-${i}`}>
                    <TableRow
                      {...rowProps}
                      key={`row-${i}`}
                      onClick={(e) => {
                        row.toggleRowSelected();
                        if (onRowClick) {
                          onRowClick(row.original);
                        }
                      }}
                      sx={{ cursor: 'pointer', bgcolor: 'inherit' }}
                      className={i % 2 === 1 ? 'bg-[#f2f2f2] bg-opacity-50' : ''}
                    >
                      {row.cells ? (
                        row.cells.map((cell: Cell, cellIndex) => {
                          const cellProps = cell.getCellProps([{ className: cell.column.className }]);
                          return (
                            <TableCell
                              {...cellProps}
                              key={`cell-${i}-${cellIndex}`}
                              style={{
                                ...cellStyle,
                                maxWidth: cell.column.maxWidth || '200px',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'normal'
                              }}
                            >
                              {typeof cell.value === 'string' && cell.value.length > 20 ? (
                                <Tooltip title={<div>{cell.render('Cell')}</div>} placement="top" arrow>
                                  <div>{cell.render('Cell')}</div>
                                </Tooltip>
                              ) : (
                                <div>{cell.render('Cell')}</div>
                              )}
                            </TableCell>
                          );
                        })
                      ) : (
                        <TableCell colSpan={columns.length}>
                          <FormattedMessage id="don't-have-data" />
                        </TableCell>
                      )}
                    </TableRow>
                    {row.isExpanded && renderRowSubComponent
                      ? renderRowSubComponent({ row, rowProps: row.getRowProps(), visibleColumns, expanded })
                      : null}
                  </Fragment>
                );
              })
            ) : (
              <TableRow key="no-data">
                <TableCell colSpan={columns.length} style={{ textAlign: 'center' }}>
                  <FormattedMessage id="no-data-available" />
                </TableCell>
              </TableRow>
            )}
            {!hiddenPagination && (
              <TableRow key="pagination" sx={{ '&:hover': { bgcolor: 'transparent !important' } }}>
                <TableCell sx={{ p: 2, py: 3 }} colSpan={12}>
                  <TablePagination
                    gotoPage={gotoPage}
                    onRowsPerPage={handlePageSizeChange}
                    onPageChange={handlePageChange}
                    pageSize={pageSize}
                    pageIndex={pageIndex}
                    totalPages={totalPages}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Stack>
    </>
  );
};

export default GeneralizedTable;
