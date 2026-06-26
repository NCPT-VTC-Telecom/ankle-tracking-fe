import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import { enqueueSnackbar } from 'notistack';

//redux
import { QueryParam } from 'shared/types/query';
import { deviceConnectionLogApi } from 'shared/api/deviceConnectionLog.api';
import { DeviceConnectionLog } from 'shared/types/device-connection-log';

export interface DeviceConnectionLogQuery extends QueryParam { }

interface DeviceConnectionlogProps {
  initQuery: DeviceConnectionLogQuery;
}

const useHandleDeviceConnectionLog = ({ initQuery }: DeviceConnectionlogProps) => {
  const [data, setData] = useState<DeviceConnectionLog[]>([]);
  const [query, setQuery] = useState<DeviceConnectionLogQuery>(initQuery);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const intl = useIntl();

  const fetchDeviceConnectionLog = async (newQuery?: DeviceConnectionLogQuery) => {
    try {
      setLoading(true);
      const { data } = await deviceConnectionLogApi.findAll(newQuery ?? query);
      setTotal(data?.data?.total);
      setTotalPages(data?.data.totalPages);
      setData(data?.data.data);
      return data?.data.data;
    } catch (err) {
      debugger
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    deviceConnectionLogs: data,
    totalDeviceConnectionLog: total,
    totalPages,
    fetchDeviceConnectionLog,
    queryDeviceConnectionLog: query,
    setQueryDeviceConnectionLog: setQuery,
    setDataDeviceConnectionLog: setData,
    loadingDeviceConnectionLog: loading
  };
};

export default useHandleDeviceConnectionLog;
