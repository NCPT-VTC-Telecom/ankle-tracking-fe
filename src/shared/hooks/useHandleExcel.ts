import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

//utils
import axios from 'shared/utils/axios';
import { API_PATH_EXCEL_MANAGEMENT } from 'shared/utils/constant';

//types

interface paramsGetExcelFile {
  type: string;
  adId?: number;
  startDate?: string;
  endDate?: string;
  adDataInput?: string;
  [key: string]: any;
}

const useHandleExcel = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  // const [totalPages, setTotalPages] = useState(0);

  //Chỗ này sửa lại theo Excel trên AH nhé
  const fetchExportExcel = async (params: paramsGetExcelFile) => {
    try {
      const res = await axios.get(`${API_PATH_EXCEL_MANAGEMENT.exportExcel}`, {
        headers: { Authorization: accessToken },
        params: { ...params },
        responseType: 'blob'
      });
      const contentType = res.headers['content-type'];
      if (
        !contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') &&
        !contentType.includes('application/xml') &&
        !contentType.includes('text/xml')
      ) {
        const text = await res.data.text();
        throw new Error(`Unexpected content type: ${contentType}. Response: ${text}`);
      }

      // Nếu API trả về XML, chuyển đổi thành Blob
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      if (res.status === 200) {
        return blob;
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

  return {
    isLoading,
    // totalPages,
    fetchExportExcel
  };
};

export default useHandleExcel;
