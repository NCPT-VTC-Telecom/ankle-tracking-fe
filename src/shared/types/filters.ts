export interface FilterConfig {
  key: string;
  label: string;
  options: { label: string; value: any }[];
}

export interface FilterCollapseProps {
  filterConfig: FilterConfig[];
  onFilterApply: (filters: Record<string, any>) => void;
  onFilterReset: () => void;
}
