import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
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
      enqueueSnackbar(
        intl.formatMessage({
          id: 'gosafe-contact-submit-success',
          defaultMessage: 'Gửi yêu cầu thành công!'
        }),
        { variant: 'success' }
      );
      setFormData({
        fullname: '',
        senderEmail: '',
        phoneNumber: '',
        companyName: '',
        subject: '',
        content: ''
      });
    } catch {
      enqueueSnackbar(
        intl.formatMessage({ id: 'gosafe-contact-submit-error', defaultMessage: 'Có lỗi xảy ra.' }),
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const borderColor = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08);
  const inputBg = isDark ? alpha('#fff', 0.05) : '#F9FAFB';
  const cardBg = isDark ? alpha(theme.palette.background.default, 0.01) : '#fff';

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: inputBg,
      transition: 'all 0.2s ease',
      '& fieldset': {
        borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
        borderWidth: '1px'
      },
      '&:hover fieldset': { borderColor: alpha(primaryColor, 0.5) },
      '&.Mui-focused': {
        bgcolor: isDark ? alpha('#fff', 0.08) : '#fff',
        boxShadow: `0 4px 10px ${alpha(primaryColor, 0.1)}`,
        '& fieldset': { borderColor: primaryColor }
      }
    },
    '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
    '& .MuiInputLabel-root.Mui-focused': { color: primaryColor }
  };

  const contactItems = [
    {
      icon: <Location size={24} variant="Bold" />,
      titleKey: 'gosafe-contact-info-address',
      titleDefault: 'Địa chỉ',
      contentKey: 'gosafe-contact-info-address-value',
      contentDefault: '614 (Lầu 3) Điện Biên Phủ, Phường Vườn Lài, TP. Hồ Chí Minh'
    },
    {
      icon: <Call size={24} variant="Bold" />,
      titleKey: 'gosafe-contact-info-phone',
      titleDefault: 'Số điện thoại',
      contentKey: 'gosafe-contact-info-phone-value',
      contentDefault: '(84.28) 38331106 ',
      isLink: true,
      href: 'tel:0901418053'
    },
    {
      icon: <Sms size={24} variant="Bold" />,
      titleKey: 'gosafe-contact-info-email',
      titleDefault: 'Email',
      contentKey: 'gosafe-contact-info-email-value',
      contentDefault: 'vtctelecom1999@gmail.com',
      isLink: true,
      href: 'mailto:vtctelecom1999@gmail.com'
    }
  ];

  return (
    /* gs-contact: position relative, overflow hidden */
    <Box
      id="contact"
      className="gs-contact"
      sx={{ py: { xs: 10, md: 16 }, bgcolor: isDark ? 'transparent' : alpha(secondaryColor, 0.02) }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* gs-contact-card: border-radius 20px, overflow hidden, backdrop-filter blur(20px) */}
        <Box
          className="gs-contact-card"
          sx={{
            bgcolor: cardBg,
            border: `1px solid ${borderColor}`,
            boxShadow: isDark
              ? `0 20px 40px -10px ${alpha('#000', 0.5)}`
              : `0 30px 60px -20px ${alpha(primaryColor, 0.1)}`
          }}
        >
          <Grid container>
            {/* Left column */}
            <Grid item xs={12} md={5} sx={{ borderRight: { md: `1px solid ${borderColor}` } }}>
              <Stack
                sx={{
                  height: '100%',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: { xs: 3, md: 6 }
                }}
              >
                <Box>
                  {/* gs-contact-badge: font-weight, letter-spacing, uppercase, display block */}
                  <Typography className="gs-contact-badge" sx={{ color: primaryColor }}>
                    <FormattedMessage id="gosafe-contact-badge" defaultMessage="GET IN TOUCH" />
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    sx={{ mb: 2, color: theme.palette.text.primary }}
                  >
                    <FormattedMessage id="gosafe-contact-title" defaultMessage="Liên hệ tư vấn" />
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.7,
                      fontSize: '1.05rem'
                    }}
                  >
                    <FormattedMessage
                      id="gosafe-contact-desc"
                      defaultMessage="Hãy để lại thông tin, đội ngũ chuyên gia của VTC Telecom sẽ liên hệ giải đáp mọi thắc mắc của bạn."
                    />
                  </Typography>
                </Box>

                <Stack spacing={3} sx={{ mt: 2 }}>
                  {contactItems.map((item, i) => (
                    <Stack key={i} direction="row" spacing={2.5} alignItems="flex-start">
                      {/* gs-contact-icon: padding, border-radius 12px, flex, margin-top 4px */}
                      <Box
                        className="gs-contact-icon"
                        sx={{ bgcolor: alpha(primaryColor, 0.1), color: primaryColor }}
                      >
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color="text.primary"
                          sx={{ mb: 0.5 }}
                        >
                          <FormattedMessage id={item.titleKey} defaultMessage={item.titleDefault} />
                        </Typography>
                        {item.isLink ? (
                          /* gs-contact-link: no text-decoration, color transition */
                          <Typography
                            component="a"
                            href={item.href}
                            variant="body2"
                            className="gs-contact-link"
                            sx={{
                              color: theme.palette.text.secondary,
                              '&:hover': { color: primaryColor }
                            }}
                          >
                            {item.contentDefault}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            <FormattedMessage
                              id={item.contentKey}
                              defaultMessage={item.contentDefault}
                            />
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Grid>

            {/* Right column — form */}
            <Grid item xs={12} md={7} sx={{ p: { xs: 3, md: 6 } }}>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2.5}>
                  {[
                    {
                      label: 'gosafe-contact-form-fullname',
                      def: 'Họ và tên',
                      ph: 'gosafe-contact-form-fullname-placeholder',
                      phDef: 'Nguyễn Văn A',
                      name: 'fullname',
                      val: formData.fullname,
                      req: true
                    },
                    {
                      label: 'gosafe-contact-form-email',
                      def: 'Email',
                      ph: 'gosafe-contact-form-email-placeholder',
                      phDef: 'email@domain.com',
                      name: 'senderEmail',
                      val: formData.senderEmail,
                      type: 'email',
                      req: true
                    },
                    {
                      label: 'gosafe-contact-form-phone',
                      def: 'Số điện thoại',
                      ph: 'gosafe-contact-form-phone-placeholder',
                      phDef: '0901 418 053',
                      name: 'phoneNumber',
                      val: formData.phoneNumber,
                      req: true
                    },
                    {
                      label: 'gosafe-contact-form-company',
                      def: 'Công ty',
                      ph: 'gosafe-contact-form-company-placeholder',
                      phDef: 'Tên doanh nghiệp',
                      name: 'companyName',
                      val: formData.companyName
                    }
                  ].map((f) => (
                    <Grid item xs={12} sm={6} key={f.name}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        sx={{ mb: 1, color: theme.palette.text.primary }}
                      >
                        <FormattedMessage id={f.label} defaultMessage={f.def} />
                        {f.req && <span className="gs-required"> *</span>}
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder={intl.formatMessage({ id: f.ph, defaultMessage: f.phDef })}
                        name={f.name}
                        type={(f as any).type}
                        value={f.val}
                        onChange={handleInputChange}
                        required={f.req}
                        variant="outlined"
                        sx={inputSx}
                      />
                    </Grid>
                  ))}

                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{ mb: 1, color: theme.palette.text.primary }}
                    >
                      <FormattedMessage id="gosafe-contact-form-subject" defaultMessage="Tiêu đề" />
                      <span className="gs-required"> *</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder={intl.formatMessage({
                        id: 'gosafe-contact-form-subject-placeholder',
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
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{ mb: 1, color: theme.palette.text.primary }}
                    >
                      <FormattedMessage
                        id="gosafe-contact-form-content"
                        defaultMessage="Nội dung"
                      />
                      <span className="gs-required"> *</span>
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder={intl.formatMessage({
                        id: 'gosafe-contact-form-content-placeholder',
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
                      component={motion.button}
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading}
                      endIcon={!loading && <Send2 variant="Bold" />}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      /* gs-submit-btn: border-radius, font-size, font-weight */
                      className="gs-submit-btn"
                      sx={{
                        mt: 2,
                        py: 1.8,
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        color: 'white',
                        textTransform: 'none',
                        boxShadow: `0 8px 20px ${alpha(primaryColor, 0.3)}`,
                        '&:hover': { boxShadow: `0 12px 30px ${alpha(primaryColor, 0.4)}` },
                        '&.Mui-disabled': { background: '#e0e0e0', color: '#9e9e9e' }
                      }}
                    >
                      {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={20} color="inherit" thickness={5} />
                          <FormattedMessage
                            id="gosafe-contact-form-sending"
                            defaultMessage="Đang gửi..."
                          />
                        </Box>
                      ) : (
                        <FormattedMessage
                          id="gosafe-contact-form-submit"
                          defaultMessage="Gửi yêu cầu ngay"
                        />
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
