import React from 'react';
import { Card, CardContent, Stack, Typography, Box } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

export default function StatCard({ title, value, subtext, icon, color, gradient }: StatCardProps) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 'none',
        border: '1px solid',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? `${gradient}25` : `${gradient}35`),
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${gradient}10 0%, ${gradient}03 100%)`
            : `linear-gradient(135deg, ${gradient}18 0%, ${gradient}05 100%)`,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${gradient}, ${gradient}88)`,
          opacity: 0.95
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => (theme.palette.mode === 'dark' ? `0 12px 30px ${gradient}25` : `0 12px 30px ${gradient}18`),
          borderColor: gradient,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${gradient}18 0%, ${gradient}06 100%)`
              : `linear-gradient(135deg, ${gradient}22 0%, ${gradient}0a 100%)`,
          '& .stat-icon-box': {
            transform: 'scale(1.1) rotate(5deg)',
            boxShadow: `0 8px 24px ${gradient}50`
          }
        }
      }}
    >
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
          <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                fontSize: '0.65rem',
                opacity: 0.85
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: (theme) => (theme.palette.mode === 'dark' ? '#f8fafc' : `${gradient}cc`),
                fontSize: '1.75rem',
                lineHeight: 1.1,
                letterSpacing: -0.5
              }}
            >
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>
              {subtext}
            </Typography>
          </Stack>
          <Box
            className="stat-icon-box"
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              background: `linear-gradient(135deg, ${gradient} 0%, ${gradient}bb 100%)`,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 6px 16px ${gradient}30`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
