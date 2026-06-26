import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import { enqueueSnackbar } from 'notistack';
import Cookies from 'universal-cookie';

//utils
import { networkApi } from 'shared/api/network.api';
import axios from 'shared/utils/axios';
import { API_PATH_NETWORK } from 'shared/utils/constant';
import { formatDateFullTime } from 'shared/utils/handleData';

export type UserAccessType = 'fullname' | 'email' | 'phone_number' | 'birth_of_date' | 'gender'

interface paramsSession {
  page?: number;
  pageSize?: number;
  filters?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  sessionStatus?: string;
  userDevice?: string;
}

interface paramsUserAccess {
  type: UserAccessType;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  siteId: string;
  adDataInput: string;
}

interface paramsChartNetwork {
  type: 'user_count' | 'user_traffic' | 'user_range_age' | 'user_gender' | 'user_mobile_type';
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  siteId: string;
  adId?: number;
  adDataInput: string;
}

interface paramsChartSession {
  type: 'wifi_access_activities' | 'user_browser_usage' | 'user_device_type' | 'user_os_type';
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  siteId: string;
  adDataInput: string;
}

const useHandleSession = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [totalPage, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const fetchDataSession = async (params: paramsSession) => {
    try {
      const res = await axios.get(`${API_PATH_NETWORK.dataSession}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
        setTotalPages(res.data.totalPages);
        setTotalResults(res.data.total)
        const formattedDateTime = formatDateFullTime(res.data.data, ['created_date']);
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

  const fetchDataUserAccess = async (params: paramsUserAccess) => {
    try {
      const res = await networkApi.findUserAccess({ ...params });
      if (res.data.code === 0) {
        return res.data.data.data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
        return [];
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return {};
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDataUserCollector = async (params: any) => {
    try {
      const res = await networkApi.findUserCollectorInfo({ ...params });
      if (res.data.code === 0) {
        return res.data.data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
        return [];
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return {};
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDataChartSession = async (params: paramsChartSession) => {
    try {
      const res = await axios.get(`${API_PATH_NETWORK.chartSession}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
        return res.data.data;
      } else {
        return {};
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return {};
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDataChartNetwork = async (params: paramsChartNetwork) => {
    try {
      const res = await axios.get(`${API_PATH_NETWORK.chartNetwork}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
        return res.data.data;
      } else {
        return {};
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return {};
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    totalPage,
    totalResults,
    fetchDataSession,
    fetchDataUserAccess,
    fetchDataChartSession,
    fetchDataChartNetwork,
    fetchDataUserCollector
  };
};

export default useHandleSession;
