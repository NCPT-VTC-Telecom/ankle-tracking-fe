import { AxiosPromise } from 'axios';
import axiosServices from 'shared/utils/axios';
import { API_PATH_SSID } from 'shared/utils/constant';

export const ssidApi = {
  create: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/ssid_management/create_advanced_ssid',
      method: 'post',
      data
    }),

  edit: (id: number, data: any): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/ssid_management/edit_advanced_ssid`,
      method: 'post',
      data,
      params: { id }
    }),

  delete: (params: { id: number }): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/ssid_management/delete_advanced_ssid`,
      method: 'post',
      params
    }),

  getSSID: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_SSID.dataSSID,
      method: 'get',
      params
    }),

  refresh: (wlanId: string): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/ssid_management/refresh_ssid`,
      method: 'post',
      params: { wlanId }
    })
};
