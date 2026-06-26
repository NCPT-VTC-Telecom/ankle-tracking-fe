import { useCallback, useState } from 'react';
import { IncidentFeedback } from 'shared/types/incidentFeedback';
import { QueryParam } from 'shared/types/query';

export interface IncidentFeedbackQuery extends QueryParam {}

interface IncidentFeedbackProps {
  initQuery: IncidentFeedbackQuery;
}

const incidentFeedbacks = [
  {
    title: 'System not responding',
    type: 'System Error',
    content: 'Users are unable to log into the system since 8 AM.',
    receivedAt: '2025-06-08T09:15:00',
    sender: 'Nguyen Van A',
    status: 'resolved'
  },
  {
    title: 'Incorrect order information',
    type: 'Data Issue',
    content: 'Order shows incorrect total after applying promotion.',
    receivedAt: '2025-06-07T14:45:00',
    sender: 'Tran Thi B',
    status: 'resolved'
  },
  {
    title: 'Unable to download attachment',
    type: 'UI Bug',
    content: 'Clicking the download button does nothing or throws error.',
    receivedAt: '2025-06-06T10:30:00',
    sender: 'Le Van C',
    status: 'resolved'
  },
  {
    title: 'Slow request processing',
    type: 'Performance',
    content: 'Search requests take more than 10 seconds to respond.',
    receivedAt: '2025-06-05T16:00:00',
    sender: 'Pham Thi D',
    status: 'resolved'
  },
  {
    title: 'Confirmation email not sent',
    type: 'Integration',
    content: 'Registration confirmation emails are not being delivered.',
    receivedAt: '2025-06-04T11:20:00',
    sender: 'Dang Van E',
    status: 'unresolved'
  }
];

export const useHandleIncidentFeedback = ({ initQuery }: IncidentFeedbackProps) => {
  const [data, setData] = useState<IncidentFeedback[]>([]);
  const [query, setQuery] = useState<IncidentFeedbackQuery>(initQuery);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchIncidentFeedback = useCallback(
    async (newQuery?: IncidentFeedbackQuery) => {
      try {
        setLoading(true);
        // const { data } = await incidentFeedbackApi.findAll(newQuery ?? query);
        // setTotal(data.total);
        // setTotalPages(data.totalPages);
        setTotal(0);
        setTotalPages(0);
        // setData(data.data);
        setData(incidentFeedbacks);
        // return data.data;
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  return {
    incidentFeedbacks: data,
    totalIncidentFeedback: total,
    totalPages,
    fetchIncidentFeedback,
    queryIncidentFeedback: query,
    setQueryIncidentFeedback: setQuery,
    loadingIncidentFeedback: loading
  };
};
