import React from 'react';
import { Card, CardContent, Stack, Typography, Box, alpha } from '@mui/material';

export interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children }) => {
  return (
    <Card
      elevation={0}
      sx={{
        mb: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`
        }
      }}
    >
      <CardContent className='p-3 md:p-6'>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
          <Typography variant="h5" fontWeight={600} color="text.primary">
            {title}
          </Typography>
        </Stack>

        {children}
      </CardContent>
    </Card>
  );
};

export default React.memo(SectionCard);
