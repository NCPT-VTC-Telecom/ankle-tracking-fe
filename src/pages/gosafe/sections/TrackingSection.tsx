import { Box, Grid, Tabs, Tab, TextField, Stack, Badge, Typography, Chip } from '@mui/material';
import { Notification, Map as MapIcon, Personalcard, SearchNormal1, Danger } from 'iconsax-react';

import { useTracking } from '../tracking/useTracking';
import TrackingMap from '../tracking/components/TrackingMap';
import DeviceList from '../tracking/components/DeviceList';
import GeofenceList from '../tracking/components/GeofenceList';
import NotificationList from '../tracking/components/NotificationList';
import TrackingDialogs from '../tracking/components/TrackingDialogs';

interface TrackingSectionProps {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

export default function TrackingSection({
  isDark,
  primaryColor,
  secondaryColor
}: TrackingSectionProps) {
  const store = useTracking(isDark, primaryColor, secondaryColor);
  const {
    showAlertOverlay,
    devices,
    geofences,
    deviceViolations,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    statusAlertCount
  } = store;

  return (
    <Box
      className="gs-tracking"
      sx={{ flexGrow: 1, height: 0, bgcolor: isDark ? '#020617' : '#f8fafc' }}
    >
      {/* Pulsing alarm border */}
      {showAlertOverlay && <Box className="gs-alert-border" />}

      {/* Per-device violation banners */}
      {devices
        .filter((d) => deviceViolations[d.id])
        .map((dev) => (
          <Box
            key={dev.id}
            sx={{
              px: 3,
              py: 1,
              bgcolor: '#fef2f2',
              borderBottom: '1px solid #fee2e2',
              zIndex: 1000
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: dev.color }} />
                <Danger size="20" color="#ef4444" variant="Bold" />
                <Typography variant="body2" sx={{ color: '#991b1b', fontWeight: 700 }}>
                  {dev.subject?.fullName ?? dev.name} ({dev.name}) — RA NGOÀI vùng "
                  {geofences.find((g) => g.id === dev.assignedGeofenceId)?.name}"
                </Typography>
              </Stack>
              <Chip
                label="CẢNH BÁO"
                color="error"
                size="small"
                className="gs-blink"
                sx={{ fontWeight: 'bold' }}
              />
            </Stack>
          </Box>
        ))}

      <Grid container sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* ═══ SIDEBAR ══════════════════════════════════════════════════════ */}
        <Grid
          item
          xs={12}
          md={4.5}
          lg={4}
          xl={3.5}
          className="gs-sidebar"
          sx={{
            borderRight: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            bgcolor: isDark ? '#090d1f' : '#ffffff'
          }}
        >
          {/* Search */}
          <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tên, IMEI, phạm nhân..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchNormal1 size="18" style={{ marginRight: 8, color: '#94a3b8' }} />
                ),
                sx: { borderRadius: 3 }
              }}
            />
          </Box>

          {/* Tabs */}
          <Box
            sx={{
              borderBottom: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  minHeight: 46
                },
                '& .Mui-selected': { color: primaryColor }
              }}
            >
              <Tab icon={<Personalcard size="16" />} label="Thiết bị" iconPosition="start" />
              <Tab icon={<MapIcon size="16" />} label="Geofence" iconPosition="start" />
              <Tab
                icon={
                  <Badge
                    badgeContent={
                      statusAlertCount + Object.values(deviceViolations).filter(Boolean).length
                    }
                    color="error"
                    max={9}
                  >
                    <Notification size="16" />
                  </Badge>
                }
                label="Thông báo"
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Tab content panels */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2.5 }}>
            {activeTab === 0 && <DeviceList store={store} />}
            {activeTab === 1 && <GeofenceList store={store} />}
            {activeTab === 2 && <NotificationList store={store} />}
          </Box>
        </Grid>

        {/* ═══ MAP ══════════════════════════════════════════════════════════ */}
        <Grid item xs={12} md={7.5} lg={8} xl={8.5} className="gs-map-panel">
          <TrackingMap store={store} />
        </Grid>
      </Grid>

      {/* All dialogs (Add/Edit Device, Remove, Subject, Assign, GF forms) */}
      <TrackingDialogs store={store} />
    </Box>
  );
}
