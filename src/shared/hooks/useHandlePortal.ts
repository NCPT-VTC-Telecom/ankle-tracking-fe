// hooks/useHandlePortal.ts
import { useState } from 'react';
import { useIntl } from 'react-intl';
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';
import axios from 'shared/utils/axios';
import { API_PATH_PORTAL } from 'shared/utils/constant';
import { NewPortal } from 'shared/types/portal';

interface paramsGetPortal {
  page?: number;
  pageSize?: number;
  filters?: string;
  siteId: string;
  authType?: number;
}

interface paramsPostPortal {
  id?: string; // Đổi từ number sang string để khớp với NewPortal
}

const useHandlePortal = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefresh, setIsRefresh] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotaResults] = useState(0);

  const fetchDataPortal = async (params: paramsGetPortal) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_PATH_PORTAL.dataPortal}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
        setTotalPages(res.data.data.totalPages);
        setTotaResults(res.data.data.total);
        return res.data.data;
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

  const handleAddPortal = async (params: paramsPostPortal, dataBody: NewPortal) => {
    try {
      const res = await axios.post(
        `${API_PATH_PORTAL.addPortal}`,
        {
          ...dataBody
        },
        {
          headers: { Authorization: accessToken }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'add-portal-successfully' }), {
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

  const handleEditPortal = async (params: paramsPostPortal, dataBody: NewPortal) => {
    try {
      const res = await axios.post(
        `${API_PATH_PORTAL.editPortal}`,
        {
          ...dataBody
        },
        {
          headers: { Authorization: accessToken },
          params: { ...params }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'edit-portal-successfully' }), {
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

  const handleDeletePortal = async (params: paramsPostPortal, isDelete: boolean) => {
    if (params.id && isDelete) {
      try {
        const res = await axios.post(
          `${API_PATH_PORTAL.deletePortal}`,
          {},
          {
            headers: { Authorization: accessToken },
            params: { ...params }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'delete-portal-successfully' }), {
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

  const handleRefreshPortals = async (isRefresh: boolean) => {
    if (isRefresh) {
      try {
        setIsRefresh(true);
        const res = await axios.post(
          `${API_PATH_PORTAL.refreshPortal}`,
          {},
          {
            headers: { Authorization: accessToken }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'refresh-portals-successfully' }), {
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
    fetchDataPortal,
    handleRefreshPortals,
    handleAddPortal,
    handleEditPortal,
    handleDeletePortal
  };
};

export default useHandlePortal;
