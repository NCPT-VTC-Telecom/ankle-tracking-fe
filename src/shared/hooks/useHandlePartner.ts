import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

//utils
import { formatDate } from 'shared/utils/handleData';
import axios from 'shared/utils/axios';
import { API_PATH_PARTNER } from 'shared/utils/constant';

//types
import { NewPartner } from 'shared/types';
import dayjs from 'dayjs';

interface paramsGetPartner {
  page?: number;
  pageSize?: number;
  filters?: string;
  siteId: string;
  type: 'devices' | 'ads';
  id?: number;
  startDate?: string;
  endDate?: string;
  adDataInput?: string;
}

interface paramsPostPartner {
  id?: number;
  type: 'devices' | 'ads';
}

const useHandlePartner = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const fetchDataPartner = async (params: paramsGetPartner) => {
    try {
      setIsLoading(true)
      const res = await axios.get(`${API_PATH_PARTNER.dataPartner}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
        setTotalPages(res.data.data.totalPages);
        setTotalResults(res.data.data.total);
        const formattedDate = formatDate(res.data.data.data, ['from_date', 'expired_date']);
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

  const handleAddPartner = async (params: paramsPostPartner, dataBody: NewPartner) => {
    try {
      const res = await axios.post(
        `${API_PATH_PARTNER.addPartner}`,
        {
          ...dataBody
        },
        {
          headers: { Authorization: accessToken },
          params: {
            type: params.type
          }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'add-partner-successfully' }), {
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

  const handleEditPartner = async (params: paramsPostPartner, dataBody: NewPartner) => {
    try {
      const res = await axios.post(
        `${API_PATH_PARTNER.editPartner}`,
        {
          ...dataBody,
          fromDate: dayjs(dataBody.fromDate, ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD']).format('YYYY/MM/DD'),
          expiredDate: dayjs(dataBody.expiredDate, ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD']).format('YYYY/MM/DD')
        },
        {
          headers: { Authorization: accessToken },
          params: { ...params }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'edit-partner-successfully' }), {
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

  const handleDeletePartner = async (params: paramsPostPartner, isDelete: boolean) => {
    if (params.id && isDelete) {
      try {
        const res = await axios.post(
          `${API_PATH_PARTNER.deletePartner}`,
          {},
          {
            headers: { Authorization: accessToken },
            params: { ...params }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'delete-partner-successfully' }), {
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

  return { isLoading, totalPages, fetchDataPartner, handleAddPartner, handleEditPartner, handleDeletePartner, totalResults };
};

export default useHandlePartner;
