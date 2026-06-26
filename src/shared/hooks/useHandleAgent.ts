import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import { enqueueSnackbar } from 'notistack';

//redux
import { agentApi } from 'shared/api/agent.api';
import { Agent } from 'shared/types/agent';
import { QueryParam } from 'shared/types/query';

export interface AgentQuery extends QueryParam { }

interface AgentProps {
  initQuery: AgentQuery;
}

const useHandleAgent = ({ initQuery }: AgentProps) => {
  const [data, setData] = useState<Agent[]>([]);
  const [query, setQuery] = useState<AgentQuery>(initQuery);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const intl = useIntl();

  const fetchAgent = async (newQuery?: AgentQuery) => {
    try {
      setLoading(true);
      const { data } = await agentApi.findAll(newQuery ?? query);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setData(data.data);
      return data.data;
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
    agents: data,
    totalAgent: total,
    totalPages,
    fetchAgent,
    queryAgent: query,
    setQueryAgent: setQuery,
    setDataAgent: setData,
    loadingAgent: loading
  };
};

export default useHandleAgent;
