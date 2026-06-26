import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

//utils
import axios from 'shared/utils/axios';
import { API_PATH_WLAN } from 'shared/utils/constant';

//types
import { NewWLAN, WLANData } from 'shared/types';

interface paramsGetWLAN {
  page?: number;
  pageSize?: number;
  filters?: string;
  siteId?: string;
  siteDataInput?: string;
  startDate?: string;
  endDate?: string;
}

interface paramsPostWLAN {
  id?: number;
}

const useHandleWLAN = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefresh, setIsRefresh] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const fetchDataWLAN = async (params: paramsGetWLAN) => {
    try {
      setIsLoading(true)
      const res = await axios.get(`${API_PATH_WLAN.dataWLAN}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {

        setTotalPages(res.data.data.totalPages);
        setTotalResults(res.data.data.total);
        return res.data.data.data as WLANData[];
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

  const handleAddWLAN = async (dataBody: NewWLAN) => {
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

  const handleEditWLAN = async (dataBody: NewWLAN) => {
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

  const handleDeleteWLAN = async (params: paramsPostWLAN, isDelete: boolean) => {
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

  const handleRefreshWLAN = async (isRefresh: boolean) => {
    if (isRefresh) {
      try {
        setIsRefresh(true);
        const res = await axios.post(
          `${API_PATH_WLAN.refresh}`,
          {},
          {
            headers: { Authorization: accessToken }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'refresh-wlan-successfully' }), {
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

  return { isLoading, isRefresh, totalPages, totalResults, fetchDataWLAN, handleAddWLAN, handleEditWLAN, handleDeleteWLAN, handleRefreshWLAN };
};

export default useHandleWLAN;
