import { AxiosPromise } from 'axios';
import axiosServices from 'shared/utils/axios';

export const logsHardwareApi = {
  findAll: (params?: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/log_hardware_management/data_logs',
      params
    }),
  getDataChart: (params?: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/log_hardware_management/data_logs',
      params
    }),
  refreshAlerts: (): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/log_hardware_management/refresh_log_alerts',
      method: 'post'
    }),
  refreshEvents: (): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/log_hardware_management/refresh_log_events',
      method: 'post'
    })
};
