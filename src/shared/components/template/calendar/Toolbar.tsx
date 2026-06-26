import { useState, useEffect } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import { useMediaQuery, Button, ButtonGroup, Grid, Stack, Tooltip, Typography, GridProps } from '@mui/material';

// third-party
import { format } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';

// project-imports
import IconButton from 'shared/components/@extended/IconButton';

// assets
import { ArrowLeft2, ArrowRight2, Calendar1, Category, Grid6, TableDocument } from 'iconsax-react';
import { FormattedMessage, useIntl } from 'react-intl';
import useConfig from 'shared/hooks/useConfig';

// constant
const viewOptions = [
  {
    label: 'month',
    value: 'dayGridMonth',
    icon: Category
  },
  {
    label: 'week',
    value: 'timeGridWeek',
    icon: Grid6
  },
  {
    label: 'day',
    value: 'timeGridDay',
    icon: Calendar1
  },
  {
    label: 'agenda',
    value: 'listWeek',
    icon: TableDocument
  }
];

// ==============================|| CALENDAR - TOOLBAR ||============================== //

export interface ToolbarProps {
  date: number | Date;
  view: string;
  onClickNext: () => void;
  onClickPrev: () => void;
  onClickToday: () => void;
  onChangeView: (s: string) => void;
  sx?: GridProps['sx'];
}

const localeMap = {
  en: enUS,
  vi: vi
};

const Toolbar = ({ date, view, onClickNext, onClickPrev, onClickToday, onChangeView, sx, ...others }: ToolbarProps) => {
  const matchDownSM = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const intl = useIntl();
  const { i18n } = useConfig();
  const [viewFilter, setViewFilter] = useState(viewOptions);

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const DateDisplay = ({ date }: { date: number | Date }) => {
    const formattedDate = format(date, 'MMMM yyyy', { locale: localeMap[i18n] });
    const capitalizedDate = capitalizeFirstLetter(formattedDate);

    return <>{capitalizedDate}</>;
  };

  useEffect(() => {
    if (matchDownSM) {
      const filter = viewOptions.filter((item) => item.value !== 'dayGridMonth' && item.value !== 'timeGridWeek');
      setViewFilter(filter);
    } else {
      setViewFilter(viewOptions);
    }
  }, [matchDownSM]);

  return (
    <Grid alignItems="center" container justifyContent="space-between" spacing={matchDownSM ? 1 : 3} {...others} sx={{ pb: 3 }}>
      <Grid item>
        <Button variant="outlined" onClick={onClickToday} size={matchDownSM ? 'small' : 'medium'}>
          <FormattedMessage id="today" />
        </Button>
      </Grid>
      <Grid item>
        <Stack direction="row" alignItems="center" spacing={matchDownSM ? 1 : 3}>
          <IconButton onClick={onClickPrev} size={matchDownSM ? 'small' : 'large'}>
            <ArrowLeft2 />
          </IconButton>
          <Typography variant={matchDownSM ? 'h5' : 'h3'} color="textPrimary">
            <DateDisplay date={date} />
          </Typography>
          <IconButton onClick={onClickNext} size={matchDownSM ? 'small' : 'large'}>
            <ArrowRight2 />
          </IconButton>
        </Stack>
      </Grid>
      <Grid item>
        <ButtonGroup variant="outlined" aria-label="outlined button group">
          {viewFilter.map((viewOption) => {
            const Icon = viewOption.icon;
            return (
              <Tooltip title={intl.formatMessage({ id: viewOption.label })} key={viewOption.value}>
                <Button
                  size={matchDownSM ? 'small' : 'large'}
                  disableElevation
                  variant={viewOption.value === view ? 'contained' : 'outlined'}
                  onClick={() => onChangeView(viewOption.value)}
                >
                  <Icon variant={viewOption.value === view ? 'Bold' : 'Linear'} />
                </Button>
              </Tooltip>
            );
          })}
        </ButtonGroup>
      </Grid>
    </Grid>
  );
};

export default Toolbar;
