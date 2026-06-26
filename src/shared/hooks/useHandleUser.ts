import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import { enqueueSnackbar } from 'notistack';
import Cookies from 'universal-cookie';

//utils
import axios from 'shared/utils/axios';
import { API_PATH_AUTHENTICATE, API_PATH_USER } from 'shared/utils/constant';

//redux
import { dispatch } from 'shared/store';
import { openSnackbar } from 'shared/store/reducers/snackbar';

//types
// import { NewDevice } from 'shared/types';

interface getDataParams {
  groupId?: number; // 2: user, 1: admin
  filters?: string;
  siteId: string;
}

interface actionParams {
  id?: string;
}

export interface ResetPasswordBody {
  username: string;
  email: string;
  newPassword: string;
}

const useHandleUser = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [isReload, setIsReload] = useState(false);
  const [totalPage, setTotalPages] = useState(0);
  const [totalResults, setTotaResults] = useState(0);

  const fetchData = async (pageSize: number, pageIndex: number, groupId: 1 | 2, params?: getDataParams) => {

    try {
      const res = await axios.get(`${API_PATH_USER.dataUser}`, {
        headers: { Authorization: accessToken },
        params: { pageSize: pageSize, page: pageIndex, groupId, filters: params?.filters }
      });
      if (res.data.code === 0) {
        setTotalPages(res.data.totalPages);
        setTotaResults(res.data.total);
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

  const handleAction = async (action: 'add' | 'edit' | 'delete', params: actionParams, dataBody?: any | {}) => {
    try {
      const res = await axios.post(
        `${action === 'add' ? API_PATH_USER.addUser : action === 'edit' ? API_PATH_USER.editUser : API_PATH_USER.deleteUser}`,
        {
          data: {
            ...dataBody,
            ...(action !== 'add' ? { id: dataBody?.id } : {})
          }
        },
        {
          headers: { Authorization: accessToken },
          params: { type: action, ...params, id: action !== 'add' ? params.id : null }
        }
      );
      if (res.data.code === 0) {
        dispatch(
          openSnackbar({
            open: true,
            message: intl.formatMessage({ id: `${action}-user-successfully` }),
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: false
          })
        );
        setIsReload(true);
      } else if (res.data.code === -1) {
        enqueueSnackbar(intl.formatMessage({ id: `exits-user` }), {
          variant: 'error'
        });
      } else {
        enqueueSnackbar(intl.formatMessage({ id: `${action}-failed` }), {
          variant: 'error'
        });
      }

      return res.data
    } catch (err) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      console.error(err);
    }
  };

  const handleResetPassword = async (dataBody: ResetPasswordBody | {}) => {
    try {
      const res = await axios.post(
        `${API_PATH_AUTHENTICATE.resetPassword}`,
        {
          ...dataBody
        },
        {
          headers: { Authorization: accessToken }
        }
      );
      if (res.data.code === 0) {
        dispatch(
          openSnackbar({
            open: true,
            message: intl.formatMessage({ id: `reset-password-successfully` }),
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: false
          })
        );
        setIsReload(true);
      } else {
        enqueueSnackbar(intl.formatMessage({ id: `reset-password-failed` }), {
          variant: 'error'
        });
        return res.data;
      }
    } catch (err) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      console.error(err);
    }
  };

  const handleChangeStatus = async (id: string, status: number) => {
    try {
      const res = await axios.post(
        API_PATH_USER.changeStatus,
        {
          statusId: status
        },
        {
          headers: { Authorization: accessToken },
          params: { id }
        }
      );
      if (res.data.code === 0) {
        dispatch(
          openSnackbar({
            open: true,
            message: intl.formatMessage({ id: 'update-status-successfully' }),
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: false
          })
        );
        setIsReload(true);
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'update-status-failed' }), {
          variant: 'error'
        });
      }
      return res.data;
    } catch (err) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      console.error(err);
    }
  };

  return { isLoading, totalPage, totalResults, fetchData, handleAction, isReload, setIsReload, handleResetPassword, handleChangeStatus };
};

export default useHandleUser;
