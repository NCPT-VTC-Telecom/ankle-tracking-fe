import { AxiosPromise } from 'axios';
import axiosServices from 'shared/utils/axios';

export const deviceConnectionLogApi = {
  statistics: (params?: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/device_connection_logs/statistics',
      params
    }),
  findAll: (params?: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/device_connection_logs/data_logs',
      params
    }),
  create: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/device_connection_logs',
      data,
      method: 'post'
    }),
  update: (params: any, data: any): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/device_connection_logs`,
      method: 'patch',
      params,
      data
    }),
  resolve: (id: string, data: any): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/device_connection_logs/${id}/resolve`,
      method: 'patch',
      data
    }),
  delete: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/device_connection_logs`,
      method: 'delete',
      params
    })
};
