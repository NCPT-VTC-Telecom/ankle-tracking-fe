import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

//utils
import axios from 'shared/utils/axios';
import { API_PATH_VLAN, API_PATH_WLAN } from 'shared/utils/constant';

//types
import { NewWLAN } from 'shared/types';

interface paramsGetLAN {
  page?: number;
  pageSize?: number;
  filters?: string;
  siteId: string | string[];
  siteDataInput?: string;
  startDate?: string;
  endDate?: string;
}

interface paramsPostVLAN {
  id?: number;
}

const useHandleVLAN = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefresh, setIsRefresh] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const fetchDataVLAN = async (params: paramsGetLAN) => {
    try {
      setIsLoading(true)
      const res = await axios.get(`${API_PATH_VLAN.dataVLAN}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
        setTotalPages(res.data.data.totalPages);
        setTotalResults(res.data.data.total);

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

  const handleAddVLAN = async (dataBody: NewWLAN) => {
    try {
      const res = await axios.post(
        `${API_PATH_WLAN.addWLAN}`,
        {
          ...dataBody
        },
        {
          headers: { Authorization: accessToken }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'add-wlan-successfully' }), {
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

  const handleEditVLAN = async (dataBody: NewWLAN) => {
    try {
      const res = await axios.post(
        `${API_PATH_WLAN.editWLAN}`,
        {
          ...dataBody
        },
        {
          headers: { Authorization: accessToken },
          params: { id: dataBody.id }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'edit-wlan-successfully' }), {
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

  const handleDeleteVLAN = async (params: paramsPostVLAN, isDelete: boolean) => {
    if (params.id && isDelete) {
      try {
        const res = await axios.post(
          `${API_PATH_WLAN.deleteWLAN}`,
          {},
          {
            headers: { Authorization: accessToken },
            params: { ...params }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'delete-wlan-successfully' }), {
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

  const handleRefreshVLAN = async (isRefresh: boolean) => {
    if (isRefresh) {
      try {
        setIsRefresh(true);
        const res = await axios.post(
          `${API_PATH_VLAN.refreshVLAN}`,
          {},
          {
            headers: { Authorization: accessToken }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'refresh-vlan-successfully' }), {
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
    fetchDataVLAN,
    handleAddVLAN,
    handleEditVLAN,
    handleDeleteVLAN,
    handleRefreshVLAN
  };
};

export default useHandleVLAN;
