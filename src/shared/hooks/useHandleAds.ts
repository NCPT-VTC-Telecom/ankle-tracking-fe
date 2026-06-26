import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';
import Axios from 'axios';

//utils
import axios from 'shared/utils/axios';
import { API_PATH_ADS } from 'shared/utils/constant';

//types
import { NewDataAds } from 'shared/types/Ads';
import { dispatch } from 'shared/store';
import { openSnackbar } from 'shared/store/reducers/snackbar';

type Assets = 'background' | 'img' | 'video' | 'logo' | 'banner' | 'img_tablet' | 'img_desktop';

export interface paramsGetAds {
  page?: number;
  pageSize?: number;
  filters?: string;
  ssid?: string;
  id?: number;
  siteId?: string;
  siteDataInput?: string;
  adDataInput: string;
  statusId?: number
}

const useHandleAds = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const fetchDataAds = async (params?: paramsGetAds) => {
    try {
      setIsLoading(true)
      const { data } = await axios.get(`${API_PATH_ADS.getAd}`, {
        headers: { Authorization: accessToken },
        params: {
          ...params
        }
      });

      if (data.code === 0) {
        setTotalPages(data.data.totalPages);
        setTotalResults(data.data.total);
        return data.data.data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
        return [];
      }
    } catch (error) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }



  const handleAddAds = async (settings: NewDataAds) => {
    try {
      const res = await axios.post(
        `${API_PATH_ADS.addAD}`,
        {
          ...settings
        },
        {
          headers: { Authorization: accessToken }
        }
      );
      if (res.data.code === 0) {
        dispatch(
          openSnackbar({
            open: true,
            message: intl.formatMessage({ id: `add-ad-successfully` }),
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: false
          })
        );
        return res.data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'add-failed' }), {
          variant: 'error'
        });
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
  };

  const handleEditAds = async (settings: NewDataAds, id: number) => {
    try {
      const res = await axios.post(
        `${API_PATH_ADS.editAd}`,
        {
          ...settings
        },
        {
          headers: { Authorization: accessToken },
          params: {
            id
          }
        }
      );

      if (res && res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'update-ad-successfully' }), {
          variant: 'success'
        });
        return res.data.data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'update-failed' }), {
          variant: 'error'
        });
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
  };

  const handleDeleteAds = async (id: number | undefined, isDelete: boolean) => {
    if (id && isDelete) {
      try {
        const res = await axios.post(
          `${API_PATH_ADS.deleteAd}`,
          {},
          {
            headers: { Authorization: accessToken },
            params: { id }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'delete-ad-successfully' }), {
            variant: 'success'
          });
          return res.data;
        } else {
          enqueueSnackbar(intl.formatMessage({ id: 'delete-failed' }), {
            variant: 'error'
          });
          return res.data;
        }
      } catch {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
      }
    }
  };

  const handleChangeStatus = async (id: number | undefined, statusId: number) => {
    if (id) {
      try {
        const res = await axios.post(
          `${API_PATH_ADS.changeStatus}`,
          {},
          {
            headers: { Authorization: accessToken },
            params: { id, statusId }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'change-status-successfully' }), {
            variant: 'success'
          });
          return res.data;
        } else {
          enqueueSnackbar(intl.formatMessage({ id: 'change-status-failed' }), {
            variant: 'error'
          });
          return res.data;
        }
      } catch {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
      }
    }
  };

  const handleUploadAssets = async (type: Assets, file: File, id: number) => {
    const assetConfig = {
      background: { url: API_PATH_ADS.uploadBackground, maxFileSize: 5 * 1024 * 1024 },
      banner: { url: API_PATH_ADS.uploadBanner, maxFileSize: 5 * 1024 * 1024 },
      img: { url: API_PATH_ADS.uploadImg, maxFileSize: 5 * 1024 * 1024 },
      img_tablet: { url: API_PATH_ADS.uploadImgTablet, maxFileSize: 5 * 1024 * 1024 },
      img_desktop: { url: API_PATH_ADS.uploadImgDesktop, maxFileSize: 5 * 1024 * 1024 },
      logo: { url: API_PATH_ADS.uploadLogo, maxFileSize: 5 * 1024 * 1024 },
      video: { url: API_PATH_ADS.uploadVideo, maxFileSize: 10 * 1024 * 1024 }
    };

    const config = assetConfig[type];

    if (!config) {
      enqueueSnackbar(intl.formatMessage({ id: 'invalid-type' }), { variant: 'error' });
      return;
    }

    if (file.size > config.maxFileSize) {
      const sizeLimit = (config.maxFileSize / 1024 / 1024).toFixed(1);
      enqueueSnackbar(intl.formatMessage({ id: 'file-too-large' }, { size: sizeLimit }), { variant: 'error' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await Axios.post(import.meta.env.VITE_APP_BACKEND_API_TEST_WIFI + config.url, formData, {
        headers: {
          'Access-Control-Allow-Origin': 'https://wifi.vtctelecom.com.vn',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          Authorization: accessToken
        },
        params: { id }
      });

      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'upload-success' }), {
          variant: 'success'
        });
        return res.data.data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'upload-failed' }), {
          variant: 'error'
        });
        return {};
      }
    } catch (error) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return {};
    }
  };

  const loadAssets = async (assetsUrl: string) => {
    try {
      const getUrlPath = (url: string | undefined) => url;
      const assetsUrlPath = getUrlPath(assetsUrl);

      if (assetsUrlPath) {
        const res = await Axios.get(import.meta.env.VITE_APP_BACKEND_API_TEST_WIFI + assetsUrlPath, {
          headers: {
            'Access-Control-Allow-Origin': 'https://wifi.vtctelecom.com.vn',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            Authorization: accessToken
          },
          responseType: 'blob'
        });

        if (res.status === 200) {
          return URL.createObjectURL(res.data);
        } else {
          throw new Error(`Failed to load assets: ${res.statusText}`);
        }
      }
    } catch { }
  };

  return {
    isLoading,
    fetchDataAds,
    handleAddAds,
    handleEditAds,
    handleDeleteAds,
    handleUploadAssets,
    loadAssets,
    totalPages,
    totalResults,
    handleChangeStatus
  };
};

export default useHandleAds;
