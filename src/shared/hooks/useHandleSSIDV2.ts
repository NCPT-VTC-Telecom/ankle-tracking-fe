import { useIntl } from 'react-intl';
import { enqueueSnackbar } from 'notistack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ssidApi } from 'shared/api/ssid.api';
import { NewSSID } from 'shared/types';

export interface ParamsGetSSID {
  page: number;
  pageSize: number;
  filters?: string;
  siteId?: string;
  siteDataInput: string;
  startDate?: string | null;
  endDate?: string | null;
  isForPortal?: string;
  wlanId?: string;
  wlanDataInput?: string;
}

interface SSIDItem {
  id: number;
  wlanId: string;
  name: string;
  // các trường khác từ API
}

interface SSIDListResult {
  list: SSIDItem[];
  totalPages: number;
  total: number;
}

export const useHandleSSIDV2 = (params: ParamsGetSSID, options?: { enabled?: boolean }) => {
  const intl = useIntl();
  const queryClient = useQueryClient();

  // ===========================
  // GET LIST SSID
  // ===========================
  const query = useQuery<SSIDListResult>({
    queryKey: ['ssid-list', params],
    queryFn: async () => {
      const { data } = await ssidApi.getSSID(params);

      if (data.code !== 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), { variant: 'error' });
        return { list: [], totalPages: 0, total: 0 };
      }

      return {
        list: data.data.data,
        totalPages: data.data.totalPages,
        total: data.data.total
      };

    },
    enabled: options?.enabled
  });

  // ===========================
  // ADD SSID
  // ===========================
  const addMutation = useMutation({
    mutationFn: (dataBody: NewSSID) => ssidApi.create(dataBody),
    onSuccess: (res) => {
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'add-ssid-successfully' }), { variant: 'success' });
        queryClient.invalidateQueries({ queryKey: ['ssid-list'] });
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'add-failed' }), { variant: 'error' });
      }
    },
    onError: () => enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), { variant: 'error' })
  });

  // ===========================
  // EDIT SSID
  // ===========================
  const editMutation = useMutation({
    mutationFn: (dataBody: NewSSID) => ssidApi.edit(dataBody.id!, dataBody),
    onSuccess: (res) => {
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'edit-ssid-successfully' }), { variant: 'success' });
        queryClient.invalidateQueries({ queryKey: ['ssid-list'] });
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'update-failed' }), { variant: 'error' });
      }
    },
    onError: () => enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), { variant: 'error' })
  });

  // ===========================
  // DELETE SSID
  // ===========================
  const deleteMutation = useMutation({
    mutationFn: (id: number) => ssidApi.delete({ id }),
    onSuccess: (res) => {
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'delete-ssid-successfully' }), { variant: 'success' });
        queryClient.invalidateQueries({ queryKey: ['ssid-list'] });
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'delete-failed' }), { variant: 'error' });
      }
    },
    onError: () => enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), { variant: 'error' })
  });

  // ===========================
  // REFRESH SSID
  // ===========================
  const refreshMutation = useMutation({
    mutationFn: (wlanId: string) => ssidApi.refresh(wlanId),
    onSuccess: (res) => {
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'refresh-ssid-successfully' }), { variant: 'success' });
        queryClient.invalidateQueries({ queryKey: ['ssid-list'] });
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'refresh-failed' }), { variant: 'error' });
      }
    },
    onError: () => enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), { variant: 'error' })
  });

  return {
    // Query
    ssid: query.data?.list || [],
    totalPages: query.data?.totalPages || 0,
    totalResults: query.data?.total || 0,
    isLoading: query.isLoading,

    // Mutations
    addSSID: addMutation.mutateAsync,
    editSSID: editMutation.mutateAsync,
    deleteSSID: deleteMutation.mutateAsync,
    refreshSSID: refreshMutation.mutateAsync
  };
};
