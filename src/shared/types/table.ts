import React, { ChangeEvent, FC, ReactNode, SyntheticEvent } from 'react';

// material-ui
import { SxProps, TableCellProps } from '@mui/material';
import { Column } from 'react-table';
// types
import { FilterConfig } from 'shared/components/organisms/DynamicFilterRenderer';
import { NoUndefinedRangeValueType } from 'rc-picker/lib/PickerInput/RangePicker';
import { KeyedObject } from './root';

// ==============================|| TYPES - TABLES  ||============================== //

export type ArrangementOrder = 'asc' | 'desc' | undefined;

export type GetComparator = (o: ArrangementOrder, o1: string) => (a: KeyedObject, b: KeyedObject) => number;

export interface EnhancedTableHeadProps extends TableCellProps {
  onSelectAllClick: (e: ChangeEvent<HTMLInputElement>) => void;
  order: ArrangementOrder;
  orderBy?: string;
  numSelected: number;
  rowCount: number;
  onRequestSort: (e: SyntheticEvent, p: string) => void;
}

export interface EnhancedTableToolbarProps {
  numSelected: number;
}

export type HeadCell = {
  id: string;
  numeric: boolean;
  label: string;
  disablePadding?: string | boolean | undefined;
  align?: 'left' | 'right' | 'inherit' | 'center' | 'justify' | undefined;
};

export interface GeneralizedTableProps {
  columns: Column[];
  data: any[];
  searchFilter?: any;
  handleAdd?: () => void;
  isLoading?: boolean;
  renderRowSubComponent?: FC<any>;
  onRowClick?: any;
  csvFilename?: string;
  addButtonLabel?: any;
  buttonRefresh?: string;
  sortColumns?: string;
  isDecrease?: boolean;
  size?: number;
  isReload?: boolean;
  totalPages?: any;
  totalResults?: any;
  onPageChange?: any;
  onRowExpandedChange?: any;
  hiddenPagination?: boolean;
  className?: string;
  spacing?: number;
  getDataExcel?: (data: any) => void;
  dataHandlerExcel?: any;
  handleExportExcel?: () => void;
  handleExportFormat?: () => void;
  handleRefresh?: (isRefresh: boolean) => void;
  statusOptions?: { label: string; value: string | number }[]; // Options for status dropdown
  onStatusFilterChange?: (statusId: number | null) => void; // Callback for status filter change
  floorOptions?: { label: string; value: string }[]; // Options for floor dropdown
  onFloorFilterChange?: (statusId: string | null) => void; // Callback for floor filter change
  typeOptions?: { label: string; value: string }[]; // Options for type dropdown
  onTypeFilterChange?: (statusId: string | null) => void; // Callback for status filter change
  handleDateFilter?: (dates: any, dateStrings: [string, string]) => void;
  dateFilter?: any;
  isLoadingRefresh?: boolean;
  defaultType?: any;
  exportExcelBtn?: React.ReactNode;
  canWrite?: boolean;
  filterConfigs?: FilterConfig[];
}

export interface ColumnActionsProps {
  row: any;
  handleAdd: () => void;
  handleClose: () => void;
  setCustomer: (customer: any) => void;
  setCustomerDelete: (customer: any) => void;
}

export interface ColsTableProps {
  currentPage: number;
  pageSize: number;
  handleAdd: () => void;
  handleClose: () => void;
  getRecordView?: (record: any) => void;
  getRecordEdit?: (record: any) => void;
  getRecordDelete?: (record: any) => void;
  hiddenView?: boolean;
  hiddenEdit?: boolean;
  hiddenDelete?: boolean;
}


export interface FilterOption<T = string | number> {
  label: string;
  value: T;
}

export interface GeneralizedTablePropsV2<T extends object = any> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;

  // Search + filter
  onSearch?: (value: string) => void;
  statusOptions?: FilterOption[];
  onStatusFilterChange?: (statusId: number | null) => void;
  floorOptions?: FilterOption<string>[];
  onFloorFilterChange?: (floorId: string | null) => void;
  typeOptions?: FilterOption<string>[];
  onTypeFilterChange?: (typeId: string | number | null) => void;
  onDateChange?: (dates: NoUndefinedRangeValueType<T> | null, dateStrings: [string, string]) => void;
  datesFilter?: any;
  filterConfigs?: FilterConfig[];

  // Table row
  renderRowSubComponent?: FC<{ row: T }>;
  onRowClick?: (row: T) => void;
  onRowExpandedChange?: (expandedRows: T[]) => void;

  // Pagination
  totalPages?: number;
  totalResults?: number;
  onPageChange?: (page: number, newPageSize: number) => void;
  hiddenPagination?: boolean;
  hiddenFilter?: boolean
  size?: number;
  currentPage: number;
  sxContainer?: SxProps

  // Actions
  onAddNew?: () => void;
  addButtonLabel?: string;
  buttonRefresh?: string;
  onRefresh?: () => void;
  isReload?: boolean;
  isLoadingRefresh?: boolean;
  canWrite?: boolean;

  // Export
  getDataExcel?: (data: T[]) => void;
  dataHandlerExcel?: (data: T[]) => T[];
  handleExportExcel?: () => void;
  handleExportFormat?: () => void;
  exportExcelBtn?: ReactNode;

  // Other
  sortColumns?: string;
  isDecrease?: boolean;
  defaultType?: string | number | null;
  className?: string;
  spacing?: number;
}