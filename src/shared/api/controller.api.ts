import { AxiosPromise } from 'axios';
import axiosServices from 'shared/utils/axios';

export const controllerApi = {
  checkConnection: (params?: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/device_management/check_connection',
      params
    })
};
