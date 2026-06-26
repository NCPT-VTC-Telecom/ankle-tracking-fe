import axios, { AxiosPromise } from 'axios';
import axiosServices from 'shared/utils/axios';
import { API_PATH_ADS } from 'shared/utils/constant';

export const adApi = {
  // === LIST ADS ===
  getAds: (params: any): AxiosPromise =>
    axiosServices({
      url: API_PATH_ADS.getAd,
      params
    }),

  // === ADD ADS ===
  addAds: (data: any): AxiosPromise =>
    axiosServices({
      method: 'POST',
      url: API_PATH_ADS.addAD,
      data
    }),

  // === EDIT ADS ===
  editAds: (id: number, data: any): AxiosPromise =>
    axiosServices({
      method: 'POST',
      url: API_PATH_ADS.editAd,
      params: { id },
      data
    }),

  // === DELETE ADS ===
  deleteAds: (id: number): AxiosPromise =>
    axiosServices({
      method: 'POST',
      url: API_PATH_ADS.deleteAd,
      params: { id },
      data: {}
    }),

  // === CHANGE STATUS ===
  changeStatus: (id: number, statusId: number): AxiosPromise =>
    axiosServices({
      method: 'POST',
      url: API_PATH_ADS.changeStatus,
      params: { id, statusId },
      data: {}
    }),

  // === UPLOAD ASSET (dùng Axios gốc để dùng FormData) ===
  uploadAsset: (url: string, file: File, id: number): AxiosPromise =>
    axios.post(
      import.meta.env.VITE_APP_BACKEND_API_TEST_WIFI + url,
      (() => {
        const formData = new FormData();
        formData.append('file', file);
        return formData;
      })(),
      { params: { id } }
    ),

  // === LOAD ASSET ===
  loadAsset: (url: string): AxiosPromise =>
    axios.get(import.meta.env.VITE_APP_BACKEND_API_TEST_WIFI + url, {
      responseType: 'blob'
    }),
  updateStatus: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/ad_management/change_status',
      method: 'post',
      data
    }),
  approve: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/ad_management/approve_ad',
      method: 'post',
      data
    })
};
