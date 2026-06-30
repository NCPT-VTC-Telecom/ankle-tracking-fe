import { Badge, Box, CircularProgress, ClickAwayListener, List, Paper, Popper, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { notificationApi } from 'shared/api/notification.api';
import Transitions from 'shared/components/@extended/Transitions';
import MainCard from 'shared/components/MainCard';
import NotificationItem from 'shared/components/molecules/notification/NotificationItem';
import useHandleNotification from 'shared/hooks/useHandleNotification';
import { Notification } from 'iconsax-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { RootState } from 'shared/store';
import { NotificationDataInterface } from 'shared/types';

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

const pageSize = 5;

const NotificationPage = () => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.authSlice.user);

  const userGroupIds = useMemo(() => {
    if (!user) return [];
    const groupLv2 = user.user_group_lv2 || [];
    const groupLv3 = user.user_group_lv3 || [];
    return [...groupLv2, ...groupLv3].map((item) => item.group_id);
  }, [user]);

  const anchorRef = useRef<any>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const [open, setOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { queryNotification, fetchNotification, loadingNotification, notifications, unreadCount, setUnreadCount, setDataNotification } =
    useHandleNotification({
      initQuery: {
        page: 1,
        pageSize,
        groupId: userGroupIds.length > 0 ? JSON.stringify(userGroupIds) : undefined
      }
    });

  const handleToggle = () => setOpen((prev) => !prev);
  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  const loadNotifications = useCallback(
    async (page: number) => {
      if (!hasMore || loadingNotification) return;
      const newNotifications = await fetchNotification({ ...queryNotification, page });

      setDataNotification((prev) => [...prev, ...newNotifications]);
      if (newNotifications.length < pageSize) setHasMore(false);
    },
    [hasMore, loadingNotification, queryNotification, setDataNotification]
  );

  const handleScroll = useCallback(() => {
    if (!listRef.current || loadingNotification || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      const nextPage = pageIndex + 1;
      setPageIndex(nextPage);
      loadNotifications(nextPage);
    }
  }, [pageIndex, loadingNotification, hasMore, loadNotifications]);

  // Đánh dấu tất cả thông báo (đang tải) là đã đọc. BE hiện chỉ có read(id) → gọi song song
  // cho từng mục chưa đọc, rồi cập nhật state + đưa badge về 0. (Có thể thay bằng endpoint
  // bulk khi BE bổ sung để chính xác cả các mục chưa nạp.)
  const handleMarkAllRead = async () => {
    const unread = notifications.filter((item) => !item.is_read);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map((item) => notificationApi.read(item.id, { is_read: true })));
      setDataNotification((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotificationClick = async (notification: NotificationDataInterface) => {
    try {
      await notificationApi.read(notification.id, { is_read: true });

      // Update state local + giảm badge nếu mục này trước đó chưa đọc
      if (!notification.is_read) setUnreadCount((prev) => Math.max(0, prev - 1));
      setDataNotification((prev) => prev.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item)));

      navigate(notification.navigate_url);
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const initLoad = async () => {
      const newNotifications = await fetchNotification({
        ...queryNotification,
        page: 1
      });
      setDataNotification(newNotifications);
      setPageIndex(1);
      setHasMore(newNotifications.length >= pageSize);
    };

    initLoad();
  }, []);

  // Gắn scroll listener sau khi Popper render
  useEffect(() => {
    if (!open) return;
    let rafId: number;

    const attachScroll = () => {
      if (listRef.current) {
        listRef.current.addEventListener('scroll', handleScroll);
      } else {
        rafId = requestAnimationFrame(attachScroll);
      }
    };

    attachScroll();

    return () => {
      cancelAnimationFrame(rafId);
      listRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, [open, handleScroll]);

  return (
    <Box sx={{ flexShrink: 0 }}>
      <Badge
        badgeContent={unreadCount}
        max={99}
        color="error"
        sx={{
          '& .MuiBadge-badge': {
            top: 3,
            right: 4
          }
        }}
      >
        <Box
          sx={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 44,
            width: 44,
            borderRadius: '50%',
            backdropFilter: 'blur(6px)',
            bgcolor: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(30,30,30,0.8)',
            border: `1px solid ${theme.palette.mode === 'light' ? theme.palette.divider : 'rgba(255,255,255,0.12)'}`,
            boxShadow: theme.palette.mode === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.4)',
            '&:hover': {
              bgcolor: theme.palette.mode === 'light' ? 'rgba(255,255,255,1)' : 'rgba(50,50,50,0.9)',
              boxShadow: theme.palette.mode === 'light' ? '0 2px 6px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.6)'
            }
          }}
          className={'transition-shadow duration-300'}
          onClick={handleToggle}
          ref={anchorRef}
        >
          <Notification size={28} color={theme.palette.primary.main} variant="Bold" />
        </Box>
      </Badge>

      <Popper
        sx={{ px: 2 }}
        placement={'bottom-start'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [{ name: 'offset', options: { offset: [matchesXs ? -5 : 0, 9] } }]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                borderRadius: 1.5,
                width: '100%',
                minWidth: 285,
                maxWidth: 420

                // [theme.breakpoints.down('md')]: { maxWidth: 285 }
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard elevation={0} sx={{ backgroundColor: theme.palette.background.default }} border={false} className="md:w-[400px]">
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h5">
                      <FormattedMessage id="notifications" />
                    </Typography>
                    <Typography
                      variant="h6"
                      onClick={handleMarkAllRead}
                      className="hover:text-primary cursor-pointer hover:underline hover:text-[#4680ff]"
                      sx={{ opacity: unreadCount > 0 ? 1 : 0.5, pointerEvents: unreadCount > 0 ? 'auto' : 'none' }}
                    >
                      <FormattedMessage id="mark-all-read" />
                    </Typography>
                  </Stack>

                  <List
                    ref={listRef}
                    component="nav"
                    sx={{
                      paddingRight: '8px',
                      maxHeight: 400,
                      overflowY: 'auto',
                      '& .MuiListItemButton-root': {
                        p: 1.5,
                        my: 1.5,
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': { bgcolor: 'primary.lighter', borderColor: theme.palette.primary.light },
                        '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                      }
                    }}
                  >
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} onClickNotification={handleNotificationClick} />
                      ))
                    ) : !loadingNotification ? (
                      <Typography variant="caption" sx={{ textAlign: 'center', p: 2 }}>
                        <FormattedMessage id="no-information-found" />
                      </Typography>
                    ) : null}

                    {loadingNotification && (
                      <Box
                        sx={{
                          position: 'sticky',
                          bottom: 0,
                          py: 1.5,
                          textAlign: 'center',
                          bgcolor: 'transparent'
                        }}
                      >
                        <div className="flex justify-center items-center gap-2">
                          <CircularProgress size={20} />
                          <FormattedMessage id="loading" />
                          ...
                        </div>
                      </Box>
                    )}
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default NotificationPage;
