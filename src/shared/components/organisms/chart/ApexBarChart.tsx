import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { SkeletonBarChart } from 'shared/components/organisms/skeleton';

// third-party
import ReactApexChart, { Props as ChartProps } from 'react-apexcharts';

// types
import { ThemeMode } from 'shared/types/config';

//assets
import { InfoCircle } from 'iconsax-react';
import { Tooltip } from '@mui/material';

// ==============================|| APEXCHART - BAR ||============================== //

const ApexBarChart = ({
  barChartOptions,
  series,
  title,
  categories,
  titleY,
  titleX,
  desc
}: {
  barChartOptions: any;
  series: any;
  categories: any;
  title: string;
  titleY: string;
  titleX: string;
  desc?: string;
}) => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const line = theme.palette.divider;
  const { primary } = theme.palette.text;

  const successDark = theme.palette.success.main;

  const [options, setOptions] = useState<ChartProps>(barChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [
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
        }
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            colors: [primary, primary, primary, primary, primary, primary]
          }
        },
        title: {
          text: titleX,
          style: {
            color: '#000',
            fontSize: '12px',
            fontFamily: 'Inter var',
            fontWeight: 400,
            cssClass: 'apexcharts-yaxis-title'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: [primary, primary, primary, primary, primary, primary, primary, primary, primary, primary]
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
        }
      },
      grid: {
        borderColor: line
      },
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      },
      responsive: [
        {
          breakpoint: 600,
          options: {
            chart: {
              type: 'bar'
            },
            plotOptions: {
              bar: {
                horizontal: false
              }
            }
          }
        }
      ]
    }));
  }, [mode, primary, line, successDark, categories, titleX, titleY]);

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
      {series && series.length > 0 ? <ReactApexChart options={options} series={series} type="bar" height={350} /> : SkeletonBarChart()}
    </div>
  );
};

export default ApexBarChart;
