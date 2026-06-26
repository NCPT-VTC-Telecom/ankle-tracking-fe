import React, { useState } from 'react';
import { Card, CardContent, Grid, Stack, Typography, Box, IconButton, Tooltip } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { GroupedFieldConfig } from 'shared/components/ul-config/view-dialog-config';
import { Eye, EyeSlash } from 'iconsax-react';

const getNestedValue = (obj: Record<string, any> | null, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
};

interface FieldGroupCardProps {
  group: GroupedFieldConfig;
  record: Record<string, any> | null;
  theme: any;
  sensitiveFields?: string[];
}

const FieldGroupCard: React.FC<FieldGroupCardProps> = ({ group, record, theme, sensitiveFields }) => {
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});

  const toggleVisibility = (key: string) => {
    setVisibleFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Grid item md={group.md || 12} key={group.title}>
      <Card sx={{ height: '100%', boxShadow: 'none' }} className="bg-slate-50">
        <CardContent sx={{ padding: '20px' }}>
          {/* Group Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {group.icon && <Typography variant="h6">{group.icon}</Typography>}
            <Typography variant="h5" sx={{ fontWeight: 500, color: theme.palette.primary.main, mb: 2 }}>
              <FormattedMessage id={group.title} defaultMessage={group.title} />
            </Typography>
          </Box>

          {/* Fields Grid */}
          <Grid container spacing={1}>
            {group.fields.map((field) => {
              const charLimit = 30;
              const rawValue = getNestedValue(record, field.key);
              const isSensitive = sensitiveFields?.includes(field.key);
              const showValue = visibleFields[field.key] || !isSensitive;
              const displayValue = field.transform
                ? field.transform(rawValue)
                : isSensitive
                ? showValue
                  ? rawValue
                  : typeof rawValue === 'string'
                  ? '*'.repeat(rawValue?.length + 3)
                  : '**************' // fallback nếu không phải string
                : formatValue(rawValue);
              const isOverflowed = displayValue?.length > charLimit;

              return (
                <Grid item xs={12} key={field.key}>
                  <Stack flexDirection="row" justifyContent="space-between" alignItems="center" gap={2}>
                    <Typography
                      className="whitespace-nowrap"
                      variant="subtitle1"
                      sx={{ fontWeight: 500, color: theme.palette.text.secondary }}
                    >
                      <FormattedMessage id={field.label} defaultMessage={field.label} />:
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title={isOverflowed ? displayValue : null}>
                        <Typography
                          className="line-clamp-1"
                          variant="body1"
                          sx={{
                            fontWeight: 400,
                            color: theme.palette.text.primary,
                            width: 'fit-content',
                            wordBreak: 'break-word',
                            cursor: isSensitive ? 'pointer' : 'default'
                          }}
                        >
                          {displayValue}
                        </Typography>
                      </Tooltip>

                      {isSensitive && (
                        <Tooltip title={visibleFields[field.key] ? 'Hide' : 'Show'}>
                          <IconButton size="small" onClick={() => toggleVisibility(field.key)}>
                            {visibleFields[field.key] ? <EyeSlash fontSize="small" /> : <Eye fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default FieldGroupCard;
