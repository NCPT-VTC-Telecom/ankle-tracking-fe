import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

//utils
import axios from 'shared/utils/axios';
import { API_PATH_ROLE } from 'shared/utils/constant';

interface getDataParams {
  pageSize?: number;
  page?: number;
  level: 1 | 2 | 3;
  filters?: string;
  parent_id?: number[];
}

const useHandlePermission = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const fetchDataPermission = async (params?: getDataParams) => {
    try {
      const res = await axios.get(`${API_PATH_ROLE.dataRole}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
        setTotalPages(res.data.totalPages);
        return res.data.data;
      } else {
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

  return { isLoading, totalPages, fetchDataPermission };
};

export default useHandlePermission;
