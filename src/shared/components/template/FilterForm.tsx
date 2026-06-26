import React from 'react';
import { Grid, Autocomplete, TextField } from '@mui/material';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { OptionList } from 'shared/types';

// Interface cho cấu hình field
export interface FieldConfig {
  type: 'dateRange' | 'autocomplete';
  key: string; // Key trong FilterValue
  label?: string;
  options?: OptionList[]; // Dành cho Autocomplete
  format?: string; // Dành cho RangePicker
  style?: React.CSSProperties; // Style tùy chỉnh
}

interface FilterValue {
  [key: string]: any; // Cho phép các key động
}

interface FilterFormProps {
  config: FieldConfig[];
  filterValue: FilterValue;
  setFilterValue: React.Dispatch<React.SetStateAction<FilterValue>>;
}

const FilterForm: React.FC<FilterFormProps> = ({ config, filterValue, setFilterValue }) => {
  const { RangePicker } = DatePicker;

  const renderField = (config: FieldConfig) => {
    switch (config.type) {
      case 'dateRange':
        return (
          <RangePicker
            format={config.format}
            onChange={(dates) => {
              if (dates) {
                const start_date = dates[0]?.format('YYYY/MM/DD');
                const end_date = dates[1]?.format('YYYY/MM/DD');
                setFilterValue((prev) => ({ ...prev, start_date, end_date }));
              }
            }}
            style={config.style}
            value={
              filterValue.start_date && filterValue.end_date ? [dayjs(filterValue.start_date), dayjs(filterValue.end_date)] : undefined
            }
          />
        );
      case 'autocomplete':
        return (
          <Autocomplete
            options={config.options || []}
            getOptionLabel={(option) => option.label as string}
            value={filterValue[config.key] as OptionList | null}
            onChange={(event, newValue) => {
              setFilterValue((prev) => ({ ...prev, [config.key]: newValue }));
            }}
            renderInput={(params) => <TextField {...params} label={config.label} variant="outlined" fullWidth />}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Grid container spacing={2} alignItems="center">
      {config.map((config, index) => (
        <Grid item xs={12} sm={4} key={index}>
          {renderField(config)}
        </Grid>
      ))}
    </Grid>
  );
};

export default FilterForm;
