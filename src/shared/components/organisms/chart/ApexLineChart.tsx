import { useEffect, useState } from 'react';
// material-ui
import { useTheme } from '@mui/material/styles';
import { Tooltip } from '@mui/material';
import { SkeletonLineChart } from 'shared/components/organisms/skeleton';

// third-party
import ReactApexChart, { Props as ChartProps } from 'react-apexcharts';

// types
import { ThemeMode } from 'shared/types/config';

//assets
import { InfoCircle } from 'iconsax-react';

// ==============================|| APEXCHART - LINE ||============================== //

const ApexLineChart = ({
  chartOptions,
  series,
  title,
  categories,
  titleY,
  titleX,
  desc
}: {
  chartOptions: any;
  series: any;
  categories: any;
  title?: string;
  titleY?: string;
  titleX?: string;
  desc?: string;
}) => {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const line = theme.palette.divider;
  const { primary } = theme.palette.text;
  const grey200 = theme.palette.secondary[200];
  const secondary = theme.palette.primary[700];

  // const [series] = useState([
  //   {
  //     name: 'Desktops',
  //     data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
  //   }
  // ]);

  const [options, setOptions] = useState<ChartProps>(chartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
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
        }
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
      }
    }));
  }, [mode, primary, line, grey200, secondary, categories, titleX, titleY]);

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
      {series && series.length > 0 ? <ReactApexChart options={options} series={series} type="line" height={350} /> : SkeletonLineChart()}
    </div>
  );
};

export default ApexLineChart;
