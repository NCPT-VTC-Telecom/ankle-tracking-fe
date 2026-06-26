import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adApi } from 'shared/api/ad.api';
import { enqueueSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { DataAds, NewDataAds } from 'shared/types/Ads';

type Assets = 'background' | 'img' | 'video' | 'logo' | 'banner' | 'img_tablet' | 'img_desktop';

export interface ParamsGetAds {
  page?: number;
  pageSize?: number;
  filters?: string;
  ssid?: string;
  id?: number;
  siteId?: string;
  siteDataInput?: string;
  adDataInput: string;
  statusId?: number;
}

interface AdsListResult {
  list: DataAds[];
  totalPages: number;
  total: number;
}

export const useAdsQuery = (params?: ParamsGetAds) => {
  const intl = useIntl();
  const queryClient = useQueryClient();

  // ===========================
  // GET LIST ADS
  // ===========================
  const query = useQuery<AdsListResult>({
    queryKey: ['ads-list', params],
    queryFn: async () => {
      const { data } = await adApi.getAds(params);

      if (data.code !== 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), { variant: 'error' });
        return { list: [], totalPages: 0, total: 0 };
      }

      return {
        list: data.data.data,
        totalPages: data.data.totalPages,
        total: data.data.total
      };
    }
  });




  // ===========================
  // ADD AD
  // ===========================
  const addMutation = useMutation({
    mutationFn: (settings: NewDataAds) => adApi.addAds(settings),
    onSuccess: (res) => {
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'add-ad-successfully' }), { variant: 'success' });
        queryClient.invalidateQueries({ queryKey: ['ads-list'] });
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'add-failed' }), { variant: 'error' });
      }
    },
    onError: () =>
      enqueueSnackbar(intl.formatMessage({ id: 'add-failed' }), { variant: 'error' })
  });

  // ===========================
  // EDIT AD
  // ===========================
  const editMutation = useMutation({
    mutationFn: ({ settings, id }: { settings: NewDataAds; id: number }) =>
      adApi.editAds(id, settings),

    onSuccess: (res) => {
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'update-ad-successfully' }), {
          variant: 'success'
        });
        queryClient.invalidateQueries({ queryKey: ['ads-list'] });
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'update-failed' }), { variant: 'error' });
      }
    },
    onError: () =>
      enqueueSnackbar(intl.formatMessage({ id: 'update-failed' }), { variant: 'error' })
  });

  // ===========================
  // DELETE AD
  // ===========================
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adApi.deleteAds(id),

    onSuccess: (res) => {
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'delete-ad-successfully' }), {
          variant: 'success'
        });
        queryClient.invalidateQueries({ queryKey: ['ads-list'] });
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'delete-failed' }), { variant: 'error' });
      }
    },
    onError: () =>
      enqueueSnackbar(intl.formatMessage({ id: 'delete-failed' }), { variant: 'error' })
  });

  // ===========================
  // CHANGE STATUS
  // ===========================
  const statusMutation = useMutation({
    mutationFn: ({ id, statusId }: { id: number; statusId: number }) =>
      adApi.changeStatus(id, statusId),

    onSuccess: (res) => {
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'change-status-successfully' }), {
          variant: 'success'
        });
        queryClient.invalidateQueries({ queryKey: ['ads-list'] });
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'change-status-failed' }), {
          variant: 'error'
        });
      }
    },
    onError: () =>
      enqueueSnackbar(intl.formatMessage({ id: 'change-status-failed' }), {
        variant: 'error'
      })
  });

  // ===========================
  // UPLOAD ASSET (dùng adApi)
  // ===========================
  const uploadMutation = useMutation({
    mutationFn: ({
      type,
      file,
      id
    }: {
      type: Assets;
      file: File;
      id: number;
    }) => adApi.uploadAsset(type, file, id),

    onSuccess: () =>
      enqueueSnackbar(intl.formatMessage({ id: 'upload-success' }), { variant: 'success' }),

    onError: () =>
      enqueueSnackbar(intl.formatMessage({ id: 'upload-failed' }), { variant: 'error' })
  });

  // ===========================
  // LOAD ASSET
  // ===========================
  const loadAssetMutation = useMutation({
    mutationFn: (url: string) => adApi.loadAsset(url)
  });



  return {
    ads: query.data?.list || [],
    totalPages: query.data?.totalPages || 0,
    totalResults: query.data?.total || 0,
    isLoading: query.isLoading,
    refreshAds: query.refetch,

    addAd: addMutation.mutateAsync,
    editAd: editMutation.mutateAsync,
    deleteAd: deleteMutation.mutateAsync,
    changeStatus: statusMutation.mutateAsync,
    uploadAsset: uploadMutation.mutateAsync,
    loadAsset: loadAssetMutation.mutateAsync
  };
};
