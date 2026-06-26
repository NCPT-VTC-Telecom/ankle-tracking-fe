import { useEffect, useState } from 'react';

// material-ui
import { Skeleton, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// third-party
import ReactApexChart, { Props as ChartProps } from 'react-apexcharts';
import { ThemeMode } from 'shared/types/config';

//assets
import { InfoCircle } from 'iconsax-react';
import { FormattedMessage } from 'react-intl';
import emptyBoxImg from 'assets/images/empty-box.png';
// ==============================|| APEXCHART - PIE/DONUT ||============================== //

const ApexPieDonutChart = ({
  chartOptions,
  series,
  title,
  labels,
  titleY,
  titleX,
  desc,
  loading = false
}: {
  chartOptions: any;
  series: any;
  title?: string;
  labels: any;
  titleY?: string;
  titleX?: string;
  desc?: string;
  loading?: boolean;
}) => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const line = theme.palette.divider;
  const { primary } = theme.palette.text;

  const successDark = theme.palette.success.main;

  const [options, setOptions] = useState<ChartProps>(chartOptions);

  useEffect(() => {
    setOptions((prevState) => {
      const updatedOptions = {
        ...prevState,
        colors: prevState.colors || [
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
        labels: labels,
        chart: {
          toolbar: {
            show: false
          },
          ...prevState.chart // Giữ nguyên các thuộc tính chart từ chartOptions
        },
        xaxis: {
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
          }
        },
        grid: {
          borderColor: line
        },
        legend: {
          ...prevState.legend,
          position: prevState.legend?.position || 'bottom',
          fontSize: prevState.legend?.fontSize || '13px',
          labels: {
            colors: theme.palette.text.secondary,
            ...prevState.legend?.labels
          }
        },
        theme: {
          mode: mode === ThemeMode.DARK ? 'dark' : 'light'
        },
        tooltip: {
          ...prevState.tooltip // Giữ nguyên toàn bộ cấu hình tooltip từ chartOptions
        }
      };
      return updatedOptions;
    });
  }, [mode, primary, line, successDark, labels, titleX, titleY]);

  return (
    <div id="chart">
      <Typography sx={{ fontWeight: 700 }} variant="h6">
        {title}
        {desc && (
          <Tooltip title={desc} arrow>
            <InfoCircle className="h-5 w-5 cursor-pointer" />
          </Tooltip>
        )}
      </Typography>
      
      {loading ? (
        // Loading skeleton
        <div className="h-[350px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Skeleton variant="circular" width={200} height={200} animation="wave" />
            <div className="flex gap-4">
              <Skeleton variant="rectangular" width={80} height={12} animation="wave" />
              <Skeleton variant="rectangular" width={80} height={12} animation="wave" />
              <Skeleton variant="rectangular" width={80} height={12} animation="wave" />
            </div>
          </div>
        </div>
      ) : series && series.length > 0 && series.some((value: number) => value > 0) ? (
        // Chart with data
        <ReactApexChart options={options} series={series} type="donut" height={350} />
      ) : (
        // No data message
        <div className="h-[350px] flex flex-col items-center justify-center gap-5">
          <img src={emptyBoxImg} width={180} />
          <div className="flex flex-col items-center">
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              <FormattedMessage id="no-data" defaultMessage="No Data" />
            </Typography>
            <Typography variant="body1" color="text.secondary">
              <FormattedMessage id="insufficient-data-message" defaultMessage="Insufficient data to render chart" />
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApexPieDonutChart;
