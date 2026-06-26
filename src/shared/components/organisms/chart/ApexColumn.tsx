import { useEffect, useState } from 'react';

// project-import
import { useTheme } from '@mui/material/styles';
import { Tooltip } from '@mui/material';
import { SkeletonChart } from 'shared/components/organisms/skeleton';

// third-party
import ReactApexChart, { Props as ChartProps } from 'react-apexcharts';

// types
import { ThemeMode } from 'shared/types/config';

//assets
import { InfoCircle } from 'iconsax-react';

// ==============================|| APEXCHART - COLUMN ||============================== //

const ApexColumnChart = ({
  columnChartOptions,
  series,
  title,
  categories,
  titleY,
  titleX,
  desc
}: {
  columnChartOptions: any;
  series: any;
  categories: any;
  titleY: string;
  titleX: string;
  title?: string;
  desc?: string;
}) => {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const { primary } = theme.palette.text;
  const line = theme.palette.divider;
  const grey200 = theme.palette.secondary[200];

  const secondary = theme.palette.primary[700];
  const primaryMain = theme.palette.primary.main;
  const successDark = theme.palette.success.main;

  const [options, setOptions] = useState<ChartProps>(columnChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      ...columnChartOptions, // Spread the entire columnChartOptions first
      plotOptions: {
        ...columnChartOptions.plotOptions, // Spread existing plotOptions in case other options exist
        bar: {
          horizontal: false,
          ...columnChartOptions.plotOptions?.bar // Ensure we keep any existing bar options like `stacked: true`
        }
      },
      colors: [
        '#18538C',
        '#A6D3FE',
        '#D9D9D9',
        '#006FDB',
        '#548CC3',
        '#4A96DF',
        '#347BC0',
        '#4393E0',
        '#DEDEDE',
        '#89D7AE',
        '#FF8FCF',
        '#FFE6AD',
        '#D7BFEA',
        '#D9E7ED',
        '#FFD68C',
        '#A3DAB4',
        '#ED88B6',
        '#EFDEA5',
        '#B5A3D4',
        '#B4D3C8',
        '#FFEDB0',
        '#B8D1A5',
        '#18538C',
        '#4A96DF',
        '#006FDB',
        '#548CC3',
        '#347BC0',
        '#4393E0',
        '#A6D3FE',
        '#DEDEDE',
        '#D9D9D9'
      ],
      chart: {
        toolbar: {
          show: false
        },
        ...columnChartOptions.chart // Merge other chart options
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            colors: [primary, primary, primary, primary, primary, primary, primary, primary, primary]
          }
        },
        title: {
          text: titleX,
          style: {
            color: '#000',
            fontSize: '12px',
            fontFamily: 'Inter var',
            fontWeight: 400,
            cssClass: 'apexcharts-xaxis-title'
          }
        },
        ...columnChartOptions.xaxis // Merge other xaxis options
      },
      yaxis: {
        labels: {
          style: {
            colors: [primary]
          }
        },
        title: {
          text: titleY,
          style: {
            color: '#000',
            fontSize: '12px',
            fontFamily: 'Inter var',
            fontWeight: 400,
            cssClass: 'apexcharts-yaxis-title'
          }
        },
        ...columnChartOptions.yaxis // Merge other yaxis options
      },
      grid: {
        borderColor: line,
        ...columnChartOptions.grid // Merge other grid options
      },
      legend: {
        labels: {
          colors: 'secondary.main'
        },
        ...columnChartOptions.legend // Merge other legend options
      },
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light',
        ...columnChartOptions.theme // Merge other theme options
      }
    }));
  }, [mode, primary, line, grey200, secondary, primaryMain, successDark, categories, titleX, titleY, columnChartOptions]);

  return (
    <div id="chart">
      <h2 className="flex gap-2">
        {title}
        {desc && (
          <Tooltip title={desc} arrow>
            <InfoCircle className="h-5 w-5 cursor-pointer" />
          </Tooltip>
        )}
      </h2>
      {series && series.length > 0 ? <ReactApexChart options={options} series={series} type="bar" height={350} /> : SkeletonChart()}
    </div>
  );
};

export default ApexColumnChart;
