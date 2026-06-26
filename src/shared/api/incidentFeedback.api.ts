import { AxiosPromise } from 'axios';
import axiosServices from 'shared/utils/axios';

export const incidentFeedbackApi = {
  findAll: (params?: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/passpoint_management/data_passpoint',
      params
    }),
  create: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/passpoint_management/generate',
      data,
      method: 'post'
    }),
  update: (id: number, data: any): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/passpoint_management/update/${id}`,
      method: 'patch',
      data
    }),
  delete: (id: number): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/passpoint_management/delete/${id}`,
      method: 'delete'
    })
};
