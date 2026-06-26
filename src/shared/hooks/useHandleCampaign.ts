import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

//utils
import axios from 'shared/utils/axios';
import { API_PATH_CAMPAIGN } from 'shared/utils/constant';

//types
import { NewCampaign } from 'shared/types';
import { formatDate } from 'shared/utils/handleData';

interface paramsGetCampaign {
  page?: number;
  pageSize?: number;
  filters?: string;
  siteId: string;
  id?: number;
  // siteDataInput: string;
  adDataInput?: string;
  startDate?: string;
  endDate?: string;
}

interface paramsPostCampaign {
  id?: number;
}

const useHandleCampaign = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotaResults] = useState(0);

  const fetchDataCampaign = async (params: paramsGetCampaign) => {
    try {
      setIsLoading(true)
      const res = await axios.get(`${API_PATH_CAMPAIGN.dataCampaign}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
        setTotalPages(res.data.data.totalPages);
        setTotaResults(res.data.data.total);
        const formattedDate = formatDate(res.data.data.data, ['expired_date']);
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

  const handleAddCampaign = async (dataBody: NewCampaign) => {
    try {
      const res = await axios.post(
        `${API_PATH_CAMPAIGN.addCampaign}`,
        {
          ...dataBody
        },
        {
          headers: { Authorization: accessToken }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'add-campaign-successfully' }), {
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

  const handleEditCampaign = async (dataBody: NewCampaign) => {
    try {
      const res = await axios.post(
        `${API_PATH_CAMPAIGN.editCampaign}`,
        {
          ...dataBody
        },
        {
          headers: { Authorization: accessToken },
          params: { id: dataBody.id }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'edit-campaign-successfully' }), {
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

  const handleDeleteCampaign = async (params: paramsPostCampaign, isDelete: boolean) => {
    if (params.id && isDelete) {
      try {
        const res = await axios.post(
          `${API_PATH_CAMPAIGN.deleteCampaign}`,
          {},
          {
            headers: { Authorization: accessToken },
            params: { ...params }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'delete-campaign-successfully' }), {
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

  return { isLoading, totalPages, fetchDataCampaign, handleAddCampaign, handleEditCampaign, handleDeleteCampaign, totalResults };
};

export default useHandleCampaign;
