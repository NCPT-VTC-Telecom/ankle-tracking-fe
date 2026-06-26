import { AxiosPromise } from 'axios';
import axiosServices from 'shared/utils/axios';

export const deviceApi = {
  findAll: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/device_management/data_devices',
      params
    }),
  findAllDiagram: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/device_management/data_diagram_network',
      params
    }),
  findAllTraffic: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/device_management/data_traffic_network',
      params
    }),
  create: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/device_management/add_device',
      data,
      method: 'post'
    }),
  update: (params: any, data: any): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/device_management/edit_device`,
      method: 'post',
      params,
      data
    }),
  delete: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/device_management/delete_device`,
      method: 'post',
      params
    }),
  updateLocation: (params: any, data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/device_management/update_location',
      params,
      method: 'post',
      data
    }),
  refreshDevices: (): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/device_management/refresh_devices',
      method: 'post',
    }),
  refreshTrafficDevices: (): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/device_management/refresh_traffic_network',
      method: 'post',
    }),
  refreshDiagramDevices: (): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/device_management/refresh_diagrams',
      method: 'post',
    })
};
