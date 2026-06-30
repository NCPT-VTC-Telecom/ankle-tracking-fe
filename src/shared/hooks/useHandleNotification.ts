import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import { enqueueSnackbar } from 'notistack';

//redux
import { NotificationDataInterface } from 'shared/types';
import { QueryParam } from 'shared/types/query';
import { notificationApi } from 'shared/api/notification.api';

export interface NotificationQuery extends QueryParam { }

interface NotificationProps {
  initQuery: NotificationQuery;
}

const useHandleNotification = ({ initQuery }: NotificationProps) => {
  const [data, setData] = useState<NotificationDataInterface[]>([]);
  const [query, setQuery] = useState<NotificationQuery>(initQuery);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const intl = useIntl();

  const fetchNotification = async (newQuery?: NotificationQuery) => {
    try {
      setLoading(true);
      const { data } = await notificationApi.findAll(newQuery ?? query);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setUnreadCount(data.data.unreadCount);
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
    unreadCount,
    setUnreadCount,
    notifications: data,
    totalNotification: total,
    totalPages,
    fetchNotification,
    queryNotification: query,
    setQueryNotification: setQuery,
    setDataNotification: setData,
    loadingNotification: loading
  };
};

export default useHandleNotification;
