import { useState } from 'react';
import { useIntl } from 'react-intl';
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

import axios from 'shared/utils/axios';
import { API_PATH_DEVICES } from 'shared/utils/constant';
import { TopologyResponse, TopologyData, TopologyQueryParams, APClientsResponse, ConnectedClient } from 'shared/types/topology';

const useHandleTopology = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();

  const [isLoadingTopology, setIsLoadingTopology] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [topologyData, setTopologyData] = useState<TopologyData | null>(null);
  const [timestamp, setTimestamp] = useState<string>('');

  /**
   * Fetch complete topology data
   * Hierarchy: Region → Controller → Site → AP → Clients
   */
  const fetchTopologyData = async (params?: TopologyQueryParams): Promise<TopologyData | null> => {
    try {
      setIsLoadingTopology(true);

      const queryParams = new URLSearchParams();
      if (params?.regionId) queryParams.append('regionId', params.regionId);
      if (params?.controllerId) queryParams.append('controllerId', params.controllerId);
      if (params?.siteId) queryParams.append('siteId', params.siteId);
      if (params?.includeClients !== undefined) queryParams.append('includeClients', String(params.includeClients));
      if (params?.realtime !== undefined) queryParams.append('realtime', String(params.realtime));

      const { data } = await axios.get<TopologyResponse>(
        `${import.meta.env.VITE_APP_BACKEND_API_TEST_WIFI}${API_PATH_DEVICES.topology}?${queryParams.toString()}`,
        {
          headers: { Authorization: `${accessToken}` }
        }
      );

      if (data.code === 0) {
        setTopologyData(data.data.topology);
        setTimestamp(data.data.timestamp);
        return data.data.topology;
      } else {
        enqueueSnackbar(data.message || intl.formatMessage({ id: 'fetch-topology-failed' }), {
          variant: 'error'
        });
        return null;
      }
    } catch (error: any) {
      console.error('Fetch topology error:', error);
      enqueueSnackbar(error?.response?.data?.message || intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return null;
    } finally {
      setIsLoadingTopology(false);
    }
  };

  /**
   * Fetch clients for a specific AP with pagination
   */
  const fetchAPClients = async (
    apId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ clients: ConnectedClient[]; total: number } | null> => {
    try {
      setIsLoadingClients(true);

      const { data } = await axios.get<APClientsResponse>(
        `${import.meta.env.VITE_APP_BACKEND_API_TEST_WIFI}${API_PATH_DEVICES.topology}/access-points/${apId}/clients`,
        {
          headers: { Authorization: `${accessToken}` },
          params: { page, pageSize }
        }
      );

      if (data.code === 0) {
        return {
          clients: data.data.clients,
          total: data.data.pagination.total
        };
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'fetch-clients-failed' }), {
          variant: 'error'
        });
        return null;
      }
    } catch (error: any) {
      console.error('Fetch AP clients error:', error);
      enqueueSnackbar(error?.response?.data?.message || intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return null;
    } finally {
      setIsLoadingClients(false);
    }
  };

  /**
   * Refresh topology data (real-time)
   */
  const refreshTopology = async (params?: TopologyQueryParams) => {
    return await fetchTopologyData({ ...params, realtime: true });
  };

  return {
    // State
    isLoadingTopology,
    isLoadingClients,
    topologyData,
    timestamp,

    // Methods
    fetchTopologyData,
    fetchAPClients,
    refreshTopology,
    setTopologyData
  };
};

export default useHandleTopology;
