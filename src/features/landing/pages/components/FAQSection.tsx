import { Accordion, AccordionDetails, AccordionSummary, Box, Container, Stack, Typography, alpha, useTheme } from '@mui/material';
import { Add } from 'iconsax-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface FAQ {
  questionKey: string;
  questionDefault: string;
  answerKey: string;
  answerDefault: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const FAQSection = ({ faqs, isDark, primaryColor, secondaryColor }: FAQSectionProps) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Style constants
  const dotColor = isDark ? '#333' : '#e5e5e5';
  // Màu nền khi Active: Sáng hơn nền chung một chút
  const activeBg = isDark ? alpha(primaryColor, 0.1) : '#fff';
  const borderColor = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.06);

  return (
    <Box
      id="faq"
      sx={{
        py: { xs: 10, md: 16 },
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        bgcolor: isDark ? 'transparent' : alpha(secondaryColor, 0.02)
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={8}>
          {/* --- Header --- */}
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.5,
                borderRadius: '20px',
                border: `1px solid ${alpha(primaryColor, 0.3)}`,
                bgcolor: alpha(primaryColor, 0.05)
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: primaryColor, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                SUPPORT
              </Typography>
            </Box>
            <Typography
              component="h2"
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3.5rem' },
                fontWeight: 800,
                color: theme.palette.text.primary,
                lineHeight: 1.2
              }}
            >
              <FormattedMessage id="landing.faq.title" defaultMessage="Câu hỏi thường gặp" />
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: '1.1rem', maxWidth: 600 }}>
              <FormattedMessage
                id="landing.faq.subtitle"
                defaultMessage="Tìm câu trả lời nhanh cho các thắc mắc phổ biến về WiFi Digital."
              />
            </Typography>
          </Stack>

          {/* --- Smooth Accordion List --- */}
          <Stack spacing={2}>
            {' '}
            {/* Dùng Stack spacing thay vì margin bottom từng cái */}
            {faqs.map((faq, index) => {
              const isPanelExpanded = expanded === `panel${index}`;
              return (
                <Accordion
                  key={index}
                  expanded={isPanelExpanded}
                  onChange={handleChange(`panel${index}`)}
                  disableGutters
                  elevation={0}
                  // Tùy chỉnh Transition của MUI cho mượt hơn
                  TransitionProps={{ timeout: 400 }}
                  sx={{
                    bgcolor: isPanelExpanded ? activeBg : 'transparent', // Đổi màu nền khi mở
                    color: theme.palette.text.primary,
                    borderRadius: '16px !important', // Bo góc mềm mại
                    border: `1px solid ${isPanelExpanded ? alpha(primaryColor, 0.3) : borderColor}`,
                    boxShadow: isPanelExpanded ? `0 10px 30px -5px ${alpha(primaryColor, 0.1)}` : 'none',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', // Physics-based transition
                    '&:before': { display: 'none' },
                    '&:hover': {
                      bgcolor: isPanelExpanded ? activeBg : isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                      borderColor: isPanelExpanded ? alpha(primaryColor, 0.3) : alpha(primaryColor, 0.2)
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      // Icon xoay mượt mà thay vì đổi icon
                      <Box
                        sx={{
                          transform: isPanelExpanded ? 'rotate(45deg)' : 'rotate(0deg)',
                          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          color: isPanelExpanded ? primaryColor : theme.palette.text.secondary,
                          display: 'flex'
                        }}
                      >
                        <Add size={28} />
                      </Box>
                    }
                    sx={{
                      px: 3,
                      py: 1,
                      '& .MuiAccordionSummary-content': { my: 1.5 }
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: { xs: '1rem', md: '1.1rem' },
                        fontWeight: 600,
                        color: isPanelExpanded ? primaryColor : theme.palette.text.primary,
                        transition: 'color 0.3s'
                      }}
                    >
                      <FormattedMessage id={faq.questionKey} defaultMessage={faq.questionDefault} />
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                    <Typography
                      sx={{
                        color: theme.palette.text.secondary,
                        lineHeight: 1.7,
                        fontSize: '1rem',
                        // Fade in effect cho text
                        opacity: isPanelExpanded ? 1 : 0,
                        transform: isPanelExpanded ? 'translateY(0)' : 'translateY(-10px)',
                        transition: 'all 0.4s ease 0.1s' // Delay nhẹ để đợi accordion mở ra
                      }}
                    >
                      <FormattedMessage id={faq.answerKey} defaultMessage={faq.answerDefault} />
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default FAQSection;
