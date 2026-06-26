import { AxiosPromise } from 'axios';
import axiosServices from 'shared/utils/axios';

export const ssidClientApi = {
  findAll: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/ssid_client_management/data_ssid_client',
      params
    }),
  block: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/ssid_client_management/block_client',
      params,
      method: "post"
    }),
  unblock: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/ssid_client_management/unblock_client',
      params,
      method: "post"
    }),
  delete: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/ssid_client_management/delete_client`,
      method: "post",
      params
    }),
  refresh: (): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/ssid_client_management/refresh_clients`,
      method: "post",
    }),
};
