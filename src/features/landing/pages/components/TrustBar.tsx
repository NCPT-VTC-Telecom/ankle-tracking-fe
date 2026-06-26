import { Box, Container, Stack, Typography, alpha, keyframes, useTheme } from '@mui/material';
import vnptLogo from 'assets/images/logos/vnpt.png';
import hoanghaLogo from 'assets/images/logos/hoangha.png';
import kasperskyLogo from 'assets/images/logos/kaspersky.png';
import samsungLogo from 'assets/images/logos/samsung.png';
import vinaphoneLogo from 'assets/images/logos/vinaphone.png';
import acfcLogo from 'assets/images/logos/acfc.png';
import { FormattedMessage } from 'react-intl';

interface TrustBarProps {
  isDark: boolean;
  primaryColor: string;
}

const scrollX = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const TrustBar = ({ isDark, primaryColor }: TrustBarProps) => {
  const theme = useTheme();

  const trustedClients = [
    { name: 'VNPT', logo: vnptLogo },
    { name: 'Hoàng Hà Mobile', logo: hoanghaLogo },
    { name: 'Samsung', logo: samsungLogo },
    { name: 'Kaspersky', logo: kasperskyLogo },
    { name: 'ACFC', logo: acfcLogo },
    { name: 'Vinaphone', logo: vinaphoneLogo }
  ];

  const marqueeList = [...trustedClients, ...trustedClients, ...trustedClients];

  return (
    <Box
      sx={{
        py: 6,
        position: 'relative',
        bgcolor: isDark ? 'transparent' : alpha(primaryColor, 0.02),
        borderBottom: `1px dashed ${alpha(theme.palette.text.primary, 0.1)}`
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4} alignItems="center">
          <Typography
            variant="caption"
            sx={{
              textAlign: 'center',
              color: theme.palette.text.disabled,
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              fontWeight: 700,
              fontSize: '0.75rem',
              display: 'block'
            }}
          >
            <FormattedMessage id="landing.trust.title" defaultMessage="Tin dùng bởi các doanh nghiệp hàng đầu" />
          </Typography>

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              overflow: 'hidden',
              // Gradient mask giúp logo ẩn hiện mượt mà ở 2 cạnh
              maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 6, md: 10 },
                width: 'max-content',
                animation: `${scrollX} 60s linear infinite`,
                py: 2,
                '&:hover': { animationPlayState: 'paused' }
              }}
            >
              {marqueeList.map((client, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minWidth: 120,
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',

                    // --- XỬ LÝ MÀU LOGO ---
                    // Dark Mode: brightness(0) invert(1) -> Biến logo thành màu trắng tinh
                    // Light Mode: grayscale(100%) -> Biến logo thành màu xám đen
                    filter: isDark ? 'brightness(0) invert(1) opacity(0.6)' : '',

                    '&:hover': {
                      transform: 'scale(1.1)',
                      // Hover Dark Mode: Tăng độ rõ (opacity 1), vẫn giữ màu trắng (vì logo gốc màu đen sẽ không hiện được)
                      // Hover Light Mode: Hiện màu gốc (grayscale 0)
                      filter: isDark ? 'brightness(0) invert(1) opacity(1)' : 'grayscale(0%) opacity(1)'
                    }
                  }}
                >
                  <img
                    src={client.logo}
                    alt={client.name}
                    style={{
                      maxWidth: '140px',
                      maxHeight: '45px',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default TrustBar;
