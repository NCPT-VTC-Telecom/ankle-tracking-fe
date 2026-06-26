import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import { enqueueSnackbar } from 'notistack';

//redux
import { adHistoryApi } from 'shared/api/adHistory.api';
import { QueryParam } from 'shared/types/query';

export interface AdHistoryQuery extends QueryParam { }

interface AdHistoryProps {
  initQuery: AdHistoryQuery;
}

const useHandleAdHistory = ({ initQuery }: AdHistoryProps) => {
  const [data, setData] = useState<any[]>([]);
  const [query, setQuery] = useState<AdHistoryQuery>(initQuery);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const intl = useIntl();

  const fetchAdHistory = async (newQuery?: AdHistoryQuery) => {
    try {
      setLoading(true);
      const { data } = await adHistoryApi.findAll(newQuery ?? query);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setData(data.data.data);
      return data.data.data;
    } catch (err) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    adHistories: data,
    totalAdHistories: total,
    totalPages,
    fetchAdHistory,
    queryAdHistory: query,
    setQueryAdHistory: setQuery,
    setDataAdHistory: setData,
    loadingAdHistory: loading
  };
};

export default useHandleAdHistory;
