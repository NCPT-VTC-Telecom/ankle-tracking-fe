import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

//utils
import axiosServices from 'shared/utils/axios';
import { API_PATH_SITES } from 'shared/utils/constant';

//types
import { NewSites } from 'shared/types';
import axios from 'axios';

export interface ParamsGetSites {
  page?: number;
  pageSize?: number;
  filters?: string;
  siteId?: string;
  regionId?: string | null;
  regionDataInput: string;
}

export interface ParamsGetScenario {
  regionId: string;
}


interface paramsPostSites {
  id?: string;
}

const useHandleSite = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefresh, setIsRefresh] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotaResults] = useState(0);

  const fetchDataSites = async (params: ParamsGetSites) => {
    try {
      setIsLoading(true)
      const res = await axiosServices.get(`${API_PATH_SITES.dataSites}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
        setTotalPages(res.data.totalPages);
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

  const handleAddSite = async (dataBody: NewSites) => {
    try {
      const res = await axiosServices.post(
        `${API_PATH_SITES.addSite}`,
        {
          ...dataBody
        },
        {
          headers: { Authorization: accessToken }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'add-site-successfully' }), {
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

  const handleEditSite = async (dataBody: NewSites) => {
    const { id, ...rest } = dataBody
    try {
      const res = await axiosServices.post(
        `${API_PATH_SITES.editSite}`,
        {
          ...rest
        },
        {
          headers: { Authorization: accessToken },
          params: { id }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'edit-site-successfully' }), {
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

  const handleDeleteSite = async (params: paramsPostSites, isDelete: boolean) => {
    if (params.id && isDelete) {
      try {
        const res = await axiosServices.post(
          `${API_PATH_SITES.deleteSite}`,
          {},
          {
            headers: { Authorization: accessToken },
            params: { ...params }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'delete-site-successfully' }), {
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

  const fetchDataScenario = async (params: ParamsGetScenario) => {
    try {
      const res = await axiosServices.get(`${API_PATH_SITES.dataScenario}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
        setTotalPages(res.data.totalPages);
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
    }
  };

  const handleRefreshSite = async (regionId?: string) => {
    try {
      setIsRefresh(true);
      const res = await axiosServices.post(
        `${API_PATH_SITES.refresh}`,
        { regionId },
        {
          headers: { Authorization: accessToken }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'refresh-site-successfully' }), {
          variant: 'success'
        });
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
        return [];
      }
    } catch (error) {
      console.log({ error })
      if (!axios.isCancel(error)) {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
      }
      return [];
    } finally {
      setIsRefresh(false);
    }
  };


  return {
    isLoading,
    isRefresh,
    totalResults,
    fetchDataSites,
    fetchDataScenario,
    handleRefreshSite,
    totalPages,
    handleAddSite,
    handleEditSite,
    handleDeleteSite
  };
};

export default useHandleSite;
