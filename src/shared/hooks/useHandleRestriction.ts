import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

//utils
import axios from 'shared/utils/axios';
import { API_PATH_RESTRICTION } from 'shared/utils/constant';

//types
import { NewBlackListDevice, NewBlackListDomain } from 'shared/types';
import { formatDate } from 'shared/utils/handleData';

interface paramsGetRestriction {
  page?: number;
  pageSize?: number;
  filters?: string;
  siteId: string;
}

interface paramsPostRestriction {
  id?: number;
}

const useHandleRestriction = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const fetchDataRestriction = async (params: paramsGetRestriction, type: 'device' | 'domain') => {

    try {
      setIsLoading(true);
      const res = await axios.get(`${type === 'device' ? API_PATH_RESTRICTION.dataDevice : API_PATH_RESTRICTION.dataDomain}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
        setTotalPages(res.data.data.totalPages);
        setTotalResults(res.data.data.total);
        const formattedDate = formatDate(res.data.data.data, ['manufacturer_date']);
        return formattedDate;
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

  const handleAddRestriction = async (dataBody: NewBlackListDevice | NewBlackListDomain, type: 'device' | 'domain') => {
    try {
      let dataPost;

      if (type === 'domain') {
        const domainData = dataBody as NewBlackListDomain;
        dataPost = {
          ...domainData
        };
      } else if (type === 'device') {
        const deviceData = dataBody as NewBlackListDevice;
        dataPost = {
          ...deviceData
        };
      }

      const res = await axios.post(
        `${type === 'device' ? API_PATH_RESTRICTION.addDevice : API_PATH_RESTRICTION.addDomain}`,
        {
          ...dataPost
        },
        {
          headers: { Authorization: accessToken }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: `add-restriction-${type}-successfully` }), {
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

  const handleEditRestriction = async (dataBody: NewBlackListDevice | NewBlackListDomain, type: 'device' | 'domain') => {
    try {
      let dataPost;

      if (type === 'domain') {
        const domainData = dataBody as NewBlackListDomain;
        dataPost = {
          ...domainData
        };
      } else if (type === 'device') {
        const deviceData = dataBody as NewBlackListDevice;
        dataPost = {
          ...deviceData
        };
      }

      const res = await axios.post(
        `${type === 'device' ? API_PATH_RESTRICTION.editDevice : API_PATH_RESTRICTION.editDomain}`,
        {
          ...dataPost
        },
        {
          headers: { Authorization: accessToken },
          params: { id: dataBody.id }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: `edit-restriction-${type}-successfully` }), {
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

  const handleDeleteRestriction = async (params: paramsPostRestriction, isDelete: boolean, type: 'device' | 'domain') => {
    if (params.id && isDelete) {
      try {
        const res = await axios.post(
          `${type === 'device' ? API_PATH_RESTRICTION.deleteDevice : API_PATH_RESTRICTION.deleteDomain}`,
          {},
          {
            headers: { Authorization: accessToken },
            params: { ...params }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: `delete-restriction-${type}-successfully` }), {
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

  // const handleRefreshDevice = async (isRefresh: boolean) => {
  //   if (isRefresh) {
  //     try {
  //       const res = await axios.post(
  //         `${API_PATH_DEVICES.refreshDevice}`,
  //         {},
  //         {
  //           headers: { Authorization: accessToken }
  //         }
  //       );
  //       if (res.data.code === 0) {
  //         enqueueSnackbar(intl.formatMessage({ id: 'refresh-device-successfully' }), {
  //           variant: 'success'
  //         });
  //         return res.data;
  //       } else {
  //         enqueueSnackbar(intl.formatMessage({ id: 'refresh-failed' }), {
  //           variant: 'error'
  //         });
  //         return res.data;
  //       }
  //     } catch {
  //       enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
  //         variant: 'error'
  //       });
  //     }
  //   }
  // };

  return {
    isLoading,
    totalPages,
    totalResults,
    fetchDataRestriction,
    handleAddRestriction,
    handleEditRestriction,
    handleDeleteRestriction
    // handleRefreshDevice
  };
};

export default useHandleRestriction;
