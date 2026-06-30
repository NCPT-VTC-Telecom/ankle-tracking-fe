import { Box, Button, CircularProgress, Container, Grid, Stack, TextField, Typography, alpha, useTheme } from '@mui/material';
import { contactApi } from 'shared/api/contact.api';
import { motion } from 'framer-motion';
import { Call, Location, Send2, Sms } from 'iconsax-react';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

interface ContactSectionProps {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const ContactSection = ({ isDark, primaryColor, secondaryColor }: ContactSectionProps) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    senderEmail: '',
    phoneNumber: '',
    companyName: '',
    subject: '',
    content: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactApi.submit(formData);
      enqueueSnackbar('Gửi yêu cầu thành công!', { variant: 'success' });
      setFormData({ fullname: '', senderEmail: '', phoneNumber: '', companyName: '', subject: '', content: '' });
    } catch (error) {
      enqueueSnackbar('Có lỗi xảy ra.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Style Constants
  const dotColor = isDark ? '#333' : '#e5e5e5';
  const cardBg = isDark ? alpha(theme.palette.background.default, 0.01) : '#fff'; // Nền card trong suốt nhẹ
  const borderColor = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08);
  const inputBg = isDark ? alpha('#fff', 0.05) : '#F9FAFB';

  // Input Style mới: Tối giản, viền mỏng
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: inputBg,
      transition: 'all 0.2s ease',
      '& fieldset': {
        borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
        borderWidth: '1px'
      },
      '&:hover fieldset': {
        borderColor: alpha(primaryColor, 0.5)
      },
      '&.Mui-focused': {
        bgcolor: isDark ? alpha('#fff', 0.08) : '#fff',
        boxShadow: `0 4px 10px ${alpha(primaryColor, 0.1)}`,
        '& fieldset': {
          borderColor: primaryColor
        }
      }
    },
    '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
    '& .MuiInputLabel-root.Mui-focused': { color: primaryColor }
  };

  return (
    <Box
      id="contact"
      sx={{
        py: { xs: 10, md: 16 },
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        bgcolor: isDark ? 'transparent' : alpha(secondaryColor, 0.02)
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            bgcolor: cardBg,
            borderRadius: 5,
            overflow: 'hidden',
            border: `1px solid ${borderColor}`,
            backdropFilter: 'blur(20px)', // Kính mờ mạnh hơn
            boxShadow: isDark ? `0 20px 40px -10px ${alpha('#000', 0.5)}` : `0 30px 60px -20px ${alpha(primaryColor, 0.1)}`
          }}
        >
          <Grid container>
            {/* --- LEFT COLUMN: Text Info (Clean) --- */}
            <Grid
              item
              xs={12}
              md={5}
              sx={{
                borderRight: {
                  md: `1px solid ${borderColor}`
                }
              }}
            >
              <Stack
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: { xs: 3, md: 6 } }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: primaryColor, letterSpacing: 1.5, textTransform: 'uppercase', mb: 1, display: 'block' }}
                  >
                    <FormattedMessage id="landing.contact.badge" defaultMessage="GET IN TOUCH" />
                  </Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ mb: 2, color: theme.palette.text.primary }}>
                    <FormattedMessage id="landing.contact.title" defaultMessage="Liên hệ tư vấn" />
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.7, fontSize: '1.05rem' }}>
                    <FormattedMessage
                      id="landing.contact.desc"
                      defaultMessage="Hãy để lại thông tin, đội ngũ chuyên gia của VTC Telecom sẽ liên hệ giải đáp mọi thắc mắc của bạn."
                    />
                  </Typography>
                </Box>

                <Stack spacing={3} sx={{ mt: 2 }}>
                  {[
                    {
                      icon: <Location size={24} variant="Bold" />,
                      titleKey: 'landing.contact.info.address',
                      titleDefault: 'Địa chỉ',
                      contentKey: 'landing.contact.info.address.value',
                      contentDefault: '614 (Lầu 3) Điện Biên Phủ, Phường Vườn Lài, TP. Hồ Chí Minh'
                    },
                    {
                      icon: <Call size={24} variant="Bold" />,
                      titleKey: 'landing.contact.info.phone',
                      titleDefault: 'Số điện thoại',
                      contentKey: 'landing.contact.info.phone.value',
                      contentDefault: '(84.28) 38331106',
                      isLink: true,
                      href: 'tel:+842838331106'
                    },
                    {
                      icon: <Sms size={24} variant="Bold" />,
                      titleKey: 'landing.contact.info.email',
                      titleDefault: 'Email',
                      contentKey: 'landing.contact.info.email.value',
                      contentDefault: 'gosafe@vtctelecom.com.vn',
                      isLink: true,
                      href: 'mailto:gosafe@vtctelecom.com.vn'
                    }
                  ].map((item, index) => (
                    <Stack key={index} direction="row" spacing={2.5} alignItems="flex-start">
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: '12px',
                          bgcolor: alpha(primaryColor, 0.1),
                          color: primaryColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mt: 0.5 // Căn chỉnh icon với dòng đầu tiên của text
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                          <FormattedMessage id={item.titleKey} defaultMessage={item.titleDefault} />
                        </Typography>
                        {item.isLink ? (
                          <Typography
                            component="a"
                            href={item.href}
                            variant="body2"
                            sx={{
                              color: theme.palette.text.secondary,
                              textDecoration: 'none',
                              transition: 'color 0.2s',
                              '&:hover': { color: primaryColor }
                            }}
                          >
                            {item.contentDefault}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            <FormattedMessage id={item.contentKey} defaultMessage={item.contentDefault} />
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Grid>

            {/* --- RIGHT COLUMN: Form (Minimalist) --- */}
            <Grid item xs={12} md={7} sx={{ p: { xs: 3, md: 6 } }}>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: theme.palette.text.primary }}>
                      <FormattedMessage id="landing.contact.form.fullname" defaultMessage="Họ và tên" />{' '}
                      <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder={intl.formatMessage({
                        id: 'landing.contact.form.fullname.placeholder',
                        defaultMessage: 'Nguyễn Văn A'
                      })}
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: theme.palette.text.primary }}>
                      <FormattedMessage id="landing.contact.form.email" defaultMessage="Email" /> <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder={intl.formatMessage({
                        id: 'landing.contact.form.email.placeholder',
                        defaultMessage: 'email@domain.com'
                      })}
                      name="senderEmail"
                      type="email"
                      value={formData.senderEmail}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: theme.palette.text.primary }}>
                      <FormattedMessage id="landing.contact.form.phone" defaultMessage="Số điện thoại" />{' '}
                      <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder={intl.formatMessage({
                        id: 'landing.contact.form.phone.placeholder',
                        defaultMessage: '(84.28) 38331106'
                      })}
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: theme.palette.text.primary }}>
                      <FormattedMessage id="landing.contact.form.company" defaultMessage="Công ty" />
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder={intl.formatMessage({
                        id: 'landing.contact.form.company.placeholder',
                        defaultMessage: 'Tên doanh nghiệp'
                      })}
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      variant="outlined"
                      sx={inputSx}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: theme.palette.text.primary }}>
                      <FormattedMessage id="landing.contact.form.subject" defaultMessage="Tiêu đề" />{' '}
                      <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder={intl.formatMessage({
                        id: 'landing.contact.form.subject.placeholder',
                        defaultMessage: 'Vấn đề cần hỗ trợ / Yêu cầu báo giá'
                      })}
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      sx={inputSx}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: theme.palette.text.primary }}>
                      <FormattedMessage id="landing.contact.form.content" defaultMessage="Nội dung" />{' '}
                      <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder={intl.formatMessage({
                        id: 'landing.contact.form.content.placeholder',
                        defaultMessage: 'Chi tiết nội dung bạn cần tư vấn...'
                      })}
                      name="content"
                      multiline
                      rows={4}
                      value={formData.content}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      sx={inputSx}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      component={motion.button} // <--- 1. Biến button thường thành button có animation
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading}
                      endIcon={!loading && <Send2 variant="Bold" />}
                      whileHover={{  y: -2 }}
                      whileTap={{ scale: 0.95 }} 
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }} 
                      sx={{
                        mt: 2,
                        py: 1.8,
                        fontSize: '1rem',
                        fontWeight: 700,
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        color: 'white',
                        textTransform: 'none',
                        borderRadius: 3,
                        boxShadow: `0 8px 20px ${alpha(primaryColor, 0.3)}`,

                        // 3. CSS chỉ còn lo việc đổi màu Shadow, bỏ transition/transform đi vì Framer đã lo
                        '&:hover': {
                          boxShadow: `0 12px 30px ${alpha(primaryColor, 0.4)}`
                        },
                        // Thêm style khi disable để nút trông đẹp hơn
                        '&.Mui-disabled': {
                          background: '#e0e0e0',
                          color: '#9e9e9e'
                        }
                      }}
                    >
                      {loading ? (
                        // 4. Trạng thái Loading có Spinner xoay tròn
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={20} color="inherit" thickness={5} />
                          <FormattedMessage id="landing.contact.form.sending" defaultMessage="Đang gửi..." />
                        </Box>
                      ) : (
                        <FormattedMessage id="landing.contact.form.submit" defaultMessage="Gửi yêu cầu ngay" />
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default ContactSection;
