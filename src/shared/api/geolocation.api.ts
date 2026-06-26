// api/geolocation.api.ts
import axiosServices from 'shared/utils/axios';
import { AxiosPromise } from 'axios';
import { GeoQueryParams } from 'shared/types/geolocation';

export const geolocationApi = {
    getLocation: (params: GeoQueryParams): AxiosPromise<any> =>
        axiosServices({
            url: '/v1/geolocation/data_geolocation',
            method: 'GET',
            params
        })
};
