import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { networkApi } from 'shared/api/network.api';
import { enqueueSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { formatDateFullTime } from 'shared/utils/handleData';

// ================== TYPES ==================
export type UserAccessType = 'fullname' | 'email' | 'phone_number' | 'birth_of_date' | 'gender';

export interface ParamsSession {
  page?: number;
  pageSize?: number;
  filters?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  sessionStatus?: string;
  userDevice?: string;
}

export interface ParamsUserAccess {
  type: UserAccessType;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  siteId: string;
  adDataInput: string;
}

export interface ParamsChartNetwork {
  type: 'user_count' | 'user_traffic' | 'user_range_age' | 'user_gender' | 'user_mobile_type';
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  siteId: string;
  adId?: number;
  adDataInput: string;
}

export interface ParamsChartSession {
  type: 'wifi_access_activities' | 'user_browser_usage' | 'user_device_type' | 'user_os_type';
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  siteId: string;
  adDataInput: string;
}

// ================== MAIN HOOK ==================
const useHandleSessionV2 = () => {
  const intl = useIntl();
  const showError = () => {
    enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), { variant: 'error' });
  };
  // ====== Fetch session list ======
  const useSessionList = (params: ParamsSession, enabled = true) =>
    useQuery({
      queryKey: ['session-list', params],
      queryFn: async () => {
        const res = await networkApi.findSession(params);
        if (res.data.code !== 0) throw new Error('Failed to fetch');
        const formatted = formatDateFullTime(res.data.data, ['created_date']);
        return {
          list: formatted,
          total: res.data.total,
          totalPages: res.data.totalPages
        };
      },
      enabled,
      refetchOnWindowFocus: true,
      meta: { onError: showError }
    });

  // ====== Fetch user access ======
  const useUserAccess = <T = any>(params: ParamsUserAccess, enabled = true): UseQueryResult<T, Error> =>
    useQuery({
      queryKey: ['user-access', params],
      queryFn: async () => {
        const res = await networkApi.findUserAccess(params);
        if (res.data.code !== 0) throw new Error('Failed to fetch');
        return res.data.data.data;
      },
      enabled,
      refetchOnWindowFocus: true,
      meta: { onError: showError }
    });

  // ====== Fetch user collector ======
  const useUserCollector = <T = any[]>(params: any, enabled = true): UseQueryResult<T, Error> =>
    useQuery({
      queryKey: ['user-collector', params],
      queryFn: async () => {
        const res = await networkApi.findUserCollectorInfo(params);
        if (res.data.code !== 0) throw new Error('Failed to fetch');
        return res.data.data;
      },
      enabled,
      refetchOnWindowFocus: true,
      meta: { onError: showError }
    });

  // ====== Fetch chart (session) ======
  const useChartSession = (params: ParamsChartSession, enabled = true) =>
    useQuery({
      queryKey: ['chart-session', params],
      queryFn: async () => {
        const res = await networkApi.findChartSession(params);
        if (res.data.code !== 0) throw new Error('Failed to fetch');
        return res.data.data;
      },
      enabled,
      refetchOnWindowFocus: true,
      meta: { onError: showError }
    });

  // ====== Fetch chart (network) ======
  const useChartNetwork = <T = any[]>(params: ParamsChartNetwork, enabled = true): UseQueryResult<T, Error> =>
    useQuery({
      queryKey: ['chart-network', params],
      queryFn: async () => {
        const res = await networkApi.findChartNetwork(params);
        if (res.data.code !== 0) throw new Error('Failed to fetch');
        return res.data.data || [];
      },
      enabled,
      staleTime: 0,
      refetchOnWindowFocus: true,
      meta: { onError: showError }
    });

  return {
    useSessionList,
    useUserAccess,
    useUserCollector,
    useChartSession,
    useChartNetwork
  };
};

export default useHandleSessionV2;
