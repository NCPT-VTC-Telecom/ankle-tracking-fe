// hooks/useGeolocation.ts
import { useQuery } from '@tanstack/react-query';
import { geolocationApi } from 'shared/api/geolocation.api';
import { GeoItem, GeoQueryParams } from 'shared/types/geolocation';



export const useGeolocation = (params: GeoQueryParams, enabled = true) => {
    return useQuery<GeoItem[]>({
        queryKey: ['geolocation', params],
        enabled,

        queryFn: async () => {
            const res = await geolocationApi.getLocation(params);

            if (!res.data || res.data.code !== 0) {
                throw new Error(res.data?.message || 'Failed to fetch geolocation');
            }

            return res.data.data ?? [];
        },

        staleTime: 1000 * 60 * 5, // cache 5 phút
    });
};
