import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import { enqueueSnackbar } from 'notistack';

//utils
import { ssidClientApi } from 'shared/api/ssidClient.api';
import { QueryParam } from 'shared/types/query';
import { SSIDClientData } from 'shared/types';

interface SSIDClientQuery extends QueryParam {
  filters?: string;
  statusId?: number | null;
  siteId: string;
  siteDataInput: string;
  ssidDataInput: string;
  startDate: string | null;
  endDate: string | null;
}

interface SSIDClientProps {
  initQuery: SSIDClientQuery;
}

const useHandleSSIDClient = ({ initQuery }: SSIDClientProps) => {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [query, setQuery] = useState<SSIDClientQuery>(initQuery)
  const [isRefresh, setIsRefresh] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [dataSSIDClient, setDataSSIDClient] = useState<SSIDClientData[]>([]);

  const fetchDataSSIDClient = async (newQuery?: SSIDClientQuery) => {
    setIsLoading(true)
    try {
      const { data } = await ssidClientApi.findAll(newQuery ?? query)
      if (data.code === 0) {
        setTotalPages(data.data.totalPages);
        setTotalResults(data.data.total);
        setDataSSIDClient(data.data.data)
        return data.data.data;
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
  }

  const blockClient = async (id: string) => {
    try {
      const { data } = await ssidClientApi.block({ id })
      if (data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'block-client-successfully' }), {
          variant: 'success'
        });
        return data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'block-failed' }), {
          variant: 'error'
        });
        return data;
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
  }

  const deleteClient = async (id: number) => {
    setIsLoadingDelete(true)
    try {
      const { data } = await ssidClientApi.delete({ id })
      if (data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'delete-client-successfully' }), {
          variant: 'success'
        });
        return data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'delete-failed' }), {
          variant: 'error'
        });
        return data;
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
    finally {
      setIsLoadingDelete(false)
    }
  }

  const unBlockClient = async (id: string) => {
    try {
      const { data } = await ssidClientApi.unblock({ id })
      if (data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'unblock-client-successfully' }), {
          variant: 'success'
        });
        return data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'unblock-failed' }), {
          variant: 'error'
        });
        return data;
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
  }

  const refreshSSIDClient = async () => {
    setIsRefresh(true);
    try {
      const { data } = await ssidClientApi.refresh()
      if (data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'refresh-client-successfully' }), {
          variant: 'success'
        });
        return data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'refresh-failed' }), {
          variant: 'error'
        });
        return data;
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    } finally {
      setIsRefresh(false);
    }
  };

  return {
    isLoading,
    isLoadingDelete,
    isRefresh,
    totalPages,
    totalResults,
    querySSIDClient: query,
    dataSSIDClient, setDataSSIDClient,
    setQuerySSIDClient: setQuery,
    fetchDataSSIDClient,
    blockClient,
    deleteClient,
    unBlockClient,
    refreshSSIDClient
  };
};

export default useHandleSSIDClient;
