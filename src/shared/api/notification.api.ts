import { AxiosPromise } from 'axios';
import axiosServices from 'shared/utils/axios';

export const notificationApi = {
  findAll: (params?: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/notifications/user',
      params
    }),
  read: (id: number, data: any): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/notifications/user/${id}`,
      method: 'put',
      data
    })
};
