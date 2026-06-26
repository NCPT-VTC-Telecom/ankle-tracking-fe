import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Typography, Avatar, Box } from '@mui/material';
import { User } from 'iconsax-react';
import { enqueueSnackbar } from 'notistack';

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  user: any;
  primaryColor: string;
  isDark: boolean;
}

export default function ProfileDialog({ open, onClose, user, primaryColor, isDark }: ProfileDialogProps) {
  const [fullname, setFullname] = useState(user?.fullname || 'GoSafe Administrator');
  const [email, setEmail] = useState(user?.email || 'gosafe_admin@vtctelecom.com.vn');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '0912345678');

  const handleSave = () => {
    enqueueSnackbar('Cập nhật hồ sơ cá nhân thành công!', { variant: 'success' });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: isDark ? '#0f172a' : '#ffffff',
          backgroundImage: 'none',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }
      }}
    >
      <DialogTitle sx={{ p: 2.5, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <User size={22} color={primaryColor} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', fontSize: '1rem' }}>
            Hồ sơ cá nhân
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, py: 1 }}>
        <Stack spacing={3} alignItems="center" sx={{ mt: 1 }}>
          {/* Avatar and Basic Info */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: primaryColor,
                color: '#fff',
                fontSize: '1.8rem',
                fontWeight: 700,
                border: '3px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                boxShadow: `0 0 15px ${primaryColor}40`
              }}
            >
              {fullname
                ? fullname
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'US'}
            </Avatar>
          </Box>

          <Stack spacing={0.3} textAlign="center">
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
              {fullname}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {user?.role || 'Quản trị viên GoSafe'}
            </Typography>
          </Stack>

          {/* Form fields */}
          <Stack spacing={2.5} sx={{ width: '100%', pt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Tên đăng nhập"
                fullWidth
                disabled
                value={user?.username || 'gosafe_admin'}
                size="small"
                sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }}
              />
              <TextField
                label="Họ và tên"
                fullWidth
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                size="small"
                sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Địa chỉ Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="small"
                sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }}
              />
              <TextField
                label="Số điện thoại"
                fullWidth
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                size="small"
                sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Vai trò"
                fullWidth
                disabled
                value={user?.user_group?.name || 'Quản trị viên'}
                size="small"
                sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }}
              />
              <TextField
                label="Đơn vị công tác"
                fullWidth
                disabled
                value="GoSafe Telecom"
                size="small"
                sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }}
              />
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={onClose}
          sx={{ borderRadius: 1.5, fontWeight: 700, px: 3, textTransform: 'none' }}
        >
          Hủy
        </Button>
        <Button variant="contained" onClick={handleSave} sx={{ borderRadius: 1.5, fontWeight: 700, px: 3, textTransform: 'none' }}>
          Lưu thay đổi
        </Button>
      </DialogActions>
    </Dialog>
  );
}
