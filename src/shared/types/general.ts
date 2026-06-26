export interface OptionList {
  label: string | React.ReactNode;
  value: number | string;
  secondaryLabel?: string;
  subPrimaryLabel?: string;
}

//Filter
export interface FilterItem {
  key: string;
  optionList: OptionList[];
}

export interface FiltersConfig {
  key: string;
  filterItem: FilterItem[];
}

export interface ChartData {
  series: { name: string; data: number[] }[];
  categories: string[];
}

export interface FieldConfig {
  name: string;
  label: string;
  type:
  | 'text'
  | 'email'
  | 'password'
  | 'select'
  | 'auto-complete'
  | 'date'
  | 'number'
  | 'checkbox'
  | 'categories'
  | 'switch'
  | 'checkmark'
  | 'rangeDatePicker'
  | 'timeRange'
  | 'map';
  placeholder?: string;
  options?: OptionList[]; // Only for select fields
  required?: boolean;
  unit?: string;
  md?: number; // Grid size
  row?: number; // For text area
  future?: boolean;
  past?: boolean;
  readOnly?: boolean;
  startDate?: string;
  endDate?: string;
  secondField?: string;
  customRender?: (formik: any) => React.ReactNode;
  enableSearch?: boolean,
  searchApi?: (searchTerm: string) => Promise<any[]>;
  loading?: boolean
}

export interface StepConfig {
  label: string;
  fields: FieldConfig[];
}
