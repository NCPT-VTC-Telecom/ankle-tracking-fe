import { alpha, Box, Paper, Typography, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import { CloseCircle, InfoCircle, Warning2 } from 'iconsax-react';
import { NotificationDataInterface, NotificationType } from 'shared/types';

interface Props {
  notification: NotificationDataInterface;
  onClickNotification: (notification: NotificationDataInterface) => void;
}

const NotificationItem = ({ notification, onClickNotification }: Props) => {
  const isUnread = !notification.is_read;
  const theme = useTheme();

  const iconMap: Record<NotificationType, { icon: React.ElementType; color: string; bgColor: string }> = {
    error: { icon: CloseCircle, color: '#F04438', bgColor: 'bg-red-100' },
    warning: { icon: Warning2, color: '#F79009', bgColor: 'bg-yellow-100' },
    info: { icon: InfoCircle, color: '#2E90FA', bgColor: 'bg-blue-100' }
  };

  const getIconByType = (type: NotificationType) => {
    const { icon: Icon, color } = iconMap[type] || iconMap.info;
    return <Icon size={24} variant="Bold" color={color} />;
  };

  const unreadBg = theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.15);

  const readBg = theme.palette.background.paper;

  const unreadBorder = alpha(theme.palette.primary.main, 0.1);
  const readBorder = theme.palette.divider;
  const iconBg = isUnread ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.text.primary, 0.08);

  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  return (
    <Paper
      onClick={() => onClickNotification(notification)}
      elevation={0}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        p: 2,
        mb: 2,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.3s ease-out',
        bgcolor: isUnread ? unreadBg : readBg,
        borderLeft: isUnread ? `4px solid ${theme.palette.primary.main}` : `1px solid ${readBorder}`,
        border: `1px solid ${isUnread ? unreadBorder : readBorder}`,
        '&:hover': {
          bgcolor: isUnread ? alpha(theme.palette.primary.main, 0.15) : theme.palette.action.hover,
          borderColor: isUnread ? theme.palette.primary.main : theme.palette.divider
        }
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: '50%',
          bgcolor: iconBg,
          flexShrink: 0,
          transition: 'background-color 0.3s'
        }}
      >
        {getIconByType(notification.type)}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={600} color={textPrimary} noWrap sx={{ mb: 0.5 }}>
          {notification.title}
        </Typography>

        <Typography
          variant="body1"
          color={textSecondary}
          sx={{
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {notification.content}
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          {dayjs(notification.created_date).format('HH:mm DD/MM/YYYY')}
        </Typography>
      </Box>
    </Paper>
  );
};

export default NotificationItem;
