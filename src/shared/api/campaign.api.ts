import { AxiosPromise } from 'axios';
import axiosServices from 'shared/utils/axios';

export const campaignApi = {
  updateStatus: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/ad_campaign/change_status',
      method: 'post',
      data
    }),
  approve: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/ad_campaign/approve_campaign',
    method: 'post',
      data
    })
};
