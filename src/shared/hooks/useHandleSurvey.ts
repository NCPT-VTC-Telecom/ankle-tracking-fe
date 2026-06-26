import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

//utils
import axios from 'shared/utils/axios';
import { API_PATH_NETWORK } from 'shared/utils/constant';
import { formatDate, formatDateFullTime } from 'shared/utils/handleData';

//types
import { AdSettings } from 'shared/types/Ads';

interface paramsGetSurvey {
  page?: number;
  pageSize?: number;
  filters?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  siteId: string;
  adDataInput: string;
}

const useHandleSurvey = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const fetchDataSurvey = async (params: paramsGetSurvey) => {
    try {
      setIsLoading(true)
      const res = await axios.get(`${API_PATH_NETWORK.dataSurvey}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
        setTotalPages(res.data.totalPages);
        setTotalResults(res.data.total);
        const formattedDate = formatDate(res.data.data, ['birth_of_date']);
        const formattedDateTime = formatDateFullTime(formattedDate, ['created_date']);
        return formattedDateTime;
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

  const handleAddSurvey = async (settings: AdSettings) => {
    try {
      const res = await axios.post(`${API_PATH_NETWORK.addSurvey}`, settings);
      alert('Ad settings saved successfully:');
      console.log('Ad settings saved successfully:', res.data);
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
  };

  return { isLoading, fetchDataSurvey, handleAddSurvey, totalPages, totalResults };
};

export default useHandleSurvey;
