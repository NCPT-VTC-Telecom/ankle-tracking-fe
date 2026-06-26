import { AxiosPromise } from 'axios';
import axiosServices from 'shared/utils/axios';
import { API_PATH_SITES } from 'shared/utils/constant';

export const siteApi = {
  getSites: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_SITES.dataSites,
      method: 'get',
      params
    }),

  getScenario: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_SITES.dataScenario,
      method: 'get',
      params
    }),

  create: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_SITES.addSite,
      method: 'post',
      data
    }),

  edit: (id: string, data: any): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_SITES.editSite,
      method: 'post',
      data,
      params: { id }
    }),

  delete: (params: { id: string }): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_SITES.deleteSite,
      method: 'post',
      params
    }),

  refresh: (regionId?: string): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_SITES.refresh,
      method: 'post',
      params: regionId ? { regionId } : {}
    })
};
