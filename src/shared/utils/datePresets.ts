import dayjs from 'dayjs';
import { IntlShape } from 'react-intl';

export interface PresetRange {
    label: string;
    value: () => [dayjs.Dayjs, dayjs.Dayjs];
}

/**
 * Trả về presets cho RangePicker với đa ngôn ngữ
 * @param intl react-intl object
 */
export const getDatePresets = (intl: IntlShape): PresetRange[] => [
    {
        label: intl.formatMessage({ id: 'today' }),
        value: () => [dayjs(), dayjs()]
    },
    {
        label: intl.formatMessage({ id: 'yesterday' }),
        value: () => [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')]
    },
    {
        label: intl.formatMessage({ id: 'last-7-days' }),
        value: () => [dayjs().subtract(6, 'day'), dayjs()]
    },
    {
        label: intl.formatMessage({ id: 'last-30-days' }),
        value: () => [dayjs().subtract(29, 'day'), dayjs()]
    },
    {
        label: intl.formatMessage({ id: 'this-month' }),
        value: () => [dayjs().startOf('month'), dayjs().endOf('month')]
    },
    {
        label: intl.formatMessage({ id: 'last-month' }),
        value: () => [
            dayjs().subtract(1, 'month').startOf('month'),
            dayjs().subtract(1, 'month').endOf('month')
        ]
    }
];
