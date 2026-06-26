import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import axios, { Canceler } from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useBeforeUnload, useBlocker } from 'react-router-dom';
import axiosServices from 'shared/utils/axios';

interface UseConfirmNavigationProps {
  when: boolean;
  title?: string;
  desc?: string;
}

export const useConfirmNavigation = ({ when, title, desc }: UseConfirmNavigationProps) => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const [retry, setRetry] = useState<null | (() => void)>(null);

  // --- Set lưu tất cả cancel function của request pending ---
  const pendingRequests = useRef<Set<Canceler>>(new Set());

  // --- Patch axiosServices để tự động thêm cancel token ---
  useEffect(() => {
    const requestInterceptor = axiosServices.interceptors.request.use((config) => {
      const source = axios.CancelToken.source();
      config.cancelToken = source.token;
      pendingRequests.current.add(source.cancel!);
      return config;
    });
    const responseInterceptor = axiosServices.interceptors.response.use(
      (res) => {
        // Request thành công → remove khỏi set
        pendingRequests.current.clear();
        return res;
      },
      (err) => {
        // Request lỗi → remove khỏi set
        pendingRequests.current.clear();
        return Promise.reject(err);
      }
    );

    // Cleanup interceptor khi unmount
    return () => {
      axiosServices.interceptors.request.eject(requestInterceptor);
      axiosServices.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // --- Block điều hướng nội bộ ---
  const blocker = useBlocker(when);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setOpen(true);
      setRetry(() => blocker.proceed);
    }
  }, [blocker]);

  // --- Cancel tất cả request pending ---
  const cancelAllRequests = () => {
    pendingRequests.current.forEach((cancel) => cancel('Navigation confirmed, cancel all pending requests'));
    pendingRequests.current.clear();
  };

  // --- Confirm rời đi → cancel request ---
  const handleConfirm = () => {
    if (retry) retry();
    setOpen(false);
    setRetry(null);
    cancelAllRequests();
  };

  // --- Nhấn "stay" → không cancel ---
  const handleCancel = () => {
    blocker.reset?.();
    setOpen(false);
    setRetry(null);
  };

  // --- Chặn reload/close tab ---
  useBeforeUnload(
    useCallback(
      (e) => {
        if (when) {
          e.preventDefault();
          // Không cancel request khi reload/tab close, chỉ cảnh báo
          return title || intl.formatMessage({ id: 'confirm-navigation-title' });
        }
      },
      [when, title, intl]
    )
  );

  const ConfirmDialog = (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{title || intl.formatMessage({ id: 'confirm-navigation-title' })}</DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="textSecondary">
          {desc || intl.formatMessage({ id: 'confirm-navigation-desc' })}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel}>{intl.formatMessage({ id: 'confirm-navigation-stay' })}</Button>
        <Button onClick={handleConfirm} color="primary" variant="contained">
          {intl.formatMessage({ id: 'confirm-navigation-leave' })}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return { ConfirmDialog };
};
