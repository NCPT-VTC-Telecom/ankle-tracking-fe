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

  const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const activeBg   = isDark ? alpha(primaryColor, 0.1) : '#fff';
  const borderColor = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.06);

  return (
    /* gs-faq: position:relative, overflow:hidden */
    <Box
      id="faq"
      className="gs-faq"
      sx={{
        py: { xs: 10, md: 16 },
        bgcolor: isDark ? 'transparent' : alpha(secondaryColor, 0.02)
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={8}>

          {/* Header */}
          <Stack spacing={3} alignItems="center" textAlign="center">
            {/* gs-faq__badge: inline-flex, gap, padding, border-radius */}
            <Box
              className="gs-faq__badge"
              sx={{
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
              sx={{ fontSize: { xs: '2rem', md: '3.5rem' }, fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.2 }}
            >
              <FormattedMessage id="landing.faq.title" defaultMessage="Câu hỏi thường gặp" />
            </Typography>

            <Typography sx={{ color: theme.palette.text.secondary, fontSize: '1.1rem', maxWidth: 600 }}>
              <FormattedMessage id="landing.faq.subtitle" defaultMessage="Tìm câu trả lời nhanh cho các thắc mắc phổ biến về WiFi Digital." />
            </Typography>
          </Stack>

          {/* Accordion list */}
          <Stack spacing={2}>
            {faqs.map((faq, index) => {
              const panel = `panel${index}`;
              const isOpen = expanded === panel;

              return (
                <Accordion
                  key={index}
                  expanded={isOpen}
                  onChange={handleChange(panel)}
                  disableGutters
                  elevation={0}
                  TransitionProps={{ timeout: 400 }}
                  /* gs-accordion: border-radius 16px, smooth transition */
                  className="gs-accordion"
                  sx={{
                    bgcolor: isOpen ? activeBg : 'transparent',
                    color: theme.palette.text.primary,
                    border: `1px solid ${isOpen ? alpha(primaryColor, 0.3) : borderColor}`,
                    boxShadow: isOpen ? `0 10px 30px -5px ${alpha(primaryColor, 0.1)}` : 'none',
                    '&:hover': {
                      bgcolor: isOpen ? activeBg : isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                      borderColor: isOpen ? alpha(primaryColor, 0.3) : alpha(primaryColor, 0.2)
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      /* gs-expand-icon: display flex, smooth rotate transition
                         gs-expand-icon--open: rotate(45deg) */
                      <Box
                        className={`gs-expand-icon${isOpen ? ' gs-expand-icon--open' : ''}`}
                        sx={{ color: isOpen ? primaryColor : theme.palette.text.secondary }}
                      >
                        <Add size={28} />
                      </Box>
                    }
                    sx={{ px: 3, py: 1, '& .MuiAccordionSummary-content': { my: 1.5 } }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: { xs: '1rem', md: '1.1rem' },
                        fontWeight: 600,
                        color: isOpen ? primaryColor : theme.palette.text.primary,
                        transition: 'color 0.3s'
                      }}
                    >
                      <FormattedMessage id={faq.questionKey} defaultMessage={faq.questionDefault} />
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                    {/* gs-faq-answer + gs-faq-answer--open / --closed: opacity + translateY transition */}
                    <Typography
                      className={`gs-faq-answer ${isOpen ? 'gs-faq-answer--open' : 'gs-faq-answer--closed'}`}
                      sx={{ color: theme.palette.text.secondary }}
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
