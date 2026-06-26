import { AxiosPromise } from 'axios';
import axiosServices from 'shared/utils/axios';

export const wlanApi = {
  create: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/wlan_management/add_wlan',
      data,
      method: "post"
    })
};
