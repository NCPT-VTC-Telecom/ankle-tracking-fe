import { AxiosPromise } from 'axios';
import axiosServices from 'shared/utils/axios';
import { API_PATH_NETWORK } from 'shared/utils/constant';

export const networkApi = {
  // === User access / collector ===
  findUserAccess: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/network_management/data_user_access',
      params
    }),

  findUserCollectorInfo: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/network_management/chart/user_collector_information',
      params
    }),

  // === Chart network ===
  findChartNetwork: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_NETWORK.chartNetwork,
      params
    }),

  // === Chart session ===
  findChartSession: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_NETWORK.chartSession,
      params
    }),

  // === Session list ===
  findSession: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_NETWORK.dataSession,
      params
    })
};
