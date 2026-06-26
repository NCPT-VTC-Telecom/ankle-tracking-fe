import { AxiosPromise } from 'axios';
import axiosServices from 'shared/utils/axios';

export const adHistoryApi = {
  findAll: (params?: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/ad_history/data_history',
      params
    }),

};
