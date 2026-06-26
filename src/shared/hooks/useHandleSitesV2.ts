import { useIntl } from 'react-intl';
import { enqueueSnackbar } from 'notistack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NewSites } from 'shared/types';
import { siteApi } from 'shared/api/site.api';

export interface ParamsGetSites {
  page?: number;
  pageSize?: number;
  filters?: string;
  siteId?: string;
  regionId?: string | null;
  regionDataInput: string;
}

export interface ParamsGetScenario {
  regionId: string;
}

export const useHandleSiteV2 = () => {
  const intl = useIntl();
  const queryClient = useQueryClient();

  // ===========================
  // GET LIST SITES
  // ===========================
  const useSitesQuery = (params?: ParamsGetSites) =>
    useQuery({
      queryKey: ['sites-list', params],
      queryFn: async () => {
        if (!params) return { list: [], totalPages: 0, total: 0 };

        const { data } = await siteApi.getSites(params);
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
      enabled: !!params // chỉ chạy khi có params
    });

  // ===========================
  // GET SCENARIO
  // ===========================
  const useScenarioQuery = (params?: ParamsGetScenario) =>
    useQuery({
      queryKey: ['scenario-list', params],
      queryFn: async () => {
        if (!params) return [];
        const { data } = await siteApi.getScenario(params);
        if (data.code !== 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), { variant: 'error' });
          return [];
        }
        return data.data.data;
      },
      enabled: !!params
    });

  // ===========================
  // MUTATIONS
  // ===========================
  const addSite = useMutation({
    mutationFn: async (newSite: NewSites) => {
      const { data } = await siteApi.create(newSite);
      if (data.code !== 0) throw new Error();
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sites-list'] })
  });

  const editSite = useMutation({
    mutationFn: async (site: NewSites) => {
      const { id, ...rest } = site;
      const { data } = await siteApi.edit(id!, rest);
      if (data.code !== 0) throw new Error();
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sites-list'] })
  });

  const deleteSite = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await siteApi.delete({ id });
      if (data.code !== 0) throw new Error();
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sites-list'] })
  });

  const refreshSite = useMutation({
    mutationFn: async (regionId?: string) => {
      const { data } = await siteApi.refresh(regionId);
      if (data.code !== 0) throw new Error();
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sites-list'] })
  });

  return {
    // Queries
    useSitesQuery,
    useScenarioQuery,

    // Mutations
    addSite: addSite.mutateAsync,
    editSite: editSite.mutateAsync,
    deleteSite: deleteSite.mutateAsync,
    refreshSite: refreshSite.mutateAsync
  };
};
