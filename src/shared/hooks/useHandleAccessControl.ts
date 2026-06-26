import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import { enqueueSnackbar } from 'notistack';

//redux
import { accessControlApi } from 'shared/api/accessControl.api';
import { QueryParam } from 'shared/types/query';
import { AccessControlData } from 'shared/types/access-control';

export interface AccessControlQuery extends QueryParam {}

interface AccessControlProps {
  initQuery: AccessControlQuery;
}

const useHandleAccessControl = ({ initQuery }: AccessControlProps) => {
  const [data, setData] = useState<AccessControlData>();
  const [query, setQuery] = useState<AccessControlQuery>(initQuery);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingRefresh, setLoadingRefresh] = useState<boolean>(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const intl = useIntl();

  const fetchAccessControl = async (newQuery?: AccessControlQuery) => {
    try {
      setLoading(true);
      const { data } = await accessControlApi.findAll(newQuery ?? query);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setData(data.data.data?.[0]);
      return data.data.data?.[0];
    } catch (err) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoadingRefresh(true);
      const res = await accessControlApi.refresh();
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'refresh-device-successfully' }), {
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
      setLoadingRefresh(false);
    }
  };

  return {
    accessControl: data,
    totalAccessControl: total,
    totalPages,
    fetchAccessControl,
    refreshAccessControl: handleRefresh,
    queryAccessControl: query,
    setQueryAccessControl: setQuery,
    setDataAccessControl: setData,
    loadingAccessControl: loading,
    loadingRefreshAccessControl: loadingRefresh
  };
};

export default useHandleAccessControl;
