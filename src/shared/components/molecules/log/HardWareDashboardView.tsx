import { BarChart, ColumnChart, LineChart } from 'shared/components/organisms/chart';

interface PropTypes {
  activeTab: 'alert' | 'event';
}

const HardwareDashboardView = ({ activeTab }: PropTypes) => {
  // const { fetchDataChart, dataChart } = useHandleLogsHardware({initQuery:un});

  // useEffect(() => {
  //   fetchDataChart();
  // }, []);
  const categories = [
    '2025-05-06 07:00',
    '2025-05-12 07:00',
    '2025-05-18 07:00',
    '2025-05-24 07:00',
    '2025-05-30 07:00',
    '2025-06-05 07:00',
    '2025-06-11 07:00'
  ];

  // console.log(dataChart);

  const columnChartCategories = ['Critical', 'Error', 'Warning', 'Info'];

  const series = [
    {
      name: `${activeTab == 'alert' ? 'Alerts' : 'Events'}`,
      data: [0, 0, 0, 60, 150, 220, 40]
    }
  ];

  // Cấu hình chart
  const chartOptions = {
    chart: {
      type: 'line',
      zoom: { enabled: false }
    },
    title: {
      text: `${activeTab == 'alert' ? 'Alert' : 'Event'} Summary`,
      align: 'left'
    },
    xaxis: {
      type: 'category',
      categories,
      labels: {
        rotate: -45,
        format: 'MMM dd, yyyy hh:mm a' // optional nếu là datetime
      }
    },
    yaxis: {
      min: 0,
      tickAmount: 5
    },
    stroke: {
      curve: 'smooth'
    },
    markers: {
      size: 5
    },
    dataLabels: {
      enabled: true
    }
  };

  const columnChartSeries = [
    {
      name: 'Resolved',
      data: [0, 1546, 2604, 0],
      color: '#D3D3D3' // màu xám nhạt
    },
    {
      name: 'Unresolved',
      data: [0, 0, 480, 0],
      color: '#FFCC00' // màu vàng
    }
  ];

  const columnChartOptions = {
    chart: {
      type: 'bar',
      stacked: true
    },
    title: {
      text: `Unresolved/Resolved ${activeTab == 'alert' ? 'Alerts' : 'Events'}`,
      align: 'left'
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%'
      }
    },
    xaxis: {
      categories: columnChartCategories
    },

    legend: {
      position: 'top'
    },
    dataLabels: {
      enabled: true
    }
  };

  const dataBarChart = [
    { name: 'SW_DA-3RD-1-1', value: 21 },
    { name: 'SW_DA-1ST-1-3', value: 89 },
    { name: 'SW_DA-1ST-2-4', value: 30 },
    { name: 'SW_DA-2ND-1-3', value: 14 },
    { name: 'SW_DA-2ND-1-4', value: 14 },
    { name: 'SW_DA-3RD-2-1', value: 35 },
    { name: 'SW_DA-1ST-3-1', value: 62 },
    { name: 'SW_DA-2ND-2-3', value: 25 },
    { name: 'SW_DA-1ST-4-2', value: 18 },
    { name: 'SW_DA-2ND-3-1', value: 10 }
  ];

  const barChartCategories = dataBarChart.map((item) => item.name);
  const barChartSeries = [
    {
      name: `${activeTab == 'alert' ? 'Alerts' : 'Events'}`,
      data: dataBarChart.map((item) => item.value)
    }
  ];

  const barChartOptions = {
    chart: {
      type: 'bar'
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '60%'
      }
    },
    dataLabels: {
      enabled: false
    },

    yaxis: {
      categories: categories
    },
    title: {
      text: `Top 10 devices with most ${activeTab}`,
      align: 'left'
    },
    tooltip: {
      enabled: true
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <LineChart key={activeTab} chartOptions={chartOptions} series={series} categories={categories} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <ColumnChart
            key={activeTab}
            columnChartOptions={columnChartOptions}
            series={columnChartSeries}
            categories={columnChartCategories}
            titleY={''}
            titleX={''}
          />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <BarChart
            key={activeTab}
            barChartOptions={barChartOptions}
            series={barChartSeries}
            categories={barChartCategories}
            title={''}
            titleY={''}
            titleX={''}
          />
        </div>
      </div>
    </div>
  );
};

export default HardwareDashboardView;
