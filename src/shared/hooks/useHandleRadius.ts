import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

//utils
import axios from 'shared/utils/axios';
import { API_PATH_RADIUS } from 'shared/utils/constant';

//types
import { NewRadius } from 'shared/types';

interface paramsGetRadius {
  page?: number;
  pageSize?: number;
  filters?: string;
  siteId: string;
}

interface paramsPostRadius {
  id?: number;
}

const useHandleRadius = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefresh, setIsRefresh] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotaResults] = useState(0);

  const fetchDataRadius = async (params: paramsGetRadius) => {
    try {
      const res = await axios.get(`${API_PATH_RADIUS.dataRadius}`, {
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

  const handleAddRadius = async (dataBody: NewRadius) => {
    try {
      const res = await axios.post(
        `${API_PATH_RADIUS.addRadius}`,
        {
          ...dataBody
        },
        {
          headers: { Authorization: accessToken }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'add-radius-server-successfully' }), {
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

  const handleEditRadius = async (dataBody: NewRadius) => {
    try {
      const res = await axios.post(
        `${API_PATH_RADIUS.editRadius}`,
        {
          ...dataBody
        },
        {
          headers: { Authorization: accessToken },
          params: { id: dataBody.id }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'edit-radius-server-successfully' }), {
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

  const handleDeleteRadius = async (params: paramsPostRadius, isDelete: boolean) => {
    if (params.id && isDelete) {
      try {
        const res = await axios.post(
          `${API_PATH_RADIUS.deleteRadius}`,
          {},
          {
            headers: { Authorization: accessToken },
            params: { ...params }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'delete-radius-server-successfully' }), {
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

  const handleRefreshRadius = async (isRefresh: boolean) => {
    if (isRefresh) {
      try {
        setIsRefresh(true);
        const res = await axios.post(
          `${API_PATH_RADIUS.refresh}`,
          {},
          {
            headers: { Authorization: accessToken }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'refresh-radius-server-successfully' }), {
            variant: 'success'
          });
          return res.data;
        } else {
          enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
            variant: 'error'
          });
          return res.data;
        }
      } catch (error) {
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
    fetchDataRadius,
    handleRefreshRadius,
    totalPages,
    handleAddRadius,
    handleEditRadius,
    handleDeleteRadius,
    totalResults
  };
};

export default useHandleRadius;
