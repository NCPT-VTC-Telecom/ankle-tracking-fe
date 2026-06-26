// useSingleAd.ts
import { useQuery } from '@tanstack/react-query';
import { adApi } from 'shared/api/ad.api';
import { DataAds } from 'shared/types';

export const useSingleAd = (params: { id: number | undefined; siteId: string; adDataInput: string }) => {
  return useQuery<DataAds>({
    queryKey: ['single-ad', params],
    queryFn: async () => {
      if (!params.id) return null;

      // Lấy ad settings từ API
      const { data: adsListRes } = await adApi.getAds(params);

      const adSettings = adsListRes.data?.data?.[0];
      return adSettings;
    },
    enabled: !!params.id
  });
};
