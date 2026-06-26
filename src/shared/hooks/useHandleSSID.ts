import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

//utils
import axios from 'shared/utils/axios';
import { API_PATH_SSID } from 'shared/utils/constant';

//types
import { NewSSID } from 'shared/types';
import { ssidApi } from 'shared/api/ssid.api';

export interface ParamsGetSSID {
  page: number;
  pageSize: number;
  filters?: string;
  siteId?: string;
  siteDataInput: string;
  startDate?: string | null;
  endDate?: string | null;
  isForPortal?: string;
  wlanId?: string;
  wlanDataInput?: string
}

interface paramsPostSSID {
  id?: number;
}

const useHandleSSID = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefresh, setIsRefresh] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotaResults] = useState(0);

  const fetchDataSSID = async (params: ParamsGetSSID) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_PATH_SSID.dataSSID}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
        setTotalPages(res.data.data.totalPages);
        setTotaResults(res.data.data.total);
        return res.data.data.data;
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
  };

  const handleAddSSID = async (dataBody: NewSSID) => {
    try {
      const res = await ssidApi.create(dataBody);
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'add-ssid-successfully' }), {
          variant: 'success'
        });
        return res.data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'add-failed' }), {
          variant: 'error'
        });
        return res.data;
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
  };

  const handleEditSSID = async (dataBody: NewSSID) => {
    try {
      const res = await axios.post(
        `${API_PATH_SSID.editSSID}`,
        {
          ...dataBody
        },
        {
          headers: { Authorization: accessToken },
          params: { id: dataBody.id }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'edit-ssid-successfully' }), {
          variant: 'success'
        });
        return res.data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'update-failed' }), {
          variant: 'error'
        });
        return res.data;
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
  };

  const handleDeleteSSID = async (params: paramsPostSSID, isDelete: boolean) => {
    if (params.id && isDelete) {
      try {
        const res = await axios.post(
          `${API_PATH_SSID.deleteSSID}`,
          {},
          {
            headers: { Authorization: accessToken },
            params: { ...params }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'delete-ssid-successfully' }), {
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

  const handleRefreshSSID = async (isRefresh: boolean, wlanId: string) => {
    if (isRefresh) {
      setIsRefresh(true);
      try {
        const res = await axios.post(
          `${API_PATH_SSID.refreshSSID}?wlanId=${wlanId}`,
          {},
          {
            headers: { Authorization: accessToken }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'refresh-ssid-successfully' }), {
            variant: 'success'
          });
          return res.data;
        } else {
          enqueueSnackbar(intl.formatMessage({ id: 'refresh-failed' }), {
            variant: 'error'
          });
          return res.data;
        }
      } catch {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
      } finally {
        setIsRefresh(false);
      }
    }
  };

  return {
    isLoading,
    isRefresh,
    totalPages,
    totalResults,
    fetchDataSSID,
    handleAddSSID,
    handleEditSSID,
    handleDeleteSSID,
    handleRefreshSSID
  };
};

export default useHandleSSID;
