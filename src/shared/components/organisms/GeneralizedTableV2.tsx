import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

// mui
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LoadingButton from 'shared/components/@extended/LoadingButton';

// react-table
import {
  Cell,
  HeaderGroup,
  Row,
  useExpanded,
  useFilters,
  useGlobalFilter,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable
} from 'react-table';

// project-imports
import ImportFileButton from 'shared/components/atoms/ImportFileButton';
import { CSVExport, HeaderSort, TablePagination } from 'shared/components/third-party/ReactTable';
import { GlobalFilter, renderFilterTypes } from 'shared/utils/react-table';
import DynamicFilterRenderer, { FilterConfig } from './DynamicFilterRenderer';

// icons
import { Add, Refresh } from 'iconsax-react';

// i18n
import useConfig from 'shared/hooks/useConfig';
import { FormattedMessage, useIntl } from 'react-intl';

// date
import { DatePicker } from 'antd';
import { GeneralizedTablePropsV2 } from 'shared/types';
import { getDatePresets } from 'shared/utils/datePresets';
const { RangePicker } = DatePicker;

// ---- Shared Select Filter ----
type SelectFilterProps<T extends string | number> = {
  label: string;
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (value: T | null) => void;
};

function SelectFilter<T extends string | number>({ label, value, options, onChange }: SelectFilterProps<T>) {
  return (
    <FormControl sx={{ minWidth: 120 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        sx={{ height: 40 }}
        value={value ?? ''}
        onChange={(e) => {
          const v = e.target.value === '' ? null : (e.target.value as T);
          onChange(v);
        }}
        label={label}
      >
        <MenuItem value="">
          <FormattedMessage id="all" />
        </MenuItem>
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// ---- Scroll Config ----
type ScrollConfig = {
  x?: number | string | true;
  y?: number | string;
};

// ---- Main Table ----
const GeneralizedTableV2 = ({
  columns,
  data,
  onAddNew,
  renderRowSubComponent,
  addButtonLabel,
  buttonRefresh,
  sortColumns,
  isDecrease = false,
  size,
  currentPage = 1,
  totalPages,
  totalResults,
  onPageChange,
  hiddenPagination,
  className,
  spacing,
  onRowClick,
  isLoading,
  onSearch,
  getDataExcel,
  dataHandlerExcel,
  handleExportExcel,
  handleExportFormat,
  onRefresh,
  statusOptions,
  onStatusFilterChange,
  floorOptions,
  onFloorFilterChange,
  typeOptions,
  defaultType = null,
  onTypeFilterChange,
  onDateChange,
  datesFilter,
  isLoadingRefresh,
  exportExcelBtn,
  canWrite = true,
  filterConfigs = [],
  hiddenFilter = false,
  sxContainer,
  scroll: _scroll = {}
}: GeneralizedTablePropsV2 & { scroll?: ScrollConfig }) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const scroll = { x: 1200, y: 'calc(100dvh - 310px)', ..._scroll };
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const { i18n } = useConfig();
  const [hasScrollX, setHasScrollX] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | number | null>(defaultType);

  const sortBy = { id: sortColumns || 'id', desc: isDecrease };
  const filterTypes = useMemo(() => renderFilterTypes, []);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    gotoPage,
    setPageSize,
    state: { pageSize }
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
    gotoPage(currentPage - 1);
  }, [currentPage]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkScroll = () => {
      setHasScrollX(container.scrollWidth > container.clientWidth);
    };

    checkScroll(); // kiểm tra ban đầu

    // observer để tự động update khi resize container
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  const handlePageChange = (newPage: number) => {
    gotoPage(newPage - 1);
    onPageChange?.(newPage, pageSize);
  };

  const handleChangeRowsPerPage = (newPageSize: number) => {
    setPageSize(newPageSize);
    gotoPage(0);
    onPageChange?.(1, newPageSize);
  };

  const cellStyle = {
    // overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };

  // Tính toán tổng width của các sticky columns
  const columnOffsets = new Map();

  let leftOffset = 0;
  columns.forEach((col: any) => {
    if (col.sticky === 'left') {
      columnOffsets.set(col.accessor || col.id, { left: leftOffset });
      leftOffset += col.width || 150;
    }
  });

  let rightOffset = 0;
  [...columns].reverse().forEach((col: any) => {
    if (col.sticky === 'right') {
      columnOffsets.set(col.accessor || col.id, { right: rightOffset });
      rightOffset += col.width || 150;
    }
  });

  const getColumnStyle = (col: any) => {
    if (!col.sticky) return {};
    const key = col.id;
    const offset = columnOffsets.get(key);

    const baseStyle: any = {
      position: 'sticky',
      zIndex: 12,
      backgroundColor: theme.palette.background.paper,
      boxSizing: 'border-box',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '30px',
        pointerEvents: 'none',
        transition: 'box-shadow 0.2s ease'
      }
    };

    if (col.sticky === 'left') {
      baseStyle.left = offset?.left ?? 0;
      baseStyle['&::after'] = {
        ...baseStyle['&::after'],
        right: 0,
        boxShadow: hasScrollX ? `inset 10px 0 8px -8px ${theme.palette.divider}` : 'none',
        transform: 'translateX(100%)'
      };
    }

    if (col.sticky === 'right') {
      baseStyle.right = offset?.right ?? 0;
      baseStyle['&::after'] = {
        ...baseStyle['&::after'],
        left: 0,
        boxShadow: hasScrollX ? `inset -10px 0 8px -8px ${theme.palette.divider}` : 'none',
        transform: 'translateX(-100%)'
      };
    }

    return baseStyle;
  };

  const getCellStyle = (col: any, rowIndex?: number) => {
    if (!col.sticky) return {};
    const key = col.id;
    const offset = columnOffsets.get(key);

    const baseRowColor = theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.common.white;
    const altRowColor = theme.palette.mode === 'dark' ? theme.palette.secondary[200] : theme.palette.grey[100];

    const bgColor = typeof rowIndex === 'number' && rowIndex % 2 === 0 ? baseRowColor : altRowColor;

    const baseStyle: any = {
      borderBottom: `1px solid ${theme.palette.divider}`,
      position: 'sticky',
      zIndex: 11,
      backgroundColor: bgColor,
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '30px',
        pointerEvents: 'none',
        transition: 'box-shadow 0.3s ease'
      }
    };

    if (col.sticky === 'left') {
      baseStyle.left = offset?.left ?? 0;
      baseStyle['&::after'] = {
        ...baseStyle['&::after'],
        right: 0,
        boxShadow: hasScrollX ? `inset 10px 0 8px -8px ${theme.palette.divider}` : 'none',
        transform: 'translateX(100%)'
      };
    }

    if (col.sticky === 'right') {
      baseStyle.right = offset?.right ?? 0;
      baseStyle['&::after'] = {
        ...baseStyle['&::after'],
        left: 0,
        boxShadow: hasScrollX ? `inset -10px 0 8px -8px ${theme.palette.divider}` : 'none',
        transform: 'translateX(-100%)'
      };
    }

    return baseStyle;
  };

  return (
    <Stack spacing={spacing || 3}>
      {/* Filters + Actions */}
      {!hiddenFilter && (
        <Stack
          direction={matchDownSM ? 'column' : 'row'}
          spacing={1}
          justifyContent="space-between"
          alignItems={matchDownSM ? 'flex-start' : 'center'}
          sx={{ p: '20px', pb: 0 }}
        >
          <div className={matchDownSM ? 'flex flex-col gap-2' : 'flex flex-row gap-2'}>
            <div className="flex items-center gap-2">
              <div className="">{onSearch && <GlobalFilter searchFilter={onSearch} />}</div>
              {addButtonLabel && (
                <Button
                  disabled={!canWrite}
                  variant="contained"
                  startIcon={<Add />}
                  onClick={onAddNew}
                  size="small"
                  className="justify-end flex flex-nowrap md:hidden !m-0 h-10"
                >
                  <span className="line-clamp-1"> {addButtonLabel}</span>
                </Button>
              )}
            </div>

            {datesFilter && (
              <RangePicker
                format={i18n === 'vi' ? 'DD/MM/YYYY' : 'MM/DD/YYYY'}
                onChange={onDateChange}
                value={datesFilter}
                placeholder={[intl.formatMessage({ id: 'departure_start' }), intl.formatMessage({ id: 'departure_end' })]}
                style={{ minHeight: 40, maxWidth: 320 }}
                presets={isMobile ? undefined : getDatePresets(intl)}
              />
            )}

            {statusOptions && (
              <SelectFilter
                label={intl.formatMessage({ id: 'status' })}
                value={selectedStatus}
                options={statusOptions}
                onChange={(v) => {
                  setSelectedStatus(v as number | null);
                  onStatusFilterChange?.(v as number);
                }}
              />
            )}

            {floorOptions && (
              <SelectFilter
                label={intl.formatMessage({ id: 'floor' })}
                value={selectedFloor}
                options={floorOptions}
                onChange={(v) => {
                  setSelectedFloor(v as string | null);
                  onFloorFilterChange?.(v);
                }}
              />
            )}

            {typeOptions && (
              <SelectFilter
                label={intl.formatMessage({ id: 'type' })}
                value={selectedType}
                options={typeOptions}
                onChange={(v) => {
                  setSelectedType(v as string | null);
                  onTypeFilterChange?.(v);
                }}
              />
            )}

            {filterConfigs?.length > 0 && <DynamicFilterRenderer filters={filterConfigs as FilterConfig[]} />}
          </div>

          {/* Right side actions */}
          <Stack direction={matchDownSM ? 'column' : 'row'} alignItems={matchDownSM ? 'flex-start' : 'center'} gap={1} spacing={2}>
            {dataHandlerExcel && getDataExcel && (
              <ImportFileButton labelButton="import-excel" getDataExcel={getDataExcel} dataHandler={dataHandlerExcel} />
            )}

            {/* {totalResults && totalResults > 0 && (
              <Typography variant="body2">{intl.formatMessage({ id: 'total-results' }) + ' ' + totalResults}</Typography>
            )} */}

            {handleExportExcel && handleExportFormat && (
              <CSVExport onClickExportExcel={handleExportExcel} onClickExportFormat={handleExportFormat} />
            )}

            {buttonRefresh && onRefresh && (
              <LoadingButton
                className="h-10"
                loading={isLoadingRefresh}
                variant="outlined"
                startIcon={<Refresh />}
                onClick={onRefresh}
                size="small"
              >
                {buttonRefresh}
              </LoadingButton>
            )}

            {addButtonLabel && (
              <Button
                disabled={!canWrite}
                variant="contained"
                startIcon={<Add />}
                onClick={onAddNew}
                size="small"
                className="justify-end hidden md:inline-flex !m-0 h-10"
              >
                {addButtonLabel}
              </Button>
            )}
            {exportExcelBtn}
          </Stack>
        </Stack>
      )}

      {/* Table Container */}
      <TableContainer
        ref={containerRef}
        sx={{
          ...sxContainer,
          maxHeight: typeof scroll?.y === 'string' ? scroll.y : scroll?.y ? `${scroll.y}px` : 'auto',
          overflowX: scroll?.x ? 'auto' : 'hidden',
          overflowY: scroll?.y ? 'auto' : 'visible',
          width: '100%',
          // borderRadius: 1,
          p: 0,
          m: 0
        }}
      >
        <Table
          className={className}
          {...getTableProps()}
          sx={{
            minWidth:
              scroll?.x === true
                ? 1400
                : typeof scroll?.x === 'number'
                ? `${scroll.x}px`
                : typeof scroll?.x === 'string'
                ? scroll.x
                : 'auto',

            '& thead': {
              position: 'sticky',
              top: 0,
              zIndex: 13
            },
            '& th': {
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary
            }
          }}
        >
          {/* ====== TABLE HEAD ====== */}
          <TableHead>
            {headerGroups.map((hg: HeaderGroup<{}>, hgIndex) => (
              <TableRow {...hg.getHeaderGroupProps()} key={`header-group-${hgIndex}`} sx={{ '& > th:first-of-type': { width: '58px' } }}>
                {hg.headers.map((col: any, colIndex) => (
                  <TableCell
                    {...col.getHeaderProps()}
                    key={`header-${hgIndex}-${colIndex}`}
                    align={col.align || 'center'}
                    sx={{
                      ...cellStyle,
                      width: col.width || 'auto',
                      minWidth: col.width || 120,
                      ...getColumnStyle(col)
                    }}
                  >
                    <HeaderSort column={col} sort />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>

          {/* ====== TABLE BODY ====== */}
          <TableBody {...getTableBodyProps()}>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((_, ci) => (
                    <TableCell key={`skeleton-cell-${i}-${ci}`}>
                      <Skeleton animation="wave" height={30} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : page.length > 0 ? (
              page.map((row: Row, i: number) => {
                prepareRow(row);
                const { key, ...props } = row.getRowProps();
                return (
                  <Fragment key={`row-${i}`}>
                    <TableRow
                      key={key}
                      {...props}
                      onClick={() => {
                        row.toggleRowSelected();
                        onRowClick?.(row.original);
                      }}
                      sx={{
                        backgroundColor:
                          i % 2 === 1
                            ? theme.palette.secondary[200] // dòng xen kẽ
                            : theme.palette.background.paper,
                        cursor: 'pointer',
                        '&:hover td': {
                          bgcolor: theme.palette.mode === 'dark' ? theme.palette.secondary[200] : theme.palette.grey[100]
                        }
                      }}
                    >
                      {row.cells.map((cell: Cell, ci) => {
                        const col = cell.column as any;
                        return (
                          <TableCell
                            {...cell.getCellProps()}
                            key={`cell-${i}-${ci}`}
                            align={col.align || 'left'}
                            sx={{
                              ...cellStyle,
                              width: col.width || 'auto',
                              minWidth: col.width || 120,
                              ...(col.sticky && { position: 'relative' }),
                              ...getCellStyle(col, i)
                            }}
                          >
                            {typeof cell.value === 'string' && cell.value.length > 30 ? (
                              <Tooltip title={<div>{cell.render('Cell')}</div>} arrow placement="top">
                                <Box
                                  sx={{
                                    // overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {cell.render('Cell')}
                                </Box>
                              </Tooltip>
                            ) : (
                              <div>{cell.render('Cell')}</div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>

                    {/* Expand Row */}
                    {row.isExpanded && renderRowSubComponent?.({ row })}
                  </Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <FormattedMessage id="no-data-available" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {!hiddenPagination && (
        <div className="pb-3 px-5">
          <TablePagination
            totalResults={totalResults}
            gotoPage={gotoPage}
            onPageChange={handlePageChange}
            onRowsPerPage={handleChangeRowsPerPage}
            pageSize={pageSize}
            pageIndex={currentPage - 1}
            totalPages={totalPages}
          />
        </div>
      )}
    </Stack>
  );
};

export default GeneralizedTableV2;
