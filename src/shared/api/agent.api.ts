import { AxiosPromise } from 'axios';
import axiosServices from 'shared/utils/axios';

export const agentApi = {
  findAll: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/agents',
      params
    }),
  create: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/agents',
      data,
      method: "post"
    }),
  update: (id: number, data: any): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/agents/${id}`,
      data,
      method: "patch"
    }),
  resetToken: (id: number): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/agents/${id}/regenerate-token`,
      method: "post"
    }),
  delete: (id: number): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/agents/${id}`,
      method: "delete"
    })
};
