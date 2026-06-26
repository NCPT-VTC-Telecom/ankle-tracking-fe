import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

//utils
import axios from 'shared/utils/axios';
import { API_PATH_LOGS } from 'shared/utils/constant';
import { formatDateTime } from 'shared/utils/handleData';

interface getDataParams {
  page?: number; // 2: user, 1: admin
  pageSize?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}

const useHandleLogs = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const fetchDataLogs = async (params: getDataParams) => {
    try {
      const res = await axios.get(`${API_PATH_LOGS.software}`, {
        headers: { Authorization: accessToken },
        params: { pageSize: params.pageSize, page: params.page, filters: params.search }
      });
      if (res.data.code === 0) {
        const formattedDateTime = formatDateTime(res.data.data, ['action_time']);
        setTotalPages(res.data.totalPages);
        setTotalResults(res.data.total)
        return formattedDateTime;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
        return [];
      }
    } catch (error) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, totalPages, totalResults, fetchDataLogs };
};

export default useHandleLogs;
