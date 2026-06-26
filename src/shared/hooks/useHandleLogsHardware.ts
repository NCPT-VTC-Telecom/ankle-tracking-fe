import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import { enqueueSnackbar } from 'notistack';

//redux
import { logsHardwareApi } from 'shared/api/logsHardware.api';
import { QueryParam } from 'shared/types/query';

export interface HardwareQuery extends QueryParam {
  type: 'alert' | 'event';
  siteDataInput?: string;
  siteId?: string;
}

interface HardWareProps {
  initQuery?: HardwareQuery;
}

const useHandleLogsHardware = ({ initQuery }: HardWareProps) => {
  const [data, setData] = useState<any[]>([]);
  const [dataChart, setDataChart] = useState<any[]>([]);
  const [query, setQuery] = useState<HardwareQuery | undefined>(initQuery);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const intl = useIntl();

  const fetchLogsHardware = async (newQuery?: HardwareQuery) => {
    try {
      setLoading(true);
      const { data } = await logsHardwareApi.findAll(newQuery ?? query);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setData(data.data.data);
      return data.data.data;
    } catch (err) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchDataChart = async (newQuery?: HardwareQuery) => {
    try {
      setLoading(true);
      const { data } = await logsHardwareApi.getDataChart(newQuery ?? query);
      setDataChart(data.data.data);
      return data.data.data;
    } catch (err) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    logsHardware: data,
    totalLogsHardware: total,
    totalPages,
    fetchLogsHardware,
    fetchDataChart,
    dataChart,
    queryLogsHardware: query,
    setQueryLogsHardware: setQuery,
    setDataLogsHardware: setData,
    loadingLogsHardware: loading
  };
};

export default useHandleLogsHardware;
