import { AxiosPromise } from 'axios';
import axiosServices from 'shared/utils/axios';

export const accessControlApi = {
  findAll: (params?: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/access_control_management/data_access_controls',
      params
    }),
  refresh: (): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/access_control_management/refresh_access_control',
      method: 'post'
    }),
  update: (params: any, data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/access_control_management/edit_access_control',
      params,
      method: 'post',
      data
    })
};
