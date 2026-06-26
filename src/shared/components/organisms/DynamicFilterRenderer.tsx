import React from 'react';
import { FormControl, IconButton, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { Button } from '@mui/material';

const { RangePicker } = DatePicker;

export type FilterAction = {
    label?: string;
    icon?: React.ReactNode;
    onClick: () => void;
};


export type FilterConfig =
    | {
        key: string;
        label: string;
        type: 'select';
        value: string | null;
        onChange: (val: string | null) => void;
        options: { label: string | React.ReactNode; value: string }[];
        action?: FilterAction;
    }
    | {
        key: string;
        label: string;
        type: 'text';
        value: string;
        onChange: (val: string) => void;
        action?: FilterAction;
    }
    | {
        key: string;
        label: string;
        type: 'date';
        value: [dayjs.Dayjs | null, dayjs.Dayjs | null];
        onChange: (
            dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
            dateStrings: [string, string]
        ) => void;
        action?: FilterAction;
    };

interface Props {
    filters: FilterConfig[];
}

const DynamicFilterRenderer: React.FC<Props> = ({ filters }) => {

    return (
        <div className="flex flex-wrap gap-3 items-center">
            {filters.map((filter) => {
                const actionElement = filter.action ? (
                    filter.action.icon ? (
                        <IconButton onClick={filter.action.onClick} size="small">
                            {filter.action.icon}
                        </IconButton>
                    ) : (
                        <Button onClick={filter.action.onClick} size="small">
                            {filter.action.label}
                        </Button>
                    )
                ) : null;

                switch (filter.type) {
                    case 'select':
                        return (
                            <div className="flex items-center gap-2" key={filter.key}>
                                <FormControl sx={{ minWidth: 200 }}>
                                    <InputLabel id={`${filter.key}-label`}>{filter.label}</InputLabel>
                                    <Select
                                        labelId={`${filter.key}-label`}
                                        value={filter.value ?? ''}
                                        label={filter.label}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? null : e.target.value;
                                            filter.onChange(val);
                                        }}
                                    >
                                        {filter.options.map((opt) => (
                                            <MenuItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {actionElement}
                            </div>
                        );

                    case 'text':
                        return (
                            <div className="flex items-center gap-2" key={filter.key}>
                                <TextField
                                    label={filter.label}
                                    value={filter.value}
                                    onChange={(e) => filter.onChange(e.target.value)}
                                    sx={{ minWidth: 180 }}
                                />
                                {actionElement}
                            </div>
                        );

                    case 'date':
                        return (
                            <div className="flex items-center gap-2" key={filter.key}>
                                <RangePicker
                                    value={filter.value}
                                    onChange={filter.onChange}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #E0E3E6',
                                        borderRadius: '8px',
                                        minHeight: '48px',
                                        maxWidth: '320px',
                                    }}
                                />
                                {actionElement}
                            </div>
                        );

                    default:
                        return null;
                }
            })}
        </div>
    );
};

export default DynamicFilterRenderer;
