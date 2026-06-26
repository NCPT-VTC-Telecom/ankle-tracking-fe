import { Box, CardContent, Divider, Grid, LinearProgress, Popover, Tooltip, Typography, useMediaQuery } from '@mui/material';
// import { styled } from '@mui/system';
import React, { ReactNode, useState } from 'react';

import { Stack } from '@mui/material';
import { useTheme } from '@mui/system';
import MainCard from 'shared/components/MainCard';
import {
  Category,
  Flash, // APs
  Monitor,
  People, // Guests
  Shield, // Switches
  Wifi
} from 'iconsax-react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { DataDeviceDiagram } from 'shared/types';

interface NetworkComponent {
  key: string;
  icon: ReactNode;
  count: number;
  label: string;
  tooltipContent: ReactNode;
}

interface NetworkDiagramProps {
  data: DataDeviceDiagram;
}

const NetworkDiagram: React.FC<NetworkDiagramProps> = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const handleOpenPopover = (e: React.MouseEvent<HTMLElement>, key: string) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setActiveKey(key);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setActiveKey(null);
  };
  const intl = useIntl();
  const navigate = useNavigate();

  const components: NetworkComponent[] = [
    {
      key: 'gateway',
      icon: (
        <div className="bg-blue-600 p-3 rounded-full inline-block">
          <Shield size={24} className="text-white" />
        </div>
      ),
      count: data?.total_gateway_num || 0,
      label: 'Gateway',
      tooltipContent: (
        <Box
          sx={{
            p: 0,
            backgroundColor: 'background.paper',
            minWidth: 240
          }}
        >
          <Stack spacing={1.5}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h5" sx={{ color: 'text.secondary' }}>
                  Total Devices
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {data?.total_gateway_num || 0}
                </Typography>
              </Box>
            </Box>

            <Divider />

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 400 }}>
                  ● Connected
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {data?.connected_gateway_num || 0}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((data?.connected_gateway_num || 0) / (data?.total_gateway_num || 1)) * 100}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'success.lighter',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'success.main'
                  }
                }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 400 }}>
                  ● Disconnected
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                  {data?.disconnected_gateway_num || 0}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((data?.disconnected_gateway_num || 0) / (data?.total_gateway_num || 1)) * 100}
                sx={{
                  height: 4,
                  mb: 1,
                  borderRadius: 2,
                  backgroundColor: 'error.lighter',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'error.main'
                  }
                }}
              />
            </Box>
          </Stack>
        </Box>
      )
    },
    {
      key: 'switch',
      icon: (
        <div className="bg-purple-600 p-3 rounded-full inline-block">
          <Category size={24} className="text-white" />
        </div>
      ),
      count: data?.total_switch_num || 0,
      label: 'Switches',
      tooltipContent: (
        <Box
          sx={{
            p: 0,
            backgroundColor: 'background.paper',
            minWidth: 280
          }}
        >
          <Stack spacing={1.5}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h5" sx={{ color: 'text.secondary' }}>
                  {intl.formatMessage({ id: 'total-switches' })}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {data?.total_switch_num || 0}
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Connection Status */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 400 }}>
                  ● {intl.formatMessage({ id: 'connect' })}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {data?.connected_switch_num || 0}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((data?.connected_switch_num || 0) / (data?.total_switch_num || 1)) * 100}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'success.lighter',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'success.main'
                  }
                }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 400 }}>
                  ● {intl.formatMessage({ id: 'disconnect' })}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                  {data?.disconnected_switch_num || 0}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((data?.disconnected_switch_num || 0) / (data?.total_switch_num || 1)) * 100}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'error.lighter',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'error.main'
                  }
                }}
              />
            </Box>

            <Divider />

            {/* Port Information */}
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'block' }}>
                PORT INFORMATION
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 400 }}>
                  {intl.formatMessage({ id: 'total-ports' })}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {data?.total_ports || 0}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={100}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  mb: 1
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 400 }}>
                  {intl.formatMessage({ id: 'available-ports' })}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {data?.available_ports || 0}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((data?.available_ports || 0) / (data?.total_ports || 1)) * 100}
                sx={{
                  height: 4,
                  borderRadius: 2
                }}
              />
            </Box>

            <Divider />

            {/* Power Consumption */}
            <MainCard
              content={false}
              sx={{
                p: 1.5,
                backgroundColor: 'background.default',
                borderRadius: 1.5
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }} className="flex items-center gap-1">
                  <Flash size={16} className="text-orange-500" /> {intl.formatMessage({ id: 'power-consumption' })}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {data?.power_consumption || 0}W
                </Typography>
              </Box>
            </MainCard>
          </Stack>
        </Box>
      )
    },
    {
      key: 'ap',
      icon: (
        <div className="bg-green-600 p-3 rounded-full inline-block">
          <Wifi size={24} className="text-white" />
        </div>
      ),
      count: data?.total_ap_num || 0,
      label: 'APs',
      tooltipContent: (
        <Box
          sx={{
            p: 0,
            backgroundColor: 'background.paper',
            minWidth: 280
          }}
        >
          <Stack spacing={1.5}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h5" sx={{ color: 'text.secondary' }}>
                  {intl.formatMessage({ id: 'total-aps' })}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {data?.total_ap_num || 0}
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Connection Status */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 400 }}>
                  ● {intl.formatMessage({ id: 'connect' })}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {data?.connected_ap_num || 0}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((data?.connected_ap_num || 0) / (data?.total_ap_num || 1)) * 100}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'success.lighter',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'success.main'
                  }
                }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 400 }}>
                  ● {intl.formatMessage({ id: 'disconnect' })}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                  {data?.disconnected_ap_num || 0}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((data?.disconnected_ap_num || 0) / (data?.total_ap_num || 1)) * 100}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'error.lighter',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'error.main'
                  }
                }}
              />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h6" sx={{ color: 'warning.main', fontWeight: 400 }}>
                  ● Isolated
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'warning.main' }}>
                  {data?.isolated_ap_num || 0}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((data?.isolated_ap_num || 0) / (data?.total_ap_num || 1)) * 100}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'warning.lighter',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'warning.main'
                  }
                }}
              />
            </Box>

            {/* Summary Card */}
            <MainCard
              content={false}
              sx={{
                p: 1.5,
                backgroundColor: 'background.default',
                borderRadius: 1.5
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'block' }}>
                ACCESS POINTS SUMMARY
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main', fontSize: '1rem' }}>
                      {data?.connected_ap_num || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Online
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main', fontSize: '1rem' }}>
                      {data?.disconnected_ap_num || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Offline
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main', fontSize: '1rem' }}>
                      {data?.isolated_ap_num || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Isolated
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </MainCard>
          </Stack>
        </Box>
      )
    },
    {
      key: 'clients',
      icon: (
        <div className="bg-orange-600 p-3 rounded-full inline-block">
          <Monitor size={24} className="text-white" />
        </div>
      ),
      count: data?.total_client_num || 0,
      label: 'Clients',
      tooltipContent: (
        <Box
          sx={{
            p: 0,
            backgroundColor: 'background.paper',
            minWidth: 280
          }}
        >
          <Stack spacing={1.5}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h5" sx={{ color: 'text.secondary' }}>
                  {intl.formatMessage({ id: 'total-client' })}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {data?.total_client_num || 0}
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Client Types */}
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'block' }}>
                CONNECTION TYPE
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h6" sx={{ color: 'info.main', fontWeight: 400 }}>
                  ● {intl.formatMessage({ id: 'wired-client' })}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
                  {data?.wired_client_num || 0}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((data?.wired_client_num || 0) / (data?.total_client_num || 1)) * 100}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'info.lighter',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'info.main'
                  },
                  mb: 1
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 400 }}>
                  ● {intl.formatMessage({ id: 'wireless-client' })}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {data?.wireless_client_num || 0}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((data?.wireless_client_num || 0) / (data?.total_client_num || 1)) * 100}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'primary.lighter',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'primary.main'
                  }
                }}
              />
            </Box>

            <Divider />

            {/* Summary Card */}
            <MainCard
              content={false}
              sx={{
                p: 1.5,
                backgroundColor: 'background.default',
                borderRadius: 1.5
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'block' }}>
                CLIENT DISTRIBUTION
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main', fontSize: '1rem' }}>
                      {data?.wired_client_num || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Wired
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>
                      ({(((data?.wired_client_num || 0) / (data?.total_client_num || 1)) * 100).toFixed(1)}%)
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1rem' }}>
                      {data?.wireless_client_num || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Wireless
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>
                      ({(((data?.wireless_client_num || 0) / (data?.total_client_num || 1)) * 100).toFixed(1)}%)
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </MainCard>
          </Stack>
        </Box>
      )
    },
    {
      key: 'guests',
      icon: (
        <div className="bg-pink-600 p-3 rounded-full inline-block">
          <People size={24} className="text-white" />
        </div>
      ),
      count: data?.guest_num || 0,
      label: 'Guests',
      tooltipContent: (
        <Box
          sx={{
            p: 0,
            backgroundColor: 'background.paper',
            minWidth: 280
          }}
        >
          <Stack spacing={1.5}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h5" sx={{ color: 'text.secondary' }}>
                  {intl.formatMessage({ id: 'total-guest' })}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {data?.guest_num || 0}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      )
    }
  ];

  return (
    <>
      <Grid container spacing={3}>
        {components.map((component) => (
          <Grid item xs={12} sm={2.4} key={component.key}>
            <MainCard
              content={false}
              onClick={() => {
                if (component.key === 'ap' || component.key === 'switch') {
                  navigate(`/device-management/device-list?type-optional=${component.key}`);
                }
                if (component.key === 'clients') {
                  navigate(`/network-management/ssid-client-overview`);
                }
              }}
              className={`shadow-sm
          cursor-pointer transition-all duration-300 
          rounded-xl overflow-hidden
        `}
            >
              <CardContent className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {component.icon}
                  <Typography variant="h5" sx={{ color: 'text.secondary' }} className={` font-medium`}>
                    {component.label}
                  </Typography>
                </div>

                {isMobile ? (
                  <>
                    <Typography
                      variant="h3"
                      className="font-bold w-fit mt-5 hover:underline cursor-pointer"
                      onClick={(e) => handleOpenPopover(e, component.key)}
                    >
                      {component.count}
                    </Typography>
                    <Popover
                      open={activeKey === component.key}
                      anchorEl={anchorEl}
                      onClose={(e: any, reason) => {
                        if (reason === 'backdropClick') {
                          e.stopPropagation?.();
                        }
                        handleClosePopover();
                      }}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                      slotProps={{
                        paper: {
                          onClick: (e) => e.stopPropagation()
                        }
                      }}
                    >
                      <div className="p-3 max-w-xs text-sm text-gray-700">{component.tooltipContent}</div>
                    </Popover>
                  </>
                ) : (
                  <Tooltip
                    onClick={(e) => e.stopPropagation()}
                    title={component.tooltipContent}
                    arrow
                    placement="top"
                    componentsProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: 'background.paper',
                          boxShadow: 3,
                          p: 1.5,
                          borderRadius: 2
                        }
                      }
                    }}
                  >
                    <Typography variant="h3" className="font-bold w-fit mt-5 hover:underline">
                      {component.count}
                    </Typography>
                  </Tooltip>
                )}
              </CardContent>
            </MainCard>
          </Grid>
        ))}
      </Grid>
    </>
    // </Box >
  );
};

export default NetworkDiagram;
