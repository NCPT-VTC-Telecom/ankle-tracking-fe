import { Box, CircularProgress } from '@mui/material';
import {
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Add, SearchNormal1 } from 'iconsax-react';
import { debounce } from 'lodash';
import { useCallback, useState } from 'react';
import { AttributesPropsSelectField } from 'shared/types';

interface SearchableSelectProps extends AttributesPropsSelectField {
  enableSearch?: boolean;
  onSearch?: (searchTerm: string) => void; // callback ra ngoài
  searchPlaceholder?: string;
  searchDelay?: number;
  defaultSearch?: string;
  loading?: boolean;
}

const SelectInputField = ({
  name,
  field,
  placeholder,
  formik,
  arrayOption,
  xs,
  md,
  sm,
  spacing,
  inputLabel,
  isDisabled,
  required,
  onAddClick,
  enableSearch = false,
  onSearch,
  searchPlaceholder = 'Tìm kiếm...',
  searchDelay = 300,
  defaultSearch,
  loading = false
}: SearchableSelectProps) => {
  const { errors, touched, getFieldProps, setFieldValue } = formik;
  const typeOfValue = typeof arrayOption[0]?.value;

  const [searchTerm, setSearchTerm] = useState(defaultSearch);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const error = errors[field];
  const touchedField = touched[field];

  // Debounce callback ra ngoài
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      if (!onSearch) return;
      onSearch(term);
    }, searchDelay),
    [onSearch, searchDelay]
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleClose = () => {
    setIsDropdownOpen(false);
    debouncedSearch('');
    setSearchTerm('');
  };

  return (
    <Grid item xs={xs || 12} sm={sm} md={md || 12}>
      <Stack direction={'column'} spacing={spacing || 1.25} alignItems={onAddClick ? 'start' : ''}>
        <Stack spacing={spacing || 1.25} width={'100%'}>
          <InputLabel htmlFor={name}>
            {inputLabel} {required ? <span className="text-red-500 text-[16px]"> *</span> : ''}
          </InputLabel>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <FormControl fullWidth error={Boolean(touchedField && error)}>
                <Select
                  MenuProps={{
                    autoFocus: false,
                    disableAutoFocus: true,
                    disableAutoFocusItem: true
                  }}
                  fullWidth
                  disabled={isDisabled || loading}
                  open={isDropdownOpen}
                  onOpen={() => setIsDropdownOpen(true)}
                  onClose={handleClose}
                  {...getFieldProps(field)}
                  onChange={(event: SelectChangeEvent<string>) => {
                    setFieldValue(field, event.target.value as string);
                    handleClose();
                  }}
                  input={<OutlinedInput />}
                  renderValue={(selected: string) => {
                    const selectedItem = arrayOption.find((option) => option.value === selected);
                    return selectedItem ? (
                      <Typography variant="body2" className="text-sm">
                        {selectedItem.label}
                      </Typography>
                    ) : (
                      <Typography variant="body2" className="text-sm">
                        {placeholder}
                      </Typography>
                    );
                  }}
                  endAdornment={
                    loading ? (
                      <CircularProgress size={20} sx={{ mr: 2 }} />
                    ) : formik.values[field] ? (
                      <span
                        className="text-xs"
                        style={{ cursor: 'pointer', marginRight: 20 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFieldValue(field, '');
                          setSearchTerm('');
                        }}
                      >
                        ✕
                      </span>
                    ) : null
                  }
                >
                  {/* Search input */}
                  {enableSearch && (
                    <Box
                      sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        backgroundColor: 'background.paper',
                        px: 1.5,
                        pt: 1,
                        pb: 1,
                        borderBottom: '1px solid #eee'
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchNormal1 size="16" />
                            </InputAdornment>
                          ),
                          endAdornment: searchTerm ? (
                            <InputAdornment
                              position="end"
                              style={{ cursor: 'pointer' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearchTerm('');
                                debouncedSearch('');
                              }}
                            >
                              ✕
                            </InputAdornment>
                          ) : null
                        }}
                      />
                    </Box>
                  )}

                  {enableSearch && <Divider />}

                  <MenuItem key={0} value={typeOfValue === 'string' ? '' : 0} disabled>
                    {placeholder}
                  </MenuItem>

                  {arrayOption.length === 0 ? (
                    <MenuItem disabled>
                      <Typography variant="subtitle1" color="text.secondary">
                        Không có kết quả
                      </Typography>
                    </MenuItem>
                  ) : (
                    arrayOption.map((option: any, index: number) => (
                      <MenuItem key={`option-${index}`} value={option.value}>
                        <ListItemText
                          primary={
                            <div className="flex justify-between mb-2">
                              <span>{option.label}</span>
                              {option.subPrimaryLabel && <span>{option.subPrimaryLabel}</span>}
                            </div>
                          }
                          secondary={option.secondaryLabel || null}
                        />
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </div>

            {onAddClick && (
              <div className="w-8 h-8 p-1 flex items-center justify-center cursor-pointer rounded-md bg-green-600" onClick={onAddClick}>
                <Add color="white" />
              </div>
            )}
          </div>

          {touched[field] && errors[field] && <FormHelperText error>{errors[field]}</FormHelperText>}
        </Stack>
      </Stack>
    </Grid>
  );
};

export default SelectInputField;
